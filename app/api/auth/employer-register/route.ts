import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { generateSessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SEC } from "@/lib/session";

/**
 * POST /api/auth/employer-register
 * Single-step employer registration: create user + company + session in one transaction.
 * Body: email, password, companyName, companyId?, contactEmail?, contactPhone?
 * Returns: userId, companyId, token. Sets session cookie. Redirect client to /employer/post?registered=1 to add vacancy.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";
    const companyName = typeof body?.companyName === "string" ? body.companyName.trim() : "";
    const companyIdRaw = typeof body?.companyId === "string" ? body.companyId.trim() : "";
    const contactEmailRaw = typeof body?.contactEmail === "string" ? body.contactEmail.trim().toLowerCase() : "";
    const contactPhoneRaw = typeof body?.contactPhone === "string" ? body.contactPhone.trim() : "";

    if (!email || email.length < 3) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    if (!password || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }
    if (!companyName || companyName.length < 2) {
      return NextResponse.json({ error: "Company name is required (at least 2 characters)" }, { status: 400 });
    }

    const contactEmail = contactEmailRaw || email;
    if (!contactEmail || contactEmail.length < 3) {
      return NextResponse.json({ error: "Contact email is required" }, { status: 400 });
    }

    // DB requires non-empty string for contactPhone; use placeholder when missing
    const companyId = companyIdRaw || "N/A";
    const contactPhone = contactPhoneRaw || "—";

    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        { error: "This email is already registered. Please log in." },
        { status: 400 }
      );
    }

    const passwordHash = hashPassword(password);
    const token = generateSessionToken();
    const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SEC * 1000);

    const { userId, companyId: createdCompanyId } = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: "EMPLOYER",
        },
      });
      const company = await tx.company.create({
        data: {
          userId: user.id,
          name: companyName,
          companyId,
          contactEmail,
          contactPhone,
          availableSlots: 10,
        },
      });
      await tx.session.create({
        data: { token, userId: user.id, expiresAt },
      });
      return { userId: user.id, companyId: company.id };
    });

    const res = NextResponse.json({
      userId,
      companyId: createdCompanyId,
      token,
    });
    res.cookies.set(SESSION_COOKIE_NAME, token, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE_SEC,
      expires: expiresAt,
    });
    return res;
  } catch (e) {
    const err = e as Error & { code?: string };
    console.error("Employer register error:", err?.message ?? e, err?.code);
    const isPrisma = err?.name === "PrismaClientKnownRequestError" || String(err?.message ?? "").includes("prisma");
    const hint =
      isPrisma && err?.code === "P2002"
        ? "This email may already be registered."
        : process.env.NODE_ENV === "development" && err?.message
          ? err.message
          : undefined;
    return NextResponse.json(
      { error: "Registration failed. Please try again.", ...(hint && { hint }) },
      { status: 500 }
    );
  }
}
