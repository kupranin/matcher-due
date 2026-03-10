import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { computeMatchScore } from "@/lib/matchScore";
import { getEmployerCompanyFromSession } from "@/lib/employerAuth";

async function vacancyBelongsToEmployerCompany(vacancyId: string, employerCompanyId: string) {
  const v = await prisma.vacancy.findUnique({ where: { id: vacancyId }, select: { companyId: true } });
  return v?.companyId === employerCompanyId;
}

/**
 * POST /api/matches — record a like (candidate or employer).
 * Relies on DB triggers to set matched_at and insert chat_messages seed.
 */
export async function POST(request: Request) {
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

    const match = await prisma.match.upsert({
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

    const isMatch = Boolean(match.employerLiked && match.candidateLiked);

    return NextResponse.json({
      ok: true,
      matchId: match.id,
      employerLiked: match.employerLiked,
      candidateLiked: match.candidateLiked,
      isMatch,
      matchedAt: match.matchedAt?.toISOString() ?? null,
      createdAt: typeof match.createdAt?.toISOString === "function" ? match.createdAt.toISOString() : String(match.createdAt),
    });
  } catch (e) {
    console.error("Match upsert error:", e);
    return NextResponse.json({ error: "Failed to save like" }, { status: 500 });
  }
}

/**
 * GET /api/matches — employer match inbox query or candidate match query.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const candidateProfileId = searchParams.get("candidateProfileId");
    
    if (candidateProfileId) {
      // Candidate match query
      const list = await prisma.match.findMany({
        where: { candidateProfileId, candidateLiked: true, employerLiked: true },
        include: {
          vacancy: { include: { company: { select: { name: true } } } },
        },
        orderBy: [{ matchedAt: "desc" }, { createdAt: "desc" }],
      });
      return NextResponse.json(
        list.map((m) => ({
          id: m.id,
          matchId: m.id,
          vacancyId: m.vacancyId,
          candidateProfileId: m.candidateProfileId,
          candidateLiked: m.candidateLiked,
          employerLiked: m.employerLiked,
          matchedAt: m.matchedAt?.toISOString() ?? null,
          createdAt: m.createdAt.toISOString(),
          vacancyTitle: m.vacancy.title,
          companyName: m.vacancy.company.name,
        }))
      );
    }

    // Employer match query
    const ctx = await getEmployerCompanyFromSession(request);
    if (!ctx) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Explicitly query matches + last chat message
    const rawMatches = await prisma.$queryRaw<any[]>`
      SELECT
          m.id AS match_id,
          m.vacancy_id,
          m.candidate_profile_id,
          m.match_score,
          m.employer_liked,
          m.candidate_liked,
          m.matched_at,
          m.created_at,

          cp.full_name AS candidate_name,
          cp.photo AS candidate_photo_url,

          v.title AS vacancy_title,
          v.company_id,

          c.name AS company_name,

          lm.text AS last_message_text,
          lm.created_at AS last_message_at

      FROM public.matches m

      JOIN public."CandidateProfile" cp
          ON cp.id = m.candidate_profile_id

      JOIN public."Vacancy" v
          ON v.id = m.vacancy_id

      JOIN public."Company" c
          ON c.id = v.company_id

      LEFT JOIN LATERAL (
          SELECT
              cm.text,
              cm.created_at
          FROM public.chat_messages cm
          WHERE cm.match_id = m.id
          ORDER BY cm.created_at DESC
          LIMIT 1
      ) lm ON true

      WHERE
          v.company_id = ${ctx.companyId}
          AND m.employer_liked = true
          AND m.candidate_liked = true

      ORDER BY
          COALESCE(lm.created_at, m.matched_at, m.created_at) DESC;
    `;

    return NextResponse.json(
      rawMatches.map(m => ({
        matchId: m.match_id,
        vacancyId: m.vacancy_id,
        candidateProfileId: m.candidate_profile_id,
        candidateName: m.candidate_name,
        candidatePhotoUrl: m.candidate_photo_url,
        vacancyTitle: m.vacancy_title,
        companyName: m.company_name,
        matchedAt: m.matched_at,
        createdAt: m.created_at,
        lastMessageText: m.last_message_text,
        lastMessageAt: m.last_message_at
      }))
    );

  } catch (e) {
    console.error("Matches list error:", e);
    return NextResponse.json({ error: "Failed to list matches" }, { status: 500 });
  }
}
