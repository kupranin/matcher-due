/**
 * Employer auth: resolve (userId, companyId) from session. Used by vacancies, matches, chat, subscriptions.
 */
import { prisma } from "@/lib/db";
import { getSessionTokenFromRequest } from "@/lib/session";

export type EmployerContext = {
  userId: string;
  companyId: string;
  company: { id: string; name: string; userId: string };
};

export async function getEmployerFromSession(request: Request): Promise<{ userId: string } | null> {
  const token = getSessionTokenFromRequest(request);
  if (!token || token.length < 10) return null;
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: { select: { id: true, role: true } } },
  });
  if (!session || session.expiresAt < new Date() || session.user.role !== "EMPLOYER") return null;
  return { userId: session.user.id };
}

export async function getEmployerCompanyFromSession(request: Request): Promise<EmployerContext | null> {
  const employer = await getEmployerFromSession(request);
  if (!employer) return null;
  const company = await prisma.company.findUnique({
    where: { userId: employer.userId },
    select: { id: true, name: true, userId: true },
  });
  if (!company) return null;
  return {
    userId: company.userId,
    companyId: company.id,
    company: { id: company.id, name: company.name, userId: company.userId },
  };
}

export async function vacancyBelongsToEmployerCompany(
  vacancyId: string,
  employerCompanyId: string
): Promise<boolean> {
  const v = await prisma.vacancy.findUnique({ where: { id: vacancyId }, select: { companyId: true } });
  return v?.companyId === employerCompanyId;
}

export async function matchBelongsToEmployerCompany(
  matchId: string,
  employerCompanyId: string
): Promise<boolean> {
  const m = await prisma.match.findUnique({
    where: { id: matchId },
    include: { vacancy: { select: { companyId: true } } },
  });
  return m?.vacancy?.companyId === employerCompanyId;
}
