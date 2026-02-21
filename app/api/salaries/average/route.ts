import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/** Normalize job title to slug for grouping (e.g. "Retail Cashier" → "retail-cashier", "Waiter/Waitress" → "waiter"). */
function jobTitleToSlug(jobTitle: string | null): string | null {
  if (!jobTitle || typeof jobTitle !== "string") return null;
  const t = jobTitle.trim().toLowerCase();
  if (!t) return null;
  if (t === "waitress" || t === "waiter") return "waiter";
  return t
    .replace(/\s*\/\s*.*$/, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

/**
 * GET /api/salaries/average
 * Compute average salaryMin (GEL/month) from existing candidates, grouped by job title (slug).
 * Used for recommended salary when posting vacancies or showing in cabinet.
 */
export async function GET() {
  try {
    const profiles = await prisma.candidateProfile.findMany({
      where: { salaryMin: { gt: 0 } },
      select: { jobTitle: true, salaryMin: true },
    });

    const bySlug: Record<string, { sum: number; count: number }> = {};

    for (const p of profiles) {
      const slug = jobTitleToSlug(p.jobTitle);
      if (!slug) continue;
      if (!bySlug[slug]) bySlug[slug] = { sum: 0, count: 0 };
      bySlug[slug].sum += p.salaryMin;
      bySlug[slug].count += 1;
    }

    const averages: Record<string, number> = {};
    for (const [slug, { sum, count }] of Object.entries(bySlug)) {
      if (count > 0) averages[slug] = Math.round(sum / count);
    }

    return NextResponse.json({ bySlug: averages });
  } catch (e) {
    console.error("Salaries average error:", e);
    return NextResponse.json({ bySlug: {} }, { status: 200 });
  }
}
