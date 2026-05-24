/**
 * Legacy runtime template translation (used when bilingual DB columns are empty).
 */

import { prisma } from "@/lib/db";
import { getFallbackJobTemplate } from "@/lib/jobTemplates";
import { normalizeContentLocale, resolveJobRoleSlug, type ContentLocale } from "@/lib/jobRoleSlug";
import { translateSkillLabel } from "@/lib/bilingualContent";

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
        const name = templateSkill ?? translateSkillLabel(s.name, targetLocale, sourceLocale ?? "en");
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
      name: translateSkillLabel(s.name, targetLocale, sourceLocale ?? "en"),
    })),
    jobRoleSlug: slug,
    sourceLocale,
    translated: false,
  };
}
