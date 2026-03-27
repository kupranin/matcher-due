import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getEmployerCompanyFromSession, getEmployerFromSession } from "@/lib/employerAuth";

/** GET /api/companies — company for the current employer (session). */
export async function GET(request: Request) {
  try {
    const ctx = await getEmployerCompanyFromSession(request);
    if (!ctx) return NextResponse.json({ error: "Sign in as employer to view your company" }, { status: 401 });
    const company = await prisma.company.findUnique({ where: { id: ctx.companyId } });
    if (!company) return NextResponse.json(null);
    return NextResponse.json({
      id: company.id,
      userId: company.userId,
      name: company.name,
      companyId: company.companyId,
      contactEmail: company.contactEmail,
      contactPhone: company.contactPhone,
      bio: company.bio,
      logo: company.logo ?? null,
      website: company.website,
      industry: company.industry,
      employeeCount: company.employeeCount,
      address: company.address,
      linkedIn: company.linkedIn,
    });
  } catch (e) {
    console.error("Company GET error:", e);
    return NextResponse.json({ error: "Failed to load company" }, { status: 500 });
  }
}

/** POST /api/companies — create company for current employer if none exists. */
export async function POST(request: Request) {
  try {
    const employer = await getEmployerFromSession(request);
    if (!employer) return NextResponse.json({ error: "Sign in as employer to create a company" }, { status: 401 });

    const existing = await prisma.company.findUnique({ where: { userId: employer.userId } });
    if (existing) return NextResponse.json({ id: existing.id, userId: existing.userId });

    const user = await prisma.user.findUnique({ where: { id: employer.userId }, select: { email: true } });
    const body = await request.json().catch(() => ({}));
    const name = typeof body?.name === "string" ? body.name.trim() : (user?.email ? user.email.split("@")[0] : "Company") || "Company";
    const companyId = typeof body?.companyId === "string" ? body.companyId.trim() || "N/A" : "N/A";
    const contactEmail = (typeof body?.contactEmail === "string" ? body.contactEmail.trim().toLowerCase() : "") || user?.email?.trim().toLowerCase() || "";
    const contactPhone = typeof body?.contactPhone === "string" ? body.contactPhone.trim() : "—";

    if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });
    if (!contactEmail) return NextResponse.json({ error: "contactEmail or user email required" }, { status: 400 });

    const company = await prisma.company.create({
      data: {
        userId: employer.userId,
        name,
        companyId,
        contactEmail,
        contactPhone: contactPhone || "—",
        availableSlots: 10,
      },
    });
    return NextResponse.json({ id: company.id, userId: company.userId });
  } catch (e) {
    console.error("Company POST error:", e);
    return NextResponse.json({ error: "Failed to create company" }, { status: 500 });
  }
}

/** PATCH /api/companies — update current employer's company. */
export async function PATCH(request: Request) {
  try {
    const ctx = await getEmployerCompanyFromSession(request);
    if (!ctx) return NextResponse.json({ error: "Sign in as employer to update your company" }, { status: 401 });
    const company = await prisma.company.findUnique({ where: { id: ctx.companyId } });
    if (!company) return NextResponse.json({ error: "Company not found" }, { status: 404 });
    const body = await request.json().catch(() => ({}));
    const update: Record<string, unknown> = {};
    if (typeof body?.name === "string") update.name = body.name.trim();
    if (typeof body?.companyId === "string") update.companyId = body.companyId.trim();
    if (typeof body?.contactEmail === "string") update.contactEmail = body.contactEmail.trim();
    if (typeof body?.contactPhone === "string") update.contactPhone = body.contactPhone.trim();
    if (typeof body?.bio === "string") update.bio = body.bio.trim() || null;
    if (typeof body?.website === "string") update.website = body.website.trim() || null;
    if (typeof body?.industry === "string") update.industry = body.industry.trim() || null;
    if (typeof body?.employeeCount === "string") update.employeeCount = body.employeeCount.trim() || null;
    if (typeof body?.address === "string") update.address = body.address.trim() || null;
    if (typeof body?.linkedIn === "string") update.linkedIn = body.linkedIn.trim() || null;
    if (body?.logo !== undefined) update.logo = typeof body.logo === "string" && body.logo.trim() ? body.logo.trim() : null;
    await prisma.company.update({ where: { id: ctx.companyId }, data: update as never });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Company PATCH error:", e);
    return NextResponse.json({ error: "Failed to update company" }, { status: 500 });
  }
}
