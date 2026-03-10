import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getEmployerCompanyFromSession } from "@/lib/employerAuth";

export async function GET(request: Request) {
  try {
    const ctx = await getEmployerCompanyFromSession(request);
    if (!ctx) {
      return NextResponse.json(
        {
          authUserId: null,
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
          m.employer_liked,
          m.candidate_liked,
          m.matched_at,

          cp.full_name AS candidate_name,

          v.title AS vacancy_title,
          v.company_id,

          c.name AS company_name
      FROM public.matches m
      JOIN public."CandidateProfile" cp ON cp.id = m.candidate_profile_id
      JOIN public."Vacancy" v ON v.id = m.vacancy_id
      JOIN public."Company" c ON c.id = v.company_id
      WHERE v.company_id = ${ctx.companyId}
        AND m.employer_liked = true
        AND m.candidate_liked = true
    `;

    return NextResponse.json({
      authUserId: ctx.userId,
      companyId: ctx.companyId,
      totalMatches: rawMatches.length,
      matches: rawMatches,
    });
  } catch (e) {
    return NextResponse.json({
      error: "Debug query failed",
      details: String(e),
    }, { status: 500 });
  }
}
