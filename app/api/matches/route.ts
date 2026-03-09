import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getEmployerCompanyFromSession, vacancyBelongsToEmployerCompany } from "@/lib/employerAuth";
import { computeMatchScore } from "@/lib/matchScore";
import { resolveMatchForPair } from "@/lib/resolveMatch";

const LOG_PREFIX = "[matches]";

let dbConfigLogged = false;
function logDbConfigOnce() {
  if (dbConfigLogged) return;
  dbConfigLogged = true;
  const url = process.env.DATABASE_URL ?? "";
  const direct = process.env.DIRECT_URL ?? "";
  const mask = (u: string) => {
    if (!u) return "none";
    try {
      const parsed = new URL(u.replace(/^postgres:\/\//, "https://"));
      const host = parsed.hostname ?? "";
      const projectRef = host.replace(".supabase.co", "").replace(".pooler.supabase.com", "");
      return `host=${host} projectRef=${projectRef} env=${process.env.NODE_ENV ?? "unknown"}`;
    } catch {
      return "masked";
    }
  };
  console.info(`${LOG_PREFIX} DB config: ${mask(url)} direct=${mask(direct)}`);
}

/**
 * POST /api/matches — record a like (candidate or employer). Uses resolveMatchForPair (atomic).
 * Returns isMatch ONLY when server confirms both likes; client must show match only when isMatch === true.
 */
export async function POST(request: Request) {
  logDbConfigOnce();
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

    const actorType = employerLiked ? "employer" : candidateLiked ? "candidate" : null;
    if (!actorType) {
      return NextResponse.json({ error: "Send employerLiked: true or candidateLiked: true" }, { status: 400 });
    }

    if (actorType === "employer") {
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

    const result = await resolveMatchForPair(prisma, {
      vacancyId,
      candidateProfileId,
      actorType,
      matchScore,
      reqId,
    });

    const matchRow = await prisma.match.findUnique({
      where: { id: result.matchId },
      select: { createdAt: true },
    });
    const createdAt = matchRow?.createdAt?.toISOString() ?? new Date().toISOString();

    return NextResponse.json({
      ...result,
      id: result.matchId,
      hasMatch: result.isMatch,
      createdAt,
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
 * GET /api/matches — list matches. Match = candidate_liked AND employer_liked (mutual).
 * Does NOT require chat_messages to exist. Queries matches table only.
 * - ?candidateProfileId= : candidate's matches. Default: mutual only. ?allLikes=1: all where candidate liked.
 * - No param + employer session: employer's mutual matches for their company's vacancies.
 */
export async function GET(request: Request) {
  logDbConfigOnce();
  try {
    const { searchParams } = new URL(request.url);
    const candidateProfileId = searchParams.get("candidateProfileId");
    const allLikes = searchParams.get("allLikes") === "1" || searchParams.get("allLikes") === "true";

    if (candidateProfileId) {
      const list = await prisma.match.findMany({
        where: {
          candidateProfileId,
          ...(allLikes ? { candidateLiked: true } : { candidateLiked: true, employerLiked: true }),
        },
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

    // Employer match list: query matches table only (do not require chat_messages)
    const list = await prisma.match.findMany({
      where: {
        vacancy: { companyId: ctx.companyId },
        candidateLiked: true,
        employerLiked: true,
      },
      include: {
        vacancy: { select: { title: true }, include: { company: { select: { name: true } } } },
        candidateProfile: { select: { id: true, fullName: true, jobTitle: true, photo: true } },
      },
      orderBy: [{ matchedAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
    });
    return NextResponse.json(
      list.map((m) => {
        const photoUrl = m.candidateProfile?.photo?.trim() || null;
        return {
          id: m.id,
          vacancyId: m.vacancyId,
          candidateProfileId: m.candidateProfileId,
          candidateLiked: Boolean(m.candidateLiked),
          employerLiked: Boolean(m.employerLiked),
          matchScore: m.matchScore ?? undefined,
          matchedAt: m.matchedAt != null ? m.matchedAt.toISOString() : null,
          createdAt: m.createdAt.toISOString(),
          vacancyTitle: m.vacancy?.title ?? "",
          company: m.vacancy?.company?.name ?? "",
          candidateName: m.candidateProfile?.fullName ?? "Candidate",
          candidateJobTitle: m.candidateProfile?.jobTitle ?? null,
          candidatePhotoUrl: photoUrl,
          photoUrl,
        };
      })
    );
  } catch (e) {
    console.error("Matches list error:", e);
    return NextResponse.json({ error: "Failed to list matches" }, { status: 500 });
  }
}
