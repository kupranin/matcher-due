import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const token = typeof (body as { token?: string }).token === "string"
      ? (body as { token: string }).token.trim()
      : "";
    const password = typeof (body as { password?: string }).password === "string"
      ? (body as { password: string }).password
      : "";

    if (!token) {
      return NextResponse.json({ error: "Invalid or expired reset link." }, { status: 400 });
    }
    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetRecord || resetRecord.expiresAt < new Date()) {
      if (resetRecord) {
        await prisma.passwordResetToken.delete({ where: { id: resetRecord.id } }).catch(() => {});
      }
      return NextResponse.json(
        { error: "This reset link has expired. Please request a new one." },
        { status: 400 }
      );
    }

    const passwordHash = hashPassword(password);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.delete({ where: { id: resetRecord.id } }),
    ]);

    return NextResponse.json({ ok: true, message: "Password updated. You can sign in now." });
  } catch (e) {
    console.error("Reset password error:", e);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
