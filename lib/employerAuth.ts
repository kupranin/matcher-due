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
