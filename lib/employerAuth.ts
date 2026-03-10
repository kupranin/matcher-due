/**
 * Employer session auth: resolve company from session token.
 */

import { prisma } from "@/lib/db";
import { getSessionTokenFromRequest } from "@/lib/session";

export type EmployerContext = {
  userId: string;
  companyId: string;
  company: { id: string; name: string; userId: string };
};

export type EmployerVacancyContext = {
  vacancyId: string;
  vacancyTitle: string;
  companyId: string;
  profile: import("./matchCalculation").VacancyProfile;
};

/**
 * If the request has a valid employer session, return the employer's user id and company.
 * Otherwise return null.
 */
export async function getEmployerCompanyFromSession(request: Request): Promise<EmployerContext | null> {
  const token = getSessionTokenFromRequest(request);
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: { select: { id: true, role: true } } },
  });
  if (!session || session.expiresAt < new Date() || session.user.role !== "EMPLOYER") return null;
  const company = await prisma.company.findUnique({
    where: { userId: session.user.id },
    select: { id: true, name: true, userId: true },
  });
  if (!company) return null;
  return {
    userId: company.userId,
    companyId: company.id,
    company: { id: company.id, name: company.name, userId: company.userId },
  };
}

/**
 * Resolve vacancy for employer browsing: ensure vacancy belongs to employer's company.
 * Returns vacancy context or null if not found / no access.
 */
export async function getEmployerVacancyContext(
  companyId: string,
  vacancyId: string
): Promise<EmployerVacancyContext | null> {
  const vacancy = await prisma.vacancy.findUnique({
    where: { id: vacancyId, companyId, status: "PUBLISHED" },
    include: { company: { select: { name: true } }, skills: true },
  });
  if (!vacancy) return null;
  const { apiVacancyToProfile } = await import("./vacancyApi");
  const profile = apiVacancyToProfile({
    locationCityId: vacancy.locationCityId,
    salaryMax: vacancy.salaryMax,
    salaryMin: vacancy.salaryMin,
    workType: vacancy.workType,
    isRemote: vacancy.isRemote,
    requiredExperienceMonths: vacancy.requiredExperienceMonths ?? undefined,
    requiredEducationLevel: vacancy.requiredEducationLevel ?? undefined,
    skills: vacancy.skills.map((s) => ({ name: s.name, level: s.level, weight: s.weight })),
  });
  return {
    vacancyId: vacancy.id,
    vacancyTitle: vacancy.title,
    companyId: vacancy.companyId,
    profile,
  };
}
