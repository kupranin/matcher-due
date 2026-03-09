import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

/** One-time boot log: verify env is loaded (host only, no credentials). */
function logDbConfigOnce(): void {
  const logged = (globalThis as unknown as { _dbConfigLogged?: boolean })._dbConfigLogged;
  if (logged) return;
  (globalThis as unknown as { _dbConfigLogged: boolean })._dbConfigLogged = true;
  const hasDb = !!process.env.DATABASE_URL;
  const hasDirect = !!process.env.DIRECT_URL;
  let host = "none";
  if (process.env.DATABASE_URL) {
    try {
      const u = process.env.DATABASE_URL.replace(/^postgres(ql)?:\/\//, "https://");
      const p = new URL(u);
      host = p.hostname + (p.port ? `:${p.port}` : "");
    } catch {
      host = "parse-error";
    }
  }
  // eslint-disable-next-line no-console
  console.info("[db] config check:", { hasDatabaseUrl: hasDb, hasDirectUrl: hasDirect, hostMasked: host });
}

/**
 * In development, use Supabase Transaction pooler (port 6543) with a small connection limit
 * so localhost doesn't hit "max clients" in Session mode (port 5432).
 */
function getDatasourceUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;
  if (process.env.NODE_ENV !== "development") return url;
  if (url.includes(":6543/") || url.includes("pgbouncer=true")) return url;
  if (url.includes(":5432/")) {
    const out = url.replace(/:5432\//, ":6543/");
    const sep = out.includes("?") ? "&" : "?";
    return `${out}${sep}pgbouncer=true&connection_limit=3`;
  }
  return url;
}

const datasourceUrl = getDatasourceUrl();

// Set the DATABASE_URL environment variable so Prisma reads it from the schema configuration
if (datasourceUrl) {
  process.env.DATABASE_URL = datasourceUrl;
}

const prismaOptions: { log?: ("error" | "warn")[] } = {
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
};

logDbConfigOnce();

export const prisma = globalForPrisma.prisma ?? new PrismaClient(prismaOptions);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
