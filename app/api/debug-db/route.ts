import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/** Mask URL for safe logging: show host + path only, no credentials. */
function maskDatabaseUrl(url: string): string {
  if (!url || typeof url !== "string") return "none";
  try {
    const normalized = url.replace(/^postgres(ql)?:\/\//, "https://");
    const parsed = new URL(normalized);
    const host = parsed.hostname ?? "";
    const port = parsed.port ? `:${parsed.port}` : "";
    return `***@${host}${port}${parsed.pathname || "/postgres"}`;
  } catch {
    return "invalid";
  }
}

/**
 * GET /api/debug-db — diagnose DB connectivity (no secrets).
 * Use on deployment to see exact error and env state. Fix DATABASE_URL/DIRECT_URL then redeploy.
 */
export async function GET() {
  const hasDatabaseUrl = !!process.env.DATABASE_URL;
  const hasDirectUrl = !!process.env.DIRECT_URL;
  const nodeEnv = process.env.NODE_ENV ?? "unknown";
  const vercelEnv = process.env.VERCEL_ENV ?? (process.env.VERCEL ? "preview" : "local");

  const payload: {
    hasDatabaseUrl: boolean;
    hasDirectUrl: boolean;
    prismaConnectOk: boolean;
    errorCode: string | null;
    errorMessage: string | null;
    nodeEnv: string;
    vercelEnv: string;
    databaseUrlMasked?: string;
    directUrlMasked?: string;
    hint?: string;
  } = {
    hasDatabaseUrl,
    hasDirectUrl,
    prismaConnectOk: false,
    errorCode: null,
    errorMessage: null,
    nodeEnv,
    vercelEnv,
  };

  if (hasDatabaseUrl) payload.databaseUrlMasked = maskDatabaseUrl(process.env.DATABASE_URL!);
  if (hasDirectUrl) payload.directUrlMasked = maskDatabaseUrl(process.env.DIRECT_URL!);

  if (!hasDatabaseUrl) {
    payload.errorMessage = "DATABASE_URL is not set";
    payload.hint =
      process.env.VERCEL
        ? "Vercel → Project → Settings → Environment Variables. Add DATABASE_URL and DIRECT_URL for Production (and Preview). Redeploy after saving."
        : "Add DATABASE_URL (and DIRECT_URL) to .env, then restart the dev server.";
    return NextResponse.json(payload, { status: 503 });
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    payload.prismaConnectOk = true;
    return NextResponse.json(payload, { status: 200 });
  } catch (err) {
    const e = err as Error & { code?: string };
    payload.errorMessage = e?.message ?? String(err);
    payload.errorCode = e?.code ?? null;

    const msg = payload.errorMessage;
    const vercelHints: Record<string, string> = {
      auth: "Wrong DB password. Update DATABASE_URL and DIRECT_URL in Vercel with the password from Supabase → Project Settings → Database.",
      reach: "Vercel cannot reach the DB. Use the connection string from Supabase → Database (Transaction pooler for DATABASE_URL). Set env for Production and redeploy.",
      prepared: "Use Supabase Transaction pooler URL with ?pgbouncer=true for DATABASE_URL.",
      env: "DIRECT_URL is required by Prisma for migrations. Add it in Vercel env vars (direct connection, not pooler).",
      default: "Set DATABASE_URL and DIRECT_URL in Vercel → Environment Variables. Redeploy after saving.",
    };
    if (msg.includes("auth") || msg.includes("password")) payload.hint = vercelHints.auth;
    else if (msg.includes("ECONNREFUSED") || msg.includes("reach") || msg.includes("ENOTFOUND")) payload.hint = vercelHints.reach;
    else if (msg.includes("prepared") || msg.includes("PreparedStatement")) payload.hint = vercelHints.prepared;
    else if (msg.includes("DIRECT_URL") || msg.includes("directUrl")) payload.hint = vercelHints.env;
    else payload.hint = process.env.VERCEL ? vercelHints.default : "Fix DATABASE_URL and DIRECT_URL in .env and restart.";

    return NextResponse.json(payload, { status: 503 });
  }
}
