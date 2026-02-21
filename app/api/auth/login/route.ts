import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/auth";
import { generateSessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SEC } from "@/lib/session";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const b = body as Record<string, unknown>;
    const email = typeof b?.email === "string" ? b.email.trim().toLowerCase() : "";
    const password = typeof b?.password === "string" ? b.password : "";
    const roleChoice = b?.role === "EMPLOYER" ? "EMPLOYER" : "CANDIDATE";

    if (!email || email.length < 3) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    if (!password) {
      return NextResponse.json({ error: "Password required" }, { status: 400 });
    }

    let user: { id: string; email: string; role: string; passwordHash: string } | null;
    try {
      user = await prisma.user.findUnique({ where: { email } });
    } catch (dbErr) {
      const err = dbErr as Error & { code?: string };
      const msg = err?.message ?? String(dbErr);
      const code = err?.code ?? "";
      console.error("Login DB findUnique error:", code || msg, msg);
      return NextResponse.json(
        {
          error: "Database unavailable. Ensure the app is connected to the database (e.g. run: npx prisma db push).",
          debug: process.env.NODE_ENV === "development" ? msg : undefined,
        },
        { status: 503 }
      );
    }
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    if (!user.passwordHash || user.passwordHash.length < 10) {
      return NextResponse.json(
        { error: "This account has no password set. Use “Create one” to register, or reset password." },
        { status: 401 }
      );
    }

    let valid = false;
    try {
      valid = verifyPassword(password, user.passwordHash);
    } catch {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    if (user.role !== roleChoice) {
      return NextResponse.json(
        { error: roleChoice === "EMPLOYER" ? "This account is for candidates. Use business login or create a company account." : "This account is for employers. Use candidate login." },
        { status: 403 }
      );
    }

    const token = generateSessionToken();
    const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SEC * 1000);

    try {
      await prisma.session.create({
        data: { token, userId: user.id, expiresAt },
      });
    } catch (sessionErr) {
      const err = sessionErr as Error & { code?: string };
      console.error("Login session create error:", err?.message ?? sessionErr);
      const hint =
        process.env.NODE_ENV === "development" && err?.message
          ? err.message
          : "Run the SQL in prisma/create-sessions-table.sql in the same Supabase project your app uses (Table Editor → check for 'sessions' table).";
      return NextResponse.json(
        {
          error: `Could not create session. ${hint}`,
        },
        { status: 503 }
      );
    }

    const res = NextResponse.json({
      userId: user.id,
      email: user.email,
      role: user.role,
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
    const err = e as Error;
    console.error("Login error:", err?.message ?? e);
    const isPrisma = err?.name === "PrismaClientKnownRequestError" || err?.message?.includes("prisma");
    const message =
      process.env.NODE_ENV === "development" && err?.message
        ? `Login failed: ${err.message}`
        : isPrisma
          ? "Login failed. Database may not be set up — run: npx prisma db push"
          : "Login failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
