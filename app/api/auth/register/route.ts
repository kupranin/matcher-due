import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

/**
 * POST /api/auth/register
 * Body: email, password, role ("CANDIDATE" | "EMPLOYER").
 * When role is EMPLOYER, also pass: companyName, companyId, contactEmail, contactPhone
 * so the company is created in the same transaction as the user (ensures company exists after register).
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

    if (role === "EMPLOYER") {
      const companyName = typeof body?.companyName === "string" ? body.companyName.trim() : "";
      const companyId = typeof body?.companyId === "string" ? body.companyId.trim() || "N/A" : "N/A";
      const contactEmail = typeof body?.contactEmail === "string" ? body.contactEmail.trim().toLowerCase() : "";
      const contactPhone = typeof body?.contactPhone === "string" ? body.contactPhone.trim() : "";
      if (!companyName || companyName.length < 2) {
        return NextResponse.json({ error: "Company name required" }, { status: 400 });
      }
      if (!contactEmail || contactEmail.length < 3) {
        return NextResponse.json({ error: "Contact email required" }, { status: 400 });
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return NextResponse.json({ error: "Email already registered", userId: existingUser.id }, { status: 200 });
      }

      const passwordHash = hashPassword(password);
      const { user, company } = await prisma.$transaction(async (tx) => {
        const u = await tx.user.create({
          data: { email, passwordHash, role },
        });
        const c = await tx.company.create({
          data: {
            userId: u.id,
            name: companyName,
            companyId,
            contactEmail: contactEmail || email,
            contactPhone: contactPhone || "",
          },
        });
        return { user: u, company: c };
      });
      return NextResponse.json({ userId: user.id, companyId: company.id });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered", userId: existing.id }, { status: 200 });
    }

    const passwordHash = hashPassword(password);
    const user = await prisma.user.create({
      data: { email, passwordHash, role },
    });
    return NextResponse.json({ userId: user.id });
  } catch (e) {
    console.error("Register error:", e);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
