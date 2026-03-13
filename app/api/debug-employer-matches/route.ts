import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getEmployerCompanyFromSession } from "@/lib/employerAuth";

export async function GET(request: Request) {
  try {
    const ctx = await getEmployerCompanyFromSession(request);
    if (!ctx) {
      return NextResponse.json(
        {
          companyId: null,
          totalMatches: 0,
          matches: [],
          error: "Not authenticated as employer",
        },
        { status: 401 }
      );
    }

    const rawMatches = await prisma.$queryRaw<any[]>`
      SELECT
          m.id AS match_id,
          m.vacancy_id,
          m.candidate_profile_id,
          m.matched_at,
          m.created_at,
          cp.full_name AS candidate_name,
          cp.photo AS candidate_photo_url,
          v.title AS vacancy_title,
          v.company_id,
          c.name AS company_name,
          COALESCE(msg_counts.message_count, 0) AS chat_message_count
      FROM public.matches m
      JOIN public."CandidateProfile" cp ON cp.id = m.candidate_profile_id
      JOIN public."Vacancy" v ON v.id = m.vacancy_id
      JOIN public."Company" c ON c.id = v.company_id
      LEFT JOIN LATERAL (
        SELECT COUNT(*)::int AS message_count
        FROM public.chat_messages cm
        WHERE cm.match_id = m.id
      ) msg_counts ON true
      WHERE v.company_id = ${ctx.companyId}
        AND m.employer_liked = true
        AND m.candidate_liked = true
      ORDER BY COALESCE(m.matched_at, m.created_at) DESC
    `;

    return NextResponse.json({
      companyId: ctx.companyId,
      totalMatches: rawMatches.length,
      matches: rawMatches.map((m) => ({
        matchId: m.match_id,
        vacancyId: m.vacancy_id,
        candidateProfileId: m.candidate_profile_id,
        candidateName: m.candidate_name,
        vacancyTitle: m.vacancy_title,
        companyName: m.company_name,
        matchedAt: m.matched_at ?? m.created_at,
        chatMessageCount: m.chat_message_count ?? 0,
      })),
    });
  } catch (e) {
    return NextResponse.json(
      {
        error: "Debug query failed",
        details: String(e),
      },
      { status: 500 }
    );
  }
}
