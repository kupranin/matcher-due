import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getEmployerCompanyFromSession, matchBelongsToEmployerCompany } from "@/lib/employerAuth";

/**
 * GET /api/debug-match?vacancyId= & candidateProfileId=
 * Returns match row, hasMatch, hasMatchedAt, chatMessageCount, and access checks. For diagnostics only.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const vacancyId = searchParams.get("vacancyId")?.trim() ?? "";
    const candidateProfileId = searchParams.get("candidateProfileId")?.trim() ?? "";
    if (!vacancyId || !candidateProfileId) {
      return NextResponse.json(
        { error: "vacancyId and candidateProfileId query params required" },
        { status: 400 }
      );
    }

    const matchRow = await prisma.match.findUnique({
      where: { vacancyId_candidateProfileId: { vacancyId, candidateProfileId } },
      include: {
        vacancy: { select: { companyId: true, title: true } },
        candidateProfile: { select: { id: true, fullName: true } },
      },
    });

    if (!matchRow) {
      return NextResponse.json({
        matchRow: null,
        hasMatch: false,
        hasMatchedAt: false,
        chatMessageCount: 0,
        employerAccessCheck: null,
        candidateAccessCheck: "match not found",
      });
    }

    const chatMessageCount = await prisma.chatMessage.count({
      where: { matchId: matchRow.id },
    });

    let employerAccessCheck: string | boolean = "no employer session";
    const ctx = await getEmployerCompanyFromSession(request);
    if (ctx) {
      const allowed = await matchBelongsToEmployerCompany(matchRow.id, ctx.companyId);
      employerAccessCheck = allowed;
    }

    const candidateAccessCheck =
      matchRow.candidateProfileId === candidateProfileId
        ? true
        : "candidateProfileId does not match";

    return NextResponse.json({
      matchRow: {
        id: matchRow.id,
        vacancyId: matchRow.vacancyId,
        candidateProfileId: matchRow.candidateProfileId,
        employerLiked: matchRow.employerLiked,
        candidateLiked: matchRow.candidateLiked,
        matchedAt: matchRow.matchedAt?.toISOString() ?? null,
        createdAt: matchRow.createdAt.toISOString(),
      },
      hasMatch: Boolean(matchRow.employerLiked && matchRow.candidateLiked),
      hasMatchedAt: matchRow.matchedAt != null,
      chatMessageCount,
      employerAccessCheck,
      candidateAccessCheck,
    });
  } catch (e) {
    console.error("debug-match error:", e);
    return NextResponse.json(
      { error: "Failed to run debug", hint: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
