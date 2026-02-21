/**
 * Session cookie and token helpers for server-side auth.
 */

import { randomBytes } from "crypto";

export const SESSION_COOKIE_NAME = "matcher_session";
export const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 30; // 30 days

export function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
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
