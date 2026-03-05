import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { generateSessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SEC } from "@/lib/session";

/** POST /api/auth/employer-register — create user + company + session. Redirect to /employer/post?registered=1 to add vacancy. */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";
    const companyName = typeof body?.companyName === "string" ? body.companyName.trim() : "";
    const companyId = typeof body?.companyId === "string" ? body.companyId.trim() || "N/A" : "N/A";
    const contactEmail = typeof body?.contactEmail === "string" ? body.contactEmail.trim().toLowerCase() : email;
    const contactPhone = typeof body?.contactPhone === "string" ? body.contactPhone.trim() : "—";

    if (!email || email.length < 3) return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    if (!password || password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    if (!companyName || companyName.length < 2) return NextResponse.json({ error: "Company name required (min 2 characters)" }, { status: 400 });
    if (!contactEmail || contactEmail.length < 3) return NextResponse.json({ error: "Contact email required" }, { status: 400 });

    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true, role: true } });
    if (existing) {
      const message =
        existing.role === "EMPLOYER"
          ? "This email is already registered as an employer. Please log in."
          : "This email is already registered as a candidate. Please log in or use a different email for employer registration.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const passwordHash = hashPassword(password);
    const token = generateSessionToken();
    const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SEC * 1000);

    const { userId, companyId: createdCompanyId } = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { email, passwordHash, role: "EMPLOYER" },
      });
      const company = await tx.company.create({
        data: {
          userId: user.id,
          name: companyName,
          companyId,
          contactEmail,
          contactPhone: contactPhone || "—",
          availableSlots: 10,
        },
      });
      await tx.session.create({ data: { token, userId: user.id, expiresAt } });
      return { userId: user.id, companyId: company.id };
    });

    const res = NextResponse.json({ userId, companyId: createdCompanyId, token });
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
    console.error("Employer register error:", e);
    const err = e as Error & { code?: string };
    const rawMessage = err?.message ?? String(e);
    // Always return a hint so the client can show it (e.g. missing DB column, connection error).
    const hint =
      rawMessage.length > 200 ? rawMessage.slice(0, 200) + "…" : rawMessage;
    return NextResponse.json(
      { error: "Registration failed. Please try again.", hint },
      { status: 500 }
    );
  }
}
