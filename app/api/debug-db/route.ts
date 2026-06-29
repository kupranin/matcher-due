import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type EnvStatus = "set" | "missing";

function envFlag(name: string): EnvStatus {
  const v = process.env[name];
  return v && String(v).trim().length > 0 ? "set" : "missing";
}

function supabasePublicKey(): EnvStatus {
  return envFlag("NEXT_PUBLIC_SUPABASE_ANON_KEY") === "set" ||
    envFlag("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") === "set"
    ? "set"
    : "missing";
}

/**
 * Open /api/debug-db on your deployment to diagnose Supabase / Postgres connectivity.
 * Does not expose secret values.
 */
export async function GET() {
  const env = {
    DATABASE_URL: envFlag("DATABASE_URL"),
    DIRECT_URL: envFlag("DIRECT_URL"),
    NEXT_PUBLIC_SUPABASE_URL: envFlag("NEXT_PUBLIC_SUPABASE_URL"),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: supabasePublicKey(),
    SUPABASE_SERVICE_ROLE_KEY: envFlag("SUPABASE_SERVICE_ROLE_KEY"),
  };

  const missing = Object.entries(env)
    .filter(([, status]) => status === "missing")
    .map(([name]) => name);

  if (env.DATABASE_URL === "missing") {
    return NextResponse.json(
      {
        ok: false,
        hint:
          "DATABASE_URL is not set on Vercel. Settings → Environment Variables → Production → add DATABASE_URL and DIRECT_URL from Supabase Connect, then Redeploy.",
        env,
        missing,
      },
      { status: 503 }
    );
  }

  const checks: Record<string, { ok: boolean; error?: string }> = {};

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.ping = { ok: true };
  } catch (err) {
    const message = (err as Error)?.message ?? String(err);
    checks.ping = { ok: false, error: message };
    return NextResponse.json(
      {
        ok: false,
        hint: connectionHint(message),
        env,
        missing,
        checks,
      },
      { status: 503 }
    );
  }

  try {
    await prisma.vacancy.findFirst({ select: { id: true } });
    checks.vacanciesTable = { ok: true };
  } catch (err) {
    const message = (err as Error)?.message ?? String(err);
    checks.vacanciesTable = { ok: false, error: message };
  }

  try {
    const rows = await prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'vacancies'
        AND column_name = 'title_en'
      LIMIT 1
    `;
    checks.bilingualColumns = {
      ok: rows.length > 0,
      error:
        rows.length > 0
          ? undefined
          : "Column vacancies.title_en missing. Run prisma/sql/add-bilingual-content-columns.sql in Supabase SQL Editor, or npx prisma db push.",
    };
  } catch (err) {
    const message = (err as Error)?.message ?? String(err);
    checks.bilingualColumns = { ok: false, error: message };
  }

  try {
    await prisma.session.findFirst({ select: { id: true } });
    checks.sessionsTable = { ok: true };
  } catch (err) {
    const message = (err as Error)?.message ?? String(err);
    checks.sessionsTable = {
      ok: false,
      error: `${message} — run prisma/create-sessions-table.sql in Supabase SQL Editor.`,
    };
  }

  const schemaOk = Object.values(checks).every((c) => c.ok);
  const supabaseOk =
    env.NEXT_PUBLIC_SUPABASE_URL === "set" &&
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "set" &&
    env.SUPABASE_SERVICE_ROLE_KEY === "set";

  const hints: string[] = [];
  if (missing.length > 0) {
    hints.push(`Set missing env on Vercel (Production): ${missing.join(", ")}`);
  }
  if (!checks.vacanciesTable?.ok || !checks.bilingualColumns?.ok) {
    hints.push(
      "Apply DB schema: run prisma/sql/add-bilingual-content-columns.sql in Supabase SQL Editor, then redeploy."
    );
  }
  if (!checks.sessionsTable?.ok) {
    hints.push("Create sessions table: run prisma/create-sessions-table.sql in Supabase.");
  }
  if (!supabaseOk) {
    hints.push(
      "Photo uploads need NEXT_PUBLIC_SUPABASE_URL, anon/publishable key, and SUPABASE_SERVICE_ROLE_KEY on Vercel."
    );
  }

  const ok = schemaOk && missing.filter((m) => m !== "SUPABASE_SERVICE_ROLE_KEY").length === 0;

  return NextResponse.json({
    ok,
    message: ok
      ? "Database connected and core schema looks good."
      : "Database reachable but configuration or schema needs attention.",
    env,
    missing,
    checks,
    supabaseReady: supabaseOk,
    hints,
  });
}

function connectionHint(message: string): string {
  if (message.includes("auth") || message.includes("password")) {
    return "Wrong database password. Reset in Supabase → Project Settings → Database, update DATABASE_URL/DIRECT_URL on Vercel, redeploy.";
  }
  if (message.includes("reach") || message.includes("ECONNREFUSED")) {
    return "Cannot reach database. Use Supabase pooler URI (not localhost). Set DATABASE_URL and DIRECT_URL on Vercel Production.";
  }
  if (message.includes("prepared")) {
    return "Add ?pgbouncer=true to DATABASE_URL when using Supabase Transaction pooler (port 6543).";
  }
  return "Check DATABASE_URL/DIRECT_URL on Vercel and redeploy.";
}
