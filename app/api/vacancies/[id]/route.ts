import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getEmployerCompanyFromSession } from "@/lib/employerAuth";

type Params = { params: Promise<{ id: string }> };

/**
 * DELETE /api/vacancies/[id]
 * Company must match vacancy: only the current employer's company can delete its vacancies.
 */
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id: vacancyId } = await params;
    if (!vacancyId) {
      return NextResponse.json({ error: "Vacancy ID required" }, { status: 400 });
    }

    const ctx = await getEmployerCompanyFromSession(request);
    if (!ctx) {
      return NextResponse.json({ error: "Sign in as employer to delete a vacancy" }, { status: 401 });
    }

    const vacancy = await prisma.vacancy.findUnique({
      where: { id: vacancyId },
      select: { id: true, companyId: true },
    });
    if (!vacancy) {
      return NextResponse.json({ error: "Vacancy not found" }, { status: 404 });
    }

    if (vacancy.companyId !== ctx.companyId) {
      return NextResponse.json({ error: "Not allowed to delete this vacancy" }, { status: 403 });
    }

    await prisma.vacancy.delete({ where: { id: vacancyId } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Vacancy delete error:", e);
    return NextResponse.json({ error: "Failed to delete vacancy" }, { status: 500 });
  }
}
