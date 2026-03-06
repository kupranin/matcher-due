import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getEmployerCompanyFromSession, vacancyBelongsToEmployerCompany } from "@/lib/employerAuth";
import { computeMatchScore } from "@/lib/matchScore";
import { MATCH_SYSTEM_MESSAGE_TEXT } from "@/lib/matchSystemMessage";

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
 * POST /api/matches — record a like (candidate or employer). Atomic upsert; match is durable in DB.
 * Match = only when employer_liked AND candidate_liked (mutual). Chat is separate; on first mutual we insert system message.
 * - Candidate: sends candidateLiked: true + candidateProfileId (from session/storage).
 * - Employer: sends employerLiked: true; vacancy must belong to employer's company.
 * - Returns hasMatch: true ONLY when server confirms both likes; client must show match only then.
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
      select: { id: true, employerLiked: true, candidateLiked: true, matchedAt: true },
    });
    const before = existing
      ? {
          employerLiked: existing.employerLiked,
          candidateLiked: existing.candidateLiked,
          matchedAt: existing.matchedAt != null,
        }
      : null;

    let didSetMatchedAt = false;
    let didInsertSystemMessage = false;

    const verify = await prisma.$transaction(async (tx) => {
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
      const row = after ?? updated;
      const isMutual = Boolean(row.candidateLiked && row.employerLiked);
      const matchedAtNull = row.matchedAt == null;

      if (isMutual && matchedAtNull) {
        await tx.match.update({
          where: { id: row.id },
          data: { matchedAt: new Date() },
        });
        didSetMatchedAt = true;
        await tx.chatMessage.create({
          data: {
            matchId: row.id,
            sender: "system",
            text: MATCH_SYSTEM_MESSAGE_TEXT,
          },
        });
        didInsertSystemMessage = true;
      }
      return row;
    });

    const verifyAfter = await prisma.match.findUnique({
      where: { vacancyId_candidateProfileId: { vacancyId, candidateProfileId } },
    });
    if (!verifyAfter) {
      console.error(`${LOG_PREFIX} CRITICAL verify failed after commit reqId=${reqId} vacancyId=${vacancyId} candidateProfileId=${candidateProfileId}`);
      return NextResponse.json({ error: "Failed to save like" }, { status: 500 });
    }

    const hasMatch = Boolean(verifyAfter.candidateLiked && verifyAfter.employerLiked);
    console.info(
      JSON.stringify({
        tag: LOG_PREFIX,
        reqId,
        vacancyId,
        candidateProfileId,
        before,
        after: {
          employerLiked: verifyAfter.employerLiked,
          candidateLiked: verifyAfter.candidateLiked,
          matchedAt: verifyAfter.matchedAt != null,
        },
        isMatch: hasMatch,
        didSetMatchedAt,
        didInsertSystemMessage,
        didInsertChatSeed: didInsertSystemMessage,
        matchId: verifyAfter.id,
        committed: true,
      })
    );

    return NextResponse.json({
      id: verifyAfter.id,
      candidateLiked: verifyAfter.candidateLiked,
      employerLiked: verifyAfter.employerLiked,
      hasMatch: hasMatch,
      isMatch: hasMatch,
      matchId: verifyAfter.id,
      matchedAt: verifyAfter.matchedAt != null ? verifyAfter.matchedAt.toISOString() : null,
      createdAt:
        typeof verifyAfter.createdAt?.toISOString === "function"
          ? verifyAfter.createdAt.toISOString()
          : String(verifyAfter.createdAt),
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
 * - ?candidateProfileId= : candidate's matches. Default: mutual only (Matches tab). ?allLikes=1: all rows where candidate liked (Liked tab).
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
      list.map((m) => ({
        id: m.id,
        vacancyId: m.vacancyId,
        candidateProfileId: m.candidateProfileId,
        candidateLiked: Boolean(m.candidateLiked),
        employerLiked: Boolean(m.employerLiked),
        candidatePitch: m.candidatePitch,
        matchScore: m.matchScore ?? undefined,
        createdAt: m.createdAt.toISOString(),
        matchedAt: m.matchedAt != null ? m.matchedAt.toISOString() : null,
        vacancyTitle: m.vacancy?.title ?? "",
        company: m.vacancy?.company?.name ?? "",
        candidateName: m.candidateProfile?.fullName ?? "Candidate",
        candidateJobTitle: m.candidateProfile?.jobTitle ?? null,
        candidatePhotoUrl: m.candidateProfile?.photo?.trim() || null,
      }))
    );
  } catch (e) {
    console.error("Matches list error:", e);
    return NextResponse.json({ error: "Failed to list matches" }, { status: 500 });
  }
}
