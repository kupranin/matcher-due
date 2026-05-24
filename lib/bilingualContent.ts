/**
 * Build and read bilingual (EN/KA) user content for DB storage.
 * Uses JobRoleTemplate + skill name maps — not machine translation APIs.
 */

import { prisma } from "@/lib/db";
import { getFallbackJobTemplate } from "@/lib/jobTemplates";
import { normalizeContentLocale, resolveJobRoleSlug, type ContentLocale } from "@/lib/jobRoleSlug";
import kaMessages from "@/messages/ka.json";

const skillEnToKa = kaMessages.skillNames as Record<string, string>;
const skillKaToEn = Object.fromEntries(
  Object.entries(skillEnToKa).map(([en, ka]) => [ka.trim().toLowerCase(), en])
) as Record<string, string>;

export type RoleTemplateCopy = {
  title: string;
  description: string;
  skills: string[];
};

async function getRoleTemplateCopy(slug: string, locale: ContentLocale): Promise<RoleTemplateCopy | null> {
  try {
    const row = await prisma.jobRoleTemplate.findUnique({
      where: { slug_locale: { slug, locale } },
      include: { skills: { orderBy: { weight: "desc" } } },
    });
    if (row) {
      return {
        title: row.title,
        description: row.description,
        skills: row.skills.map((s) => s.skillName),
      };
    }
  } catch {
    // DB unavailable
  }
  const fallback = getFallbackJobTemplate(slug, locale);
  if (!fallback) return null;
  return {
    title: fallback.title,
    description: fallback.description,
    skills: fallback.skills.map((s) => s.skillName),
  };
}

/** Map a skill label to the other locale using messages/ka.json skillNames. */
export function translateSkillLabel(name: string, targetLocale: ContentLocale, sourceLocale: ContentLocale): string {
  const trimmed = name.trim();
  if (!trimmed || targetLocale === sourceLocale) return trimmed;

  if (targetLocale === "ka") {
    return skillEnToKa[trimmed] ?? trimmed;
  }
  const fromKa = skillKaToEn[trimmed.toLowerCase()];
  if (fromKa) return fromKa;
  return trimmed;
}

export type BilingualJobFields = {
  jobRoleSlug: string | null;
  sourceLocale: ContentLocale;
  /** Primary title in the language the user entered */
  title: string;
  titleEn: string;
  titleKa: string;
  descriptionEn: string | null;
  descriptionKa: string | null;
};

export type BilingualSkillFields = {
  name: string;
  nameEn: string;
  nameKa: string;
  level: string;
  weight?: number;
  isRequired?: boolean;
};

/** Build EN+KA job title and description for persistence. */
export async function buildBilingualJobFields(input: {
  title: string;
  description?: string | null;
  jobRoleSlug?: string | null;
  sourceLocale: ContentLocale;
}): Promise<BilingualJobFields> {
  const sourceLocale = normalizeContentLocale(input.sourceLocale);
  const slug = input.jobRoleSlug?.trim() || resolveJobRoleSlug(input.title);
  const userTitle = input.title.trim();
  const userDescription = input.description?.trim() || null;

  const templateEn = slug ? await getRoleTemplateCopy(slug, "en") : null;
  const templateKa = slug ? await getRoleTemplateCopy(slug, "ka") : null;

  let titleEn: string;
  let titleKa: string;
  if (templateEn && templateKa) {
    titleEn = sourceLocale === "en" ? userTitle : templateEn.title;
    titleKa = sourceLocale === "ka" ? userTitle : templateKa.title;
  } else {
    titleEn = userTitle;
    titleKa = userTitle;
  }

  let descriptionEn: string | null;
  let descriptionKa: string | null;
  if (templateEn && templateKa) {
    descriptionEn =
      sourceLocale === "en"
        ? userDescription ?? templateEn.description
        : templateEn.description ?? userDescription;
    descriptionKa =
      sourceLocale === "ka"
        ? userDescription ?? templateKa.description
        : templateKa.description ?? userDescription;
  } else {
    descriptionEn = userDescription;
    descriptionKa = userDescription;
  }

  return {
    jobRoleSlug: slug,
    sourceLocale,
    title: sourceLocale === "ka" ? titleKa : titleEn,
    titleEn,
    titleKa,
    descriptionEn,
    descriptionKa,
  };
}

