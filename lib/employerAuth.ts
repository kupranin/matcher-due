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

/** Read session token from the request (Cookie or Authorization). Use this so route handlers see the same token the client sent. */
function getTokenFromRequest(request?: Request): string | undefined {
  if (!request) return undefined;
  const auth = request.headers.get("Authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7).trim();
  const cookieHeader = request.headers.get("Cookie");
  if (cookieHeader) {
    const match = cookieHeader.match(new RegExp(`${SESSION_COOKIE_NAME}=([^;]+)`));
    if (match?.[1]) return match[1].trim();
  }
  return undefined;
}

/**
 * Resolves the current employer from the session cookie or Authorization: Bearer header.
 * Does not require a company to exist. Use for POST /api/companies (create company).
 * Prefer token from the request (Cookie/Authorization) so auth works when cookies() lags or isn't forwarded.
 */
export async function getEmployerFromSession(request?: Request): Promise<{ userId: string } | null> {
  let token = getTokenFromRequest(request);
  if (!token) {
    const cookieStore = await cookies();
    token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  }
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: { select: { id: true, role: true } } },
  });
  if (!session || session.expiresAt < new Date() || session.user.role !== "EMPLOYER") {
    return null;
  }
  return { userId: session.user.id };
}

/**
 * Resolves the current employer's company from the session cookie or Authorization: Bearer header.
 * Returns null if not logged in, not EMPLOYER, session expired, or no company.
 * Use this for GET/PATCH company, vacancies, matches, chat, subscriptions.
 * Pass the request so the Bearer token can be used when the cookie is not sent.
 */
export async function getEmployerCompanyFromSession(request?: Request): Promise<EmployerContext | null> {
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
