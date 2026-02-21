import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { SESSION_COOKIE_NAME } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

/** DELETE /api/vacancies/[id] — delete vacancy. Must belong to current employer (session or companyId). */
export async function DELETE(
  request: Request,
  { params }: Params
) {
  try {
    const { id: vacancyId } = await params;
    if (!vacancyId) {
      return NextResponse.json({ error: "Vacancy ID required" }, { status: 400 });
    }

    const vacancy = await prisma.vacancy.findUnique({
      where: { id: vacancyId },
      include: { company: { select: { id: true, userId: true } } },
    });
    if (!vacancy) {
      return NextResponse.json({ error: "Vacancy not found" }, { status: 404 });
    }

    let allowed = false;
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");

    if (companyId && vacancy.companyId === companyId) {
      allowed = true;
    }
    if (!allowed) {
      const cookieStore = await cookies();
      const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
      if (token) {
        const session = await prisma.session.findUnique({
          where: { token },
          include: { user: { select: { id: true, role: true } } },
        });
        if (session?.user?.role === "EMPLOYER" && session.expiresAt >= new Date() && vacancy.company.userId === session.user.id) {
          allowed = true;
        }
      }
    }

    if (!allowed) {
      return NextResponse.json({ error: "Not allowed to delete this vacancy" }, { status: 403 });
    }

    await prisma.vacancy.delete({ where: { id: vacancyId } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Vacancy delete error:", e);
    return NextResponse.json({ error: "Failed to delete vacancy" }, { status: 500 });
  }
}
