import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionTokenFromRequest } from "@/lib/session";

export async function GET(request: Request) {
  try {
    const token = getSessionTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { candidateProfileId: null, totalMatches: 0, matches: [], error: "No session" },
        { status: 401 }
      );
    }

    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: { select: { id: true, role: true } } },
    });
    if (!session || session.user.role !== "CANDIDATE") {
      return NextResponse.json(
        { candidateProfileId: null, totalMatches: 0, matches: [], error: "Not a candidate session" },
        { status: 401 }
      );
    }

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    if (!profile) {
      return NextResponse.json(
        { candidateProfileId: null, totalMatches: 0, matches: [], error: "No candidate profile" },
        { status: 404 }
      );
    }

    const rows = await prisma.$queryRaw<any[]>`
      SELECT
        m.id AS match_id,
        m.vacancy_id,
        m.employer_liked,
        m.candidate_liked,
        m.matched_at,
        m.created_at,
        v.title AS vacancy_title,
        c.name AS company_name
      FROM public.matches m
      JOIN public."Vacancy" v ON v.id = m.vacancy_id
      JOIN public."Company" c ON c.id = v.company_id
      WHERE m.candidate_profile_id = ${profile.id}
        AND m.employer_liked = true
        AND m.candidate_liked = true
      ORDER BY COALESCE(m.matched_at, m.created_at) DESC;
    `;

    return NextResponse.json({
      candidateProfileId: profile.id,
      totalMatches: rows.length,
      matches: rows,
    });
  } catch (e) {
    return NextResponse.json(
      { candidateProfileId: null, totalMatches: 0, matches: [], error: String(e) },
      { status: 500 }
    );
  }
}

