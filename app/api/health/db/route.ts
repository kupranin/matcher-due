import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/health/db — lightweight DB health check (SELECT 1).
 * Returns { ok, db } only. Safe for load balancers; no secrets.
 */
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, db: "up" }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: false, db: "down" }, { status: 503 });
  }
}
