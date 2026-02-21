import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";
    const role = body?.role === "EMPLOYER" ? "EMPLOYER" : "CANDIDATE";

    if (!email || email.length < 3) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    if (!password || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
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
