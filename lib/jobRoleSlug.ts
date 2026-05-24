/**
 * Cross-language job role slug resolution.
 * Job templates share a canonical slug across EN/KA locales — used for matching
 * and automatic vacancy translation without duplicating vacancy rows.
 */

import { JOB_TITLE_EN_TO_KA } from "@/prisma/data/job-title-en-to-ka";
import { getFallbackJobTemplate, getFallbackJobTemplates } from "@/lib/jobTemplates";

export type ContentLocale = "en" | "ka";

function normalizeTitle(title: string): string {
  return title.trim().toLowerCase();
}

/** Build title → slug map from fallback templates and EN↔KA title tables. */
function buildTitleToSlugMap(): Map<string, string> {
  const map = new Map<string, string>();

  for (const locale of ["en", "ka"] as const) {
    for (const role of getFallbackJobTemplates(locale)) {
      map.set(normalizeTitle(role.title), role.slug);
    }
  }

  for (const [enTitle, kaTitle] of Object.entries(JOB_TITLE_EN_TO_KA)) {
    const enRole = getFallbackJobTemplates("en").find((r) => r.title === enTitle);
    if (enRole) {
      map.set(normalizeTitle(enTitle), enRole.slug);
      map.set(normalizeTitle(kaTitle), enRole.slug);
    }
  }

  return map;
}

let titleToSlugCache: Map<string, string> | null = null;

function getTitleToSlugMap(): Map<string, string> {
  if (!titleToSlugCache) titleToSlugCache = buildTitleToSlugMap();
  return titleToSlugCache;
}

/** Resolve a job title (any locale) to its canonical slug, if known. */
export function resolveJobRoleSlug(title: string | null | undefined): string | null {
  if (!title || typeof title !== "string") return null;
  const normalized = normalizeTitle(title);
  if (!normalized) return null;
  return getTitleToSlugMap().get(normalized) ?? null;
}

/** English title for a slug (used for role-family heuristics). */
export function getEnglishTitleForSlug(slug: string | null | undefined): string | null {
  if (!slug) return null;
  return getFallbackJobTemplate(slug, "en")?.title ?? null;
}

/** Normalize API locale param. */
export function normalizeContentLocale(locale: string | null | undefined): ContentLocale {
  return locale === "ka" ? "ka" : "en";
}
