/**
 * Server-side vacancy translation for cross-language matching.
 * Uses JobRoleTemplate rows (slug + locale) when available, with fallback templates.
 */

import { prisma } from "@/lib/db";
import { getFallbackJobTemplate } from "@/lib/jobTemplates";
import kaMessages from "@/messages/ka.json";
import enMessages from "@/messages/en.json";
import { normalizeContentLocale, resolveJobRoleSlug, type ContentLocale } from "@/lib/jobRoleSlug";

type VacancySkill = { name: string; level?: string; weight?: number; isRequired?: boolean };

export type VacancyForTranslation = {
  title: string;
  description?: string | null;
  jobRoleSlug?: string | null;
  sourceLocale?: string | null;
  skills?: VacancySkill[];
};

export type TranslatedVacancyFields = {
  title: string;
  description: string | null;
  skills: VacancySkill[];
  jobRoleSlug: string | null;
  sourceLocale: ContentLocale | null;
  translated: boolean;
};

const skillEnToKa = kaMessages.skillNames as Record<string, string>;
const skillKaToEn = Object.fromEntries(
  Object.entries(skillEnToKa).map(([en, ka]) => [ka.toLowerCase(), en])
) as Record<string, string>;

function translateSkillName(name: string, targetLocale: ContentLocale, sourceLocale: ContentLocale): string {
  const trimmed = name.trim();
  if (!trimmed || targetLocale === sourceLocale) return trimmed;

  if (targetLocale === "ka") {
    return skillEnToKa[trimmed] ?? trimmed;
  }
  const fromKa = skillKaToEn[trimmed.toLowerCase()];
  if (fromKa) return fromKa;
  // Also try matching via EN keys when stored skill is already English
  return (enMessages.skillNames as Record<string, string>)[trimmed] ?? trimmed;
}

async function getTemplateBySlug(slug: string, locale: ContentLocale) {
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
    // DB unavailable — use fallback
  }

  const fallback = getFallbackJobTemplate(slug, locale);
  if (!fallback) return null;
  return {
    title: fallback.title,
    description: fallback.description,
    skills: fallback.skills.map((s) => s.skillName),
  };
}

/**
 * Translate vacancy display fields to the user's locale.
 * Matching still uses the same vacancy row — only presentation changes.
 */
export async function translateVacancyForLocale(
  vacancy: VacancyForTranslation,
  targetLocaleInput: string | null | undefined
): Promise<TranslatedVacancyFields> {
  const targetLocale = normalizeContentLocale(targetLocaleInput);
  const slug = vacancy.jobRoleSlug?.trim() || resolveJobRoleSlug(vacancy.title);
  const sourceLocale = vacancy.sourceLocale ? normalizeContentLocale(vacancy.sourceLocale) : null;
  const skills = vacancy.skills ?? [];

  if (sourceLocale === targetLocale) {
    return {
      title: vacancy.title,
      description: vacancy.description ?? null,
      skills,
      jobRoleSlug: slug,
      sourceLocale,
      translated: false,
    };
  }

  if (slug) {
    const template = await getTemplateBySlug(slug, targetLocale);
    if (template && template.title.trim() !== vacancy.title.trim()) {
      const translatedSkills = skills.map((s, i) => {
        const templateSkill = template.skills[i];
        const name = templateSkill ?? translateSkillName(s.name, targetLocale, sourceLocale ?? "en");
        return { ...s, name };
      });

      return {
        title: template.title,
        description: template.description || vacancy.description || null,
        skills: translatedSkills,
        jobRoleSlug: slug,
        sourceLocale: sourceLocale ?? (targetLocale === "en" ? "ka" : "en"),
        translated: true,
      };
    }
  }

  return {
    title: vacancy.title,
    description: vacancy.description ?? null,
    skills: skills.map((s) => ({
      ...s,
      name: translateSkillName(s.name, targetLocale, sourceLocale ?? "en"),
    })),
    jobRoleSlug: slug,
    sourceLocale,
    translated: false,
  };
}
