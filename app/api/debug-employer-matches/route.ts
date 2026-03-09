import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getEmployerCompanyFromSession } from "@/lib/employerAuth";

/**
 * GET /api/debug-employer-matches
 * Returns auth state, companyId, total mutual matches, and sample matches. For diagnostics. Requires employer session.
 */
export async function GET(request: Request) {
  try {
    const ctx = await getEmployerCompanyFromSession(request);
    if (!ctx) {
      return NextResponse.json({
        authUserId: null,
        companyId: null,
        totalMatches: 0,
        sampleMatches: [],
        hint: "Send Authorization: Bearer <token> or cookie with employer session",
      });
    }

    const [total, list] = await Promise.all([
      prisma.match.count({
        where: {
          vacancy: { companyId: ctx.companyId },
          candidateLiked: true,
          employerLiked: true,
        },
      }),
      prisma.match.findMany({
        where: {
          vacancy: { companyId: ctx.companyId },
          candidateLiked: true,
          employerLiked: true,
        },
        include: {
          vacancy: { select: { title: true } },
          candidateProfile: { select: { id: true, fullName: true } },
        },
        orderBy: [{ matchedAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
        take: 10,
      }),
    ]);

    return NextResponse.json({
      authUserId: ctx.userId,
      companyId: ctx.companyId,
      totalMatches: total,
      sampleMatches: list.map((m) => ({
        id: m.id,
        vacancyId: m.vacancyId,
        candidateProfileId: m.candidateProfileId,
        matchedAt: m.matchedAt?.toISOString() ?? null,
        vacancyTitle: m.vacancy?.title,
        candidateName: m.candidateProfile?.fullName,
      })),
    });
  } catch (e) {
    console.error("debug-employer-matches error:", e);
    return NextResponse.json(
      { error: "Failed to run debug", hint: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
