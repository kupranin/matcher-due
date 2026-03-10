import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getEmployerCompanyFromSession } from "@/lib/employerAuth";
import { getStockPhotosForJob } from "@/lib/vacancyStockPhotos";
import { apiVacancyToProfile } from "@/lib/vacancyApi";

/**
 * GET /api/employer/vacancies
 *
 * Returns all vacancies for the logged-in employer's company.
 * Auth: employer session required.
 */
export async function GET(request: Request) {
  try {
    const ctx = await getEmployerCompanyFromSession(request);
    if (!ctx) {
      return NextResponse.json({ error: "Unauthorized", vacancies: [] }, { status: 401 });
    }

    const list = await prisma.vacancy.findMany({
      where: { companyId: ctx.companyId },
      orderBy: { createdAt: "desc" },
      include: {
        company: { select: { name: true } },
        skills: true,
      },
    });

    const vacancies = list.map((v) => {
      const locationCityId = v.locationCityId ?? "";
      const loc = locationCityId === "tbilisi" ? "Tbilisi" : locationCityId;
      const salaryStr =
        v.salaryMin != null
          ? `${v.salaryMin}–${v.salaryMax} GEL`
          : `${v.salaryMax} GEL`;
      return {
        id: v.id,
        title: v.title,
        status: v.status,
        city: loc,
        locationCityId: v.locationCityId,
        salaryMin: v.salaryMin,
        salaryMax: v.salaryMax,
        workType: v.workType,
        isRemote: v.isRemote,
        requiredExperienceMonths: v.requiredExperienceMonths,
        requiredEducationLevel: v.requiredEducationLevel,
        company: v.company.name,
        companyId: v.companyId,
        createdAt: v.createdAt.toISOString(),
        updatedAt: v.updatedAt.toISOString(),
        profile: apiVacancyToProfile({
          locationCityId: v.locationCityId,
          salaryMax: v.salaryMax,
          salaryMin: v.salaryMin,
          workType: v.workType,
          isRemote: v.isRemote,
          requiredExperienceMonths: v.requiredExperienceMonths ?? undefined,
          requiredEducationLevel: v.requiredEducationLevel ?? undefined,
          skills: v.skills.map((s) => ({ name: s.name, level: s.level, weight: s.weight })),
        }),
        salary: salaryStr,
        location: loc,
      };
    });

    return NextResponse.json({ vacancies });
  } catch (e) {
    console.error("Employer vacancies list error:", e);
    return NextResponse.json(
      { error: "Failed to load vacancies", vacancies: [] },
      { status: 500 }
    );
  }
}
