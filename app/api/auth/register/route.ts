import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

/**
 * POST /api/auth/register
 * Body: email, password, role ("CANDIDATE" | "EMPLOYER").
 * Creates the user only. For EMPLOYER, the client must then log in and call POST /api/companies
 * to create the company (avoids transaction/DB issues and gives clearer errors).
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

    const existing = await prisma.user.findUnique({
      where: { email },
      ...(role === "EMPLOYER" ? { include: { company: { select: { id: true } } } } : {}),
    });
    if (existing) {
      const withCompany = existing as { id: string; company?: { id: string } };
      return NextResponse.json({
        error: "Email already registered",
        userId: withCompany.id,
        ...(role === "EMPLOYER" && withCompany.company && { companyId: withCompany.company.id }),
      }, { status: 200 });
    }

    const passwordHash = hashPassword(password);
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
