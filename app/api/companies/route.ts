import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/** GET /api/companies?userId= — get company for employer (for cabinet profile). */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
    const company = await prisma.company.findUnique({
      where: { userId },
    });
    if (!company) return NextResponse.json(null);
    return NextResponse.json({
      id: company.id,
      userId: company.userId,
      name: company.name,
      companyId: company.companyId,
      contactEmail: company.contactEmail,
      contactPhone: company.contactPhone,
      bio: company.bio,
      website: company.website,
      industry: company.industry,
      employeeCount: company.employeeCount,
      address: company.address,
      linkedIn: company.linkedIn,
    });
  } catch (e) {
    console.error("Company get error:", e);
    return NextResponse.json({ error: "Failed to load company" }, { status: 500 });
  }
}

/** POST /api/companies — create company for user (e.g. after employer register). Body: userId, name, companyId, contactEmail, contactPhone. */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userId = typeof body?.userId === "string" ? body.userId.trim() : "";
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const companyId = typeof body?.companyId === "string" ? body.companyId.trim() : "N/A";
    const contactEmail = typeof body?.contactEmail === "string" ? body.contactEmail.trim().toLowerCase() : "";
    const contactPhone = typeof body?.contactPhone === "string" ? body.contactPhone.trim() : "";
    if (!userId || !name || !contactEmail) {
      return NextResponse.json({ error: "userId, name, and contactEmail required" }, { status: 400 });
    }
    const existing = await prisma.company.findUnique({ where: { userId } });
    if (existing) return NextResponse.json({ id: existing.id, userId: existing.userId });
    const company = await prisma.company.create({
      data: { userId, name, companyId, contactEmail, contactPhone },
    });
    return NextResponse.json({ id: company.id, userId: company.userId });
  } catch (e) {
    console.error("Company create error:", e);
    return NextResponse.json({ error: "Failed to create company" }, { status: 500 });
  }
}

/** PATCH /api/companies — update company. Body: userId + fields. */
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const userId = typeof body?.userId === "string" ? body.userId.trim() : "";
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
    const company = await prisma.company.findUnique({ where: { userId } });
    if (!company) return NextResponse.json({ error: "Company not found" }, { status: 404 });
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
    await prisma.company.update({ where: { userId }, data: update as never });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Company patch error:", e);
    return NextResponse.json({ error: "Failed to update company" }, { status: 500 });
  }
}