/** Build EN+KA skill rows for persistence. */
export function buildBilingualSkills(
  skills: Array<{ name: string; level?: string; weight?: number; isRequired?: boolean }>,
  sourceLocale: ContentLocale,
  jobRoleSlug?: string | null
): BilingualSkillFields[] {
  const locale = normalizeContentLocale(sourceLocale);
  const templateEn = jobRoleSlug ? getFallbackJobTemplate(jobRoleSlug, "en") : null;
  const templateKa = jobRoleSlug ? getFallbackJobTemplate(jobRoleSlug, "ka") : null;

  return skills.map((s, index) => {
    const userName = s.name.trim();
    let nameEn = translateSkillLabel(userName, "en", locale);
    let nameKa = translateSkillLabel(userName, "ka", locale);

    const enSkill = templateEn?.skills[index]?.skillName;
    const kaSkill = templateKa?.skills[index]?.skillName;
    if (enSkill && kaSkill) {
      if (locale === "en") {
        nameEn = userName;
        nameKa = kaSkill;
      } else {
        nameKa = userName;
        nameEn = enSkill;
      }
    }

    return {
      name: locale === "ka" ? nameKa : nameEn,
      nameEn,
      nameKa,
      level: s.level ?? "Intermediate",
      weight: s.weight,
      isRequired: s.isRequired,
    };
  });
}

export function pickLocalizedTitle(
  row: { title: string; titleEn?: string | null; titleKa?: string | null },
  locale: ContentLocale
): string {
  if (locale === "ka" && row.titleKa?.trim()) return row.titleKa.trim();
  if (locale === "en" && row.titleEn?.trim()) return row.titleEn.trim();
  return row.title;
}

export function pickLocalizedDescription(
  row: { description?: string | null; descriptionEn?: string | null; descriptionKa?: string | null },
  locale: ContentLocale
): string | null {
  if (locale === "ka" && row.descriptionKa?.trim()) return row.descriptionKa.trim();
  if (locale === "en" && row.descriptionEn?.trim()) return row.descriptionEn.trim();
  return row.description?.trim() || null;
}

export function pickLocalizedSkillName(
  row: { name: string; nameEn?: string | null; nameKa?: string | null },
  locale: ContentLocale
): string {
  if (locale === "ka" && row.nameKa?.trim()) return row.nameKa.trim();
  if (locale === "en" && row.nameEn?.trim()) return row.nameEn.trim();
  return row.name;
}

/** Bilingual preferred job title for candidate profiles. */
export async function buildBilingualCandidateJobTitle(input: {
  jobTitle: string | null | undefined;
  jobRoleSlug?: string | null;
  sourceLocale: ContentLocale;
}): Promise<{
  jobTitle: string | null;
  jobTitleEn: string | null;
  jobTitleKa: string | null;
  jobRoleSlug: string | null;
  sourceLocale: ContentLocale;
}> {
  const trimmed = input.jobTitle?.trim();
  const sourceLocale = normalizeContentLocale(input.sourceLocale);
  const slug = input.jobRoleSlug?.trim() || (trimmed ? resolveJobRoleSlug(trimmed) : null);

  if (!trimmed) {
    return {
      jobTitle: null,
      jobTitleEn: null,
      jobTitleKa: null,
      jobRoleSlug: slug,
      sourceLocale,
    };
  }

  const fields = await buildBilingualJobFields({
    title: trimmed,
    description: null,
    jobRoleSlug: slug,
    sourceLocale,
  });

  return {
    jobTitle: fields.title,
    jobTitleEn: fields.titleEn,
    jobTitleKa: fields.titleKa,
    jobRoleSlug: fields.jobRoleSlug,
    sourceLocale: fields.sourceLocale,
  };
}

export function pickLocalizedJobTitle(
  row: { jobTitle?: string | null; jobTitleEn?: string | null; jobTitleKa?: string | null },
  locale: ContentLocale
): string | null {
  if (locale === "ka" && row.jobTitleKa?.trim()) return row.jobTitleKa.trim();
  if (locale === "en" && row.jobTitleEn?.trim()) return row.jobTitleEn.trim();
  return row.jobTitle?.trim() || null;
}
