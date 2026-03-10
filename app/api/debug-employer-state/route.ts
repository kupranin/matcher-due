import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getEmployerCompanyFromSession } from "@/lib/employerAuth";

/**
 * GET /api/debug-employer-state?vacancyId=...
 *
 * Returns full employer pipeline state for debugging vacancy switching.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedVacancyId = searchParams.get("vacancyId")?.trim() ?? null;

    const ctx = await getEmployerCompanyFromSession(request);
    const authUserId = ctx?.userId ?? null;
    const companyId = ctx?.companyId ?? null;

    let selectedVacancyId: string | null = null;
    let selectedVacancyTitle: string | null = null;
    let fallbackReason: string | null = null;
    const vacancies: Array<{ id: string; title: string; status: string }> = [];

    if (companyId) {
      const list = await prisma.vacancy.findMany({
        where: { companyId },
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, status: true },
      });
      list.forEach((v) => vacancies.push({ id: v.id, title: v.title, status: v.status }));

      if (requestedVacancyId) {
        const belongs = list.some((v) => v.id === requestedVacancyId);
        if (belongs) {
          selectedVacancyId = requestedVacancyId;
          selectedVacancyTitle = list.find((v) => v.id === requestedVacancyId)?.title ?? null;
          fallbackReason = "from_request";
        } else {
          selectedVacancyId = list[0]?.id ?? null;
          selectedVacancyTitle = list[0]?.title ?? null;
          fallbackReason = "requested_invalid_fallback_first";
        }
      } else {
        selectedVacancyId = list[0]?.id ?? null;
        selectedVacancyTitle = list[0]?.title ?? null;
        fallbackReason = "auto_first";
      }
    }

    let totalCandidates = 0;
    let totalMatches = 0;
    let totalChats = 0;

    const candidateCount = await prisma.candidateProfile.count();
    totalCandidates = candidateCount;

    if (companyId) {
      const matchCount = await prisma.match.count({
        where: {
          vacancy: { companyId },
          employerLiked: true,
          candidateLiked: true,
        },
      });
      totalMatches = matchCount;

      const matchIds = await prisma.match.findMany({
        where: {
          vacancy: { companyId },
          employerLiked: true,
          candidateLiked: true,
        },
        select: { id: true },
      });
      const msgCount = await prisma.chatMessage.count({
        where: { matchId: { in: matchIds.map((m) => m.id) } },
      });
      totalChats = msgCount;
    }

    return NextResponse.json({
      authUserId,
      companyId,
      requestedVacancyId,
      selectedVacancyId,
      selectedVacancyTitle,
      fallbackReason,
      totalVacancies: vacancies.length,
      vacancies,
      totalCandidates,
      totalMatches,
      totalChats,
    });
  } catch (e) {
    console.error("debug-employer-state error:", e);
    return NextResponse.json(
      { error: String(e), stack: e instanceof Error ? e.stack : undefined },
      { status: 500 }
    );
  }
}
