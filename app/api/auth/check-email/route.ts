import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/auth/check-email?email=...&role=EMPLOYER|CANDIDATE
 * Returns whether the email is taken and, if so, for which role (same role = "email is taken" for this flow).
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = (searchParams.get("email") ?? "").trim().toLowerCase();
    const role = searchParams.get("role") === "EMPLOYER" ? "EMPLOYER" : "CANDIDATE";

    if (!email || email.length < 3) {
      return NextResponse.json({ taken: false });
    }

    const existing = await prisma.user.findUnique({
      where: { email },
      select: { role: true },
    });

    if (!existing) {
      return NextResponse.json({ taken: false });
    }

    const asRole = existing.role as "EMPLOYER" | "CANDIDATE";
    const taken = true;
    const sameRole = asRole === role;

    return NextResponse.json({
      taken,
      asRole,
      message:
        sameRole && role === "EMPLOYER"
          ? "This email is already registered as an employer. Please log in."
          : sameRole && role === "CANDIDATE"
            ? "This email is already registered as a candidate. Please log in."
            : role === "EMPLOYER"
              ? "This email is registered as a candidate. Please log in or use a different email for employer registration."
              : "This email is registered as an employer. Please log in or use a different email.",
    });
  } catch (e) {
    console.error("Check email error:", e);
    return NextResponse.json({ taken: false });
  }
}
