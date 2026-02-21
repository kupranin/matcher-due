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
    const vercelHint =
      "On Vercel: go to your project → Settings → Environment Variables. Add DATABASE_URL and DIRECT_URL (use the same Supabase connection string for both). Use the Transaction pooler (port 6543) or Session pooler (port 5432) from Supabase → Project Settings → Database → Connection string. Apply to Production (and Preview if needed), then redeploy.";
    const localHint =
      "On localhost: create a .env file (copy .env.example), set DATABASE_URL and DIRECT_URL with your Supabase connection strings, then restart the dev server.";
    return NextResponse.json(
      {
        ok: false,
        hint: process.env.VERCEL ? vercelHint : localHint,
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
    const vercelHints: Record<string, string> = {
      auth: "Wrong database password. In Vercel env vars, update DATABASE_URL and DIRECT_URL with the correct Supabase password (Supabase → Project Settings → Database → reset if needed).",
      reach: "Vercel cannot reach the database. Check DATABASE_URL host (use the pooler host from Supabase → Database → Connection string). Ensure env vars are set for Production and redeploy.",
      prepared: "Add ?pgbouncer=true to DATABASE_URL (use Supabase Transaction pooler, port 6543).",
      default: "Set DATABASE_URL and DIRECT_URL in Vercel → Settings → Environment Variables (Supabase → Database → Connection string). Redeploy after saving.",
    };
    const localHint = isMaxClients
      ? "On localhost: use Transaction pooler (port 6543) with ?pgbouncer=true&connection_limit=3 in .env. Restart the dev server."
      : message.includes("auth") || message.includes("password")
        ? "Wrong database password. Update .env with the password from Supabase Project Settings → Database."
        : message.includes("reach") || message.includes("ECONNREFUSED")
          ? "Check DATABASE_URL host/port. Use the connection string from Supabase Project Settings → Database."
          : message.includes("prepared")
            ? "Add ?pgbouncer=true to DATABASE_URL (use Supabase Transaction pooler, port 6543)."
            : "Fix DATABASE_URL in .env from Supabase Project Settings → Database, then restart the dev server.";
    const hint = process.env.VERCEL
      ? (message.includes("auth") || message.includes("password") ? vercelHints.auth : message.includes("reach") || message.includes("ECONNREFUSED") ? vercelHints.reach : message.includes("prepared") ? vercelHints.prepared : vercelHints.default)
      : localHint;
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
