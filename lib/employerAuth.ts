/**
 * Employer backend auth: User → Company → Vacancy chain.
 *
 * 1. User must match the company: only the logged-in employer's company (1:1).
 * 2. Company must match the vacancy: vacancies belong to that company.
 *
 * Use getEmployerCompanyFromSession() in all employer APIs to resolve
 * (userId, companyId) from the session cookie. Never trust client-sent
 * companyId for authorization—always derive from session.
 */

import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { SESSION_COOKIE_NAME } from "@/lib/session";

export type EmployerContext = {
  userId: string;
  companyId: string;
  company: { id: string; name: string; userId: string };
};

/**
 * Resolves the current employer's company from the session cookie.
 * Returns null if not logged in, not EMPLOYER, session expired, or no company.
 * Use this for all employer-scoped APIs (companies, vacancies, matches, chat, subscriptions).
 */
export async function getEmployerCompanyFromSession(): Promise<EmployerContext | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: { select: { id: true, role: true } } },
  });
  if (!session || session.expiresAt < new Date() || session.user.role !== "EMPLOYER") {
    return null;
  }

  const company = await prisma.company.findUnique({
    where: { userId: session.user.id },
    select: { id: true, name: true, userId: true },
  });
  if (!company) return null;

  return {
    userId: session.user.id,
    companyId: company.id,
    company: { id: company.id, name: company.name, userId: company.userId },
  };
}

/**
 * Returns true if the given vacancyId belongs to the employer's company.
 * Use before allowing employer to like a candidate (match) or access chat for that match.
 */
export async function vacancyBelongsToEmployerCompany(
  vacancyId: string,
  employerCompanyId: string
): Promise<boolean> {
  const v = await prisma.vacancy.findUnique({
    where: { id: vacancyId },
    select: { companyId: true },
  });
  return v?.companyId === employerCompanyId;
}

/**
 * Returns true if the given matchId's vacancy belongs to the employer's company.
 */
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
