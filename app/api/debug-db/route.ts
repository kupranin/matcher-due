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
        hint:
          "DATABASE_URL is not set. On localhost: create a .env file in the project root (copy from .env.example), set DATABASE_URL and DIRECT_URL with your Supabase connection strings, then restart the dev server. On Vercel: add DATABASE_URL in Project → Settings → Environment Variables, then redeploy.",
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
    const isMaxClients = /max clients|MaxClientsInSessionMode/i.test(message);
    const hint = isMaxClients
      ? "On localhost: the app now auto-switches to the Transaction pooler (port 6543) in development. Restart the dev server (npm run dev). If you still see this, close other apps using the DB or set DATABASE_URL to the Transaction pooler URL from Supabase (Dashboard → Database → Connection string → Transaction, port 6543, add ?pgbouncer=true&connection_limit=3)."
      : message.includes("auth") || message.includes("password")
        ? "Wrong database password. In Supabase: Project Settings → Database → reset password if needed, then put the new password in .env DATABASE_URL and DIRECT_URL (replace [YOUR-PASSWORD] in the URI)."
        : message.includes("reach") || message.includes("ECONNREFUSED")
          ? "App cannot reach the database. Check DATABASE_URL host/port. For Supabase use the connection string from Project Settings → Database (Session pooler, port 5432)."
          : message.includes("prepared")
            ? "Add ?pgbouncer=true to DATABASE_URL (use Supabase Transaction pooler, port 6543)."
            : "Fix DATABASE_URL in .env from Supabase Project Settings → Database, then restart the dev server.";
    return NextResponse.json(
      {
        ok: false,
        error: message,
        hint,
        env: { DATABASE_URL: "set", DIRECT_URL: hasDirectUrl ? "set" : "missing" },
      },
      { status: 503 }
    );
  }
}
