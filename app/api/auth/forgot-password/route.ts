import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";

const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

function generateResetToken(): string {
  return randomBytes(32).toString("hex");
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof (body as { email?: string }).email === "string"
      ? (body as { email: string }).email.trim().toLowerCase()
      : "";

    if (!email || email.length < 3) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    // Always return same message to avoid email enumeration
    const message = "If an account exists with this email, we've sent you a link to reset your password.";

    if (!user) {
      return NextResponse.json({ ok: true, message });
    }

    const token = generateResetToken();
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MS);

    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    await prisma.passwordResetToken.create({
      data: { token, userId: user.id, expiresAt },
    });

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const defaultLocale = "en";
    const resetLink = `${baseUrl}/${defaultLocale}/login/reset-password?token=${token}`;

    // Optional: send email (e.g. Resend) when RESEND_API_KEY is set
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendKey}`,
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM || "Matcher <noreply@matcher.ge>",
            to: [user.email],
            subject: "Reset your Matcher password",
            html: `<!DOCTYPE html><html><body style="font-family:sans-serif;"><p>You asked to reset your password. Click the link below (valid for 1 hour):</p><p><a href="${resetLink}">Reset password</a></p><p>If you didn't request this, you can ignore this email.</p></body></html>`,
          }),
        });
        if (!res.ok) {
          const err = await res.text();
          console.error("Resend error:", err);
        }
      } catch (e) {
        console.error("Failed to send reset email:", e);
      }
    } else if (process.env.NODE_ENV === "development") {
      // In development, return the link so testers can use it without email
      return NextResponse.json({ ok: true, message, resetLink });
    }

    return NextResponse.json({ ok: true, message });
  } catch (e) {
    console.error("Forgot password error:", e);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
