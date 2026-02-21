import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

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

const logLevels = process.env.NODE_ENV === "development" ? (["error", "warn"] as "error"[]) : (["error"] as "error"[]);

const prismaOptions = datasourceUrl
  ? { datasources: { db: { url: datasourceUrl } }, log: logLevels }
  : { log: logLevels };

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient(prismaOptions as unknown as ConstructorParameters<typeof PrismaClient>[0]);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
