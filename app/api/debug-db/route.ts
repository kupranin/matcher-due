import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * One-time debug: open /api/debug-db on your deployment to see the real DB error.
 * Remove this file after fixing the connection.
 */
export async function GET() {
  const hasDatabaseUrl = !!process.env.DATABASE_URL;
  const hasDirectUrl = !!process.env.DIRECT_URL;

  if (!hasDatabaseUrl) {
    return NextResponse.json(
      {
        ok: false,
        hint: "DATABASE_URL is not set on Vercel. Add it in Settings → Environment Variables (Production), then redeploy.",
        env: { DATABASE_URL: "missing", DIRECT_URL: hasDirectUrl ? "set" : "missing" },
      },
      { status: 503 }
    );
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, message: "Database connected." });
  } catch (err) {
    const e = err as Error;
    const message = e?.message ?? String(err);
    return NextResponse.json(
      {
        ok: false,
        error: message,
        hint:
          message.includes("auth") || message.includes("password")
            ? "Wrong database password or user. Reset password in Supabase → Project Settings → Database and update the URI on Vercel."
            : message.includes("reach") || message.includes("ECONNREFUSED")
              ? "Server cannot reach the database. Use the Session pooler URI (port 5432) from Supabase Connect, and ensure DATABASE_URL and DIRECT_URL are set for Production."
              : message.includes("prepared")
                ? "Add ?pgbouncer=true to the end of your DATABASE_URL and DIRECT_URL (Supabase Transaction pooler)."
                : "Check the error above and fix DATABASE_URL/DIRECT_URL on Vercel.",
        env: { DATABASE_URL: "set", DIRECT_URL: hasDirectUrl ? "set" : "missing" },
      },
      { status: 503 }
    );
  }
}
