import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { SESSION_COOKIE_NAME } from "@/lib/session";

/** Clear session cookie so browser stops sending it (e.g. after DB wipe or expiry). */
function responseWithClearedSessionCookie(body: { userId: null; user: null }) {
  const res = NextResponse.json(body, { status: 200 });
  res.cookies.set(SESSION_COOKIE_NAME, "", {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    expires: new Date(0),
  });
  return res;
}

export async function GET(request: Request) {
  try {
    let token: string | undefined;
    const cookieHeader = request.headers.get("Cookie");
    if (cookieHeader) {
      const m = cookieHeader.match(new RegExp(`${SESSION_COOKIE_NAME.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]+)`));
      if (m?.[1]) token = m[1].trim();
    }
    if (!token) {
      const cookieStore = await cookies();
      token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    }
    if (!token) {
      return NextResponse.json({ userId: null, user: null }, { status: 200 });
    }

    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: { select: { id: true, email: true, role: true } } },
    });
    if (!session || session.expiresAt < new Date()) {
      if (session) {
        await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
      }
      return responseWithClearedSessionCookie({ userId: null, user: null });
    }

    const payload: { userId: string; user: { id: string; email: string; role: string }; token?: string } = {
      userId: session.user.id,
      user: {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
      },
    };
    if (session.user.role === "EMPLOYER") payload.token = token;
    return NextResponse.json(payload);
  } catch (e) {
    console.error("Session get error:", e);
    return responseWithClearedSessionCookie({ userId: null, user: null });
  }
}
