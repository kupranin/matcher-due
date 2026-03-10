import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateAge } from "@/lib/age";
import { getEmployerCompanyFromSession, getEmployerVacancyContext } from "@/lib/employerAuth";
import { buildCandidateCardsWithMatch } from "@/lib/vacancyApi";

type VacancyPayload = {
  id: string;
  title: string;
  company: string;
  location: string;
  workType: string;
  salary: string;
  profile: import("@/lib/matchCalculation").VacancyProfile;
};

/**
 * GET /api/employer/candidates?vacancyId=...
 *
 * Returns candidates for employer browsing scoped to the given vacancy.
 * - Authenticates employer and resolves company.
 * - Verifies vacancyId belongs to employer's company.
 * - Returns vacancy context + full candidate list (same as public /api/candidates).
 * Cards are built client-side from vacancy.profile + candidates; optionally return prebuilt cards.
 */
export async function GET(request: Request) {
  try {
    const ctx = await getEmployerCompanyFromSession(request);
    if (!ctx) {
      return NextResponse.json(
        { error: "Unauthorized", vacancy: null, candidates: [] },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const vacancyId = searchParams.get("vacancyId")?.trim() ?? null;

    if (!vacancyId) {
      return NextResponse.json(
        {
          error: "vacancyId required",
          vacancy: null,
          candidates: [],
        },
        { status: 400 }
      );
    }

    const vacancyContext = await getEmployerVacancyContext(ctx.companyId, vacancyId);
    if (!vacancyContext) {
      return NextResponse.json(
        {
          error: "Vacancy not found or you do not have access to this vacancy",
          vacancy: null,
          candidates: [],
        },
        { status: 404 }
      );
    }

    const list = await prisma.candidateProfile.findMany({
      include: { skills: true },
      orderBy: { createdAt: "desc" },
    });

    const candidates = list.map((c) => ({
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

    const cards = buildCandidateCardsWithMatch(candidates, vacancyContext.profile);

    const [company, vacancyRow] = await Promise.all([
      prisma.company.findUnique({ where: { id: ctx.companyId }, select: { name: true } }),
      prisma.vacancy.findUnique({
        where: { id: vacancyId },
        select: { salaryMin: true, salaryMax: true, locationCityId: true, workType: true },
      }),
    ]);
    const locationCityId = vacancyRow?.locationCityId ?? vacancyContext.profile.locationCityId ?? "";
    const city = locationCityId === "tbilisi" ? "Tbilisi" : locationCityId;
    const salaryStr =
      vacancyRow?.salaryMin != null
        ? `${vacancyRow.salaryMin}–${vacancyRow.salaryMax} GEL`
        : `${vacancyContext.profile.salaryMax} GEL`;

    const vacancyPayload: VacancyPayload = {
      id: vacancyContext.vacancyId,
      title: vacancyContext.vacancyTitle,
      company: company?.name ?? "",
      location: city,
      workType: vacancyRow?.workType ?? vacancyContext.profile.workType ?? "Full-time",
      salary: salaryStr,
      profile: vacancyContext.profile,
    };

    return NextResponse.json({
      vacancy: vacancyPayload,
      candidates,
      cards,
    });
  } catch (e) {
    console.error("Employer candidates error:", e);
    return NextResponse.json(
      { error: "Failed to load candidates", vacancy: null, candidates: [] },
      { status: 500 }
    );
  }
}
