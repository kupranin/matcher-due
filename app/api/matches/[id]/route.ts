import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getEmployerCompanyFromSession, matchBelongsToEmployerCompany } from "@/lib/employerAuth";

/**
 * GET /api/matches/[id] — fetch a single match.
 * - Employer: requires session; match must belong to employer's company.
 * - Candidate: pass ?candidateProfileId= ; match is returned only if it belongs to that candidate.
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

    const { searchParams } = new URL(request.url);
    const candidateProfileIdParam = searchParams.get("candidateProfileId");

    const m = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        vacancy: { select: { title: true }, include: { company: { select: { name: true } } } },
        candidateProfile: { select: { id: true, fullName: true, jobTitle: true, photo: true } },
      },
    });

    if (!m) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    const ctx = await getEmployerCompanyFromSession(request);
    if (ctx) {
      const allowed = await matchBelongsToEmployerCompany(matchId, ctx.companyId);
      if (!allowed) {
        return NextResponse.json({ error: "Match not found or access denied" }, { status: 403 });
      }
    } else if (candidateProfileIdParam) {
      if (m.candidateProfileId !== candidateProfileIdParam.trim()) {
        return NextResponse.json({ error: "Match not found or access denied" }, { status: 403 });
      }
    } else {
      return NextResponse.json({ error: "Sign in as employer or pass candidateProfileId to view this match" }, { status: 401 });
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
      matchedAt: m.matchedAt != null ? m.matchedAt.toISOString() : null,
      vacancyTitle: m.vacancy?.title ?? "",
      company: m.vacancy?.company?.name ?? "",
      candidateName: m.candidateProfile?.fullName ?? "Candidate",
      candidateJobTitle: m.candidateProfile?.jobTitle ?? null,
      candidatePhotoUrl: m.candidateProfile?.photo?.trim() || null,
    });
  } catch (e) {
    console.error("Match get error:", e);
    return NextResponse.json({ error: "Failed to load match" }, { status: 500 });
  }
}
