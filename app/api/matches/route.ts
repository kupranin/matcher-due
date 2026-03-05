import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getEmployerCompanyFromSession, vacancyBelongsToEmployerCompany } from "@/lib/employerAuth";
import { computeMatchScore } from "@/lib/matchScore";

const LOG_PREFIX = "[matches]";

/**
 * POST /api/matches — record a like (candidate or employer). Atomic upsert; match is durable in DB.
 * - Candidate: sends candidateLiked: true; no auth required (match is by vacancyId + candidateProfileId).
 * - Employer: sends employerLiked: true; vacancy must belong to employer's company.
 * - Returns hasMatch: true only when both sides have liked (mutual); client must show match only then.
 */
export async function POST(request: Request) {
  const reqId = `req-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  try {
    const body = await request.json().catch(() => ({}));
    const vacancyId = typeof body?.vacancyId === "string" ? body.vacancyId.trim() : "";
    const candidateProfileId = typeof body?.candidateProfileId === "string" ? body.candidateProfileId.trim() : "";
    const candidateLiked = Boolean(body?.candidateLiked);
    const employerLiked = Boolean(body?.employerLiked);

    if (!vacancyId || !candidateProfileId) {
      return NextResponse.json({ error: "vacancyId and candidateProfileId required" }, { status: 400 });
    }

    if (employerLiked) {
      const ctx = await getEmployerCompanyFromSession(request);
      if (!ctx) {
        return NextResponse.json({ error: "Sign in as employer to like a candidate" }, { status: 401 });
      }
      const allowed = await vacancyBelongsToEmployerCompany(vacancyId, ctx.companyId);
      if (!allowed) {
        return NextResponse.json({ error: "Vacancy does not belong to your company" }, { status: 403 });
      }
    }

    const [candidate, vacancy] = await Promise.all([
      prisma.candidateProfile.findUnique({
        where: { id: candidateProfileId },
        include: { skills: true },
      }),
      prisma.vacancy.findUnique({
        where: { id: vacancyId },
        include: { skills: true },
      }),
    ]);

    let matchScore: number | null = null;
    if (candidate && vacancy) {
      matchScore = computeMatchScore(
        {
          locationCityId: candidate.locationCityId,
          salaryMin: candidate.salaryMin,
          willingToRelocate: candidate.willingToRelocate,
          experienceMonths: candidate.experienceMonths,
          educationLevel: candidate.educationLevel,
          workTypes: candidate.workTypes,
          skills: candidate.skills.map((s) => ({ name: s.name, level: s.level })),
        },
        {
          locationCityId: vacancy.locationCityId,
          salaryMax: vacancy.salaryMax,
          isRemote: vacancy.isRemote,
          requiredExperienceMonths: vacancy.requiredExperienceMonths,
          requiredEducationLevel: vacancy.requiredEducationLevel,
          workType: vacancy.workType,
          skills: vacancy.skills.map((s) => ({ name: s.name, level: s.level, weight: s.weight })),
        }
      );
    }

    const existing = await prisma.match.findUnique({
      where: { vacancyId_candidateProfileId: { vacancyId, candidateProfileId } },
    });
    const didFindCounterLike = existing
      ? (candidateLiked && existing.employerLiked) || (employerLiked && existing.candidateLiked)
      : false;

    const match = await prisma.$transaction(async (tx) => {
      const updated = await tx.match.upsert({
        where: {
          vacancyId_candidateProfileId: { vacancyId, candidateProfileId },
        },
        update: {
          ...(employerLiked && { employerLiked: true }),
          ...(candidateLiked && { candidateLiked: true }),
          ...(matchScore != null && { matchScore }),
        },
        create: {
          vacancyId,
          candidateProfileId,
          candidateLiked,
          employerLiked,
          matchScore: matchScore ?? undefined,
        },
      });
      const after = await tx.match.findUnique({
        where: { vacancyId_candidateProfileId: { vacancyId, candidateProfileId } },
      });
      return after ?? updated;
    });

    const verify = await prisma.match.findUnique({
      where: { vacancyId_candidateProfileId: { vacancyId, candidateProfileId } },
    });
    if (!verify) {
      console.error(`${LOG_PREFIX} CRITICAL verify failed after commit reqId=${reqId} vacancyId=${vacancyId} candidateProfileId=${candidateProfileId}`);
      return NextResponse.json({ error: "Failed to save like" }, { status: 500 });
    }

    const hasMatch = Boolean(verify.candidateLiked && verify.employerLiked);
    console.info(
      JSON.stringify({
        tag: LOG_PREFIX,
        reqId,
        vacancyId,
        candidateProfileId,
        candidateLiked,
        employerLiked,
        didFindCounterLike: didFindCounterLike || hasMatch,
        matchId: verify.id,
        hasMatch,
        committed: true,
      })
    );

    return NextResponse.json({
      id: verify.id,
      candidateLiked: verify.candidateLiked,
      employerLiked: verify.employerLiked,
      hasMatch,
      createdAt:
        typeof verify.createdAt?.toISOString === "function"
          ? verify.createdAt.toISOString()
          : String(verify.createdAt),
    });
  } catch (e) {
    console.error(`${LOG_PREFIX} Match upsert error reqId=${reqId}`, e);
    return NextResponse.json(
      { error: "Failed to save like", hint: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}

/**
 * GET /api/matches
 * - ?candidateProfileId= : candidate's matches (all vacancies they liked / were liked by).
 * - No param + employer session: matches for that company's vacancies only (company matches vacancy).
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const candidateProfileId = searchParams.get("candidateProfileId");

    if (candidateProfileId) {
      const list = await prisma.match.findMany({
        where: { candidateProfileId },
        include: {
          vacancy: { include: { company: { select: { name: true } } } },
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(
        list.map((m) => ({
          id: m.id,
          vacancyId: m.vacancyId,
          candidateProfileId: m.candidateProfileId,
          candidateLiked: m.candidateLiked,
          employerLiked: m.employerLiked,
          candidatePitch: m.candidatePitch,
          matchScore: m.matchScore ?? undefined,
          createdAt: m.createdAt.toISOString(),
          vacancyTitle: m.vacancy.title,
          company: m.vacancy.company.name,
        }))
      );
    }

    const ctx = await getEmployerCompanyFromSession(request);
    if (!ctx) {
      return NextResponse.json([]);
    }

    const list = await prisma.match.findMany({
      where: { vacancy: { companyId: ctx.companyId } },
      include: {
        vacancy: { select: { title: true }, include: { company: { select: { name: true } } } },
        candidateProfile: { select: { id: true, fullName: true, jobTitle: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(
      list.map((m) => ({
        id: m.id,
        vacancyId: m.vacancyId,
        candidateProfileId: m.candidateProfileId,
        candidateLiked: Boolean(m.candidateLiked),
        employerLiked: Boolean(m.employerLiked),
        candidatePitch: m.candidatePitch,
        matchScore: m.matchScore ?? undefined,
        createdAt: m.createdAt.toISOString(),
        vacancyTitle: m.vacancy?.title ?? "",
        company: m.vacancy?.company?.name ?? "",
        candidateName: m.candidateProfile?.fullName ?? "Candidate",
        candidateJobTitle: m.candidateProfile?.jobTitle ?? null,
      }))
    );
  } catch (e) {
    console.error("Matches list error:", e);
    return NextResponse.json({ error: "Failed to list matches" }, { status: 500 });
  }
}
