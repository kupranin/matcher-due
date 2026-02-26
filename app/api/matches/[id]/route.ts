import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getEmployerCompanyFromSession, matchBelongsToEmployerCompany } from "@/lib/employerAuth";

/**
 * GET /api/matches/[id] — fetch a single match (employer only).
 * Used when the chats page has matchId in URL but the list returned empty (e.g. timing/session).
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: matchId } = await params;
    if (!matchId) {
      return NextResponse.json({ error: "match id required" }, { status: 400 });
    }

    const ctx = await getEmployerCompanyFromSession(request);
    if (!ctx) {
      return NextResponse.json({ error: "Sign in as employer to view this match" }, { status: 401 });
    }

    const allowed = await matchBelongsToEmployerCompany(matchId, ctx.companyId);
    if (!allowed) {
      return NextResponse.json({ error: "Match not found or access denied" }, { status: 403 });
    }

    const m = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        vacancy: { select: { title: true }, include: { company: { select: { name: true } } } },
        candidateProfile: { select: { id: true, fullName: true, jobTitle: true } },
      },
    });

    if (!m) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    return NextResponse.json({
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
    });
  } catch (e) {
    console.error("Match get error:", e);
    return NextResponse.json({ error: "Failed to load match" }, { status: 500 });
  }
}
