/**
 * Session cookie and token helpers for server-side auth.
 */

import { randomBytes } from "crypto";

export const SESSION_COOKIE_NAME = "matcher_session";
export const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 30; // 30 days

export function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

/** Read session token from the request (Authorization: Bearer or Cookie). */
export function getSessionTokenFromRequest(request: Request): string | undefined {
  const auth = request.headers.get("Authorization");
  if (typeof auth === "string" && auth.startsWith("Bearer ")) {
    const t = auth.slice(7).trim();
    if (t.length > 0) return t;
  }
  const cookieHeader = request.headers.get("Cookie");
  if (typeof cookieHeader === "string") {
    const name = SESSION_COOKIE_NAME + "=";
    const start = cookieHeader.indexOf(name);
    if (start !== -1) {
      const valueStart = start + name.length;
      const end = cookieHeader.indexOf(";", valueStart);
      const value = end === -1 ? cookieHeader.slice(valueStart) : cookieHeader.slice(valueStart, end);
      const t = value.trim();
      if (t.length > 0) return t;
    }
  }
  return undefined;
}

export function sessionCookieOptions(expiresAt: Date): {
  name: string;
  value: string;
  path: string;
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax";
  maxAge: number;
  expires: Date;
} {
  return {
    name: SESSION_COOKIE_NAME,
    value: "", // set by caller
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE_SEC,
    expires: expiresAt,
  };
}
