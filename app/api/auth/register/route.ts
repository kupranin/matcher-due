import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

/**
 * POST /api/auth/register
 * Body: email, password, role ("CANDIDATE" | "EMPLOYER").
 * For EMPLOYER: optional companyName, companyId, contactEmail, contactPhone.
 * When company fields are provided, creates user and company in one flow; vacancies link to this company.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";
    const role = body?.role === "EMPLOYER" ? "EMPLOYER" : "CANDIDATE";

    if (!email || email.length < 3) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    if (!password || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const companyName = typeof body?.companyName === "string" ? body.companyName.trim() : "";
    const companyId = typeof body?.companyId === "string" ? body.companyId.trim() || "N/A" : "N/A";
    const contactEmail = typeof body?.contactEmail === "string" ? body.contactEmail.trim().toLowerCase() : email;
    const contactPhone = typeof body?.contactPhone === "string" ? body.contactPhone.trim() : "";
    const createCompany = role === "EMPLOYER" && companyName.length >= 2 && contactEmail.length >= 3;

    const existing = await prisma.user.findUnique({
      where: { email },
      ...(role === "EMPLOYER" ? { include: { company: { select: { id: true } } } } : {}),
    });
    if (existing) {
      const withCompany = existing as { id: string; company?: { id: string } | null };
      if (withCompany.company) {
        return NextResponse.json({
          error: "Email already registered",
          userId: withCompany.id,
          companyId: withCompany.company.id,
        }, { status: 200 });
      }
      if (createCompany) {
        const company = await prisma.company.create({
          data: {
            userId: withCompany.id,
            name: companyName,
            companyId,
            contactEmail,
            contactPhone,
          },
        });
        return NextResponse.json({
          error: "Email already registered",
          userId: withCompany.id,
          companyId: company.id,
        }, { status: 200 });
      }
      return NextResponse.json({
        error: "Email already registered",
        userId: withCompany.id,
      }, { status: 200 });
    }

    const passwordHash = hashPassword(password);
    if (createCompany) {
      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: { email, passwordHash, role },
        });
        const company = await tx.company.create({
          data: {
            userId: user.id,
            name: companyName,
            companyId,
            contactEmail,
            contactPhone,
          },
        });
        return { userId: user.id, companyId: company.id };
      });
      return NextResponse.json(result);
    }
    const user = await prisma.user.create({
      data: { email, passwordHash, role },
    });
    return NextResponse.json({ userId: user.id });
  } catch (e) {
    const err = e as Error & { code?: string; meta?: unknown };
    console.error("Register error:", err?.message ?? e, err?.code, err?.meta);
    const isPrisma = err?.name === "PrismaClientKnownRequestError" || String(err?.message).includes("prisma");
    const hint = isPrisma && err?.code === "P2002"
      ? "Email or company may already be registered."
      : process.env.NODE_ENV === "development" && err?.message
        ? err.message
        : undefined;
    return NextResponse.json(
      { error: "Registration failed", ...(hint && { hint }) },
      { status: 500 }
    );
  }
}
