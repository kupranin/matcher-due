import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateAge } from "@/lib/age";
import { getEmployerCompanyFromSession, getEmployerVacancyContext } from "@/lib/employerAuth";
import { buildCandidateCardsWithMatch } from "@/lib/vacancyApi";

/**
 * GET /api/debug-employer-candidates?vacancyId=...
 *
 * Debug employer candidate browsing pipeline:
 * - auth user id, companyId
 * - vacancy context (if vacancyId provided)
 * - raw candidate count from DB
 * - cards built for the vacancy (after buildCandidateCardsWithMatch)
 * - sample of candidates with excludedReason when useful
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const vacancyId = searchParams.get("vacancyId")?.trim() ?? null;

    const ctx = await getEmployerCompanyFromSession(request);
    const authUserId = ctx?.userId ?? null;
    const companyId = ctx?.companyId ?? null;

    let vacancyContext: Awaited<ReturnType<typeof getEmployerVacancyContext>> = null;
    if (vacancyId && companyId) {
      vacancyContext = await getEmployerVacancyContext(companyId, vacancyId);
    }

    const list = await prisma.candidateProfile.findMany({
      include: { skills: true },
      orderBy: { createdAt: "desc" },
    });

    const apiCandidates = list.map((c) => ({
      id: c.id,
      fullName: c.fullName,
      jobTitle: c.jobTitle,
      locationCityId: c.locationCityId,
      salaryMin: c.salaryMin,
      workTypes: c.workTypes,
      experienceMonths: c.experienceMonths,
      educationLevel: c.educationLevel,
      willingToRelocate: c.willingToRelocate,
      availableToWork: c.availableToWork,
      photo: c.photo?.trim() || null,
      age: calculateAge(c.dateOfBirth),
      skills: c.skills.map((s) => ({ name: s.name, level: s.level })),
    }));

    let totalCards = 0;
    let candidates: Array<{
      candidateProfileId: string;
      candidateName: string;
      hasPhoto: boolean;
      city: string;
      preferredRole: string;
      matchPercent: number;
      excludedReason: string | null;
    }> = [];

    if (vacancyContext) {
      const cards = buildCandidateCardsWithMatch(apiCandidates, vacancyContext.profile);
      totalCards = cards.length;
      candidates = cards.slice(0, 20).map((card) => ({
        candidateProfileId: card.id,
        candidateName: card.name,
        hasPhoto: Boolean(card.photo && String(card.photo).trim()),
        city: card.location,
        preferredRole: card.job,
        matchPercent: card.match,
        excludedReason: null,
      }));
    } else {
      candidates = apiCandidates.slice(0, 20).map((c) => ({
        candidateProfileId: c.id,
        candidateName: c.fullName ?? "Candidate",
        hasPhoto: Boolean(c.photo && String(c.photo).trim()),
        city: c.locationCityId ?? "",
        preferredRole: c.jobTitle ?? "Candidate",
        matchPercent: -1,
        excludedReason: !vacancyId
          ? "no_vacancy_id"
          : !companyId
            ? "not_authenticated"
            : "vacancy_not_found_or_no_access",
      }));
    }

    return NextResponse.json({
      authUserId,
      companyId,
      vacancyId,
      vacancyTitle: vacancyContext?.vacancyTitle ?? null,
      totalCandidates: apiCandidates.length,
      totalCards,
      candidates,
    });
  } catch (e) {
    console.error("debug-employer-candidates error:", e);
    return NextResponse.json(
      { error: String(e), stack: e instanceof Error ? e.stack : undefined },
      { status: 500 }
    );
  }
}
