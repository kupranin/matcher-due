/**
 * Resolve vacancy display fields for a locale.
 * Prefers bilingual columns stored on create; falls back to template lookup for legacy rows.
 */

import { translateVacancyForLocale as translateVacancyLegacy } from "./vacancyTranslationLegacy";
import { pickLocalizedDescription, pickLocalizedSkillName, pickLocalizedTitle } from "./bilingualContent";
import { normalizeContentLocale } from "./jobRoleSlug";

type VacancyRow = {
  title: string;
  description?: string | null;
  titleEn?: string | null;
  titleKa?: string | null;
  descriptionEn?: string | null;
  descriptionKa?: string | null;
  jobRoleSlug?: string | null;
  sourceLocale?: string | null;
  skills: Array<{
    name: string;
    nameEn?: string | null;
    nameKa?: string | null;
    level?: string;
    weight?: number;
    isRequired?: boolean;
  }>;
};

/** Return vacancy fields for API responses in the requested locale. */
export async function resolveVacancyForLocale(
  vacancy: VacancyRow,
  targetLocaleInput: string | null | undefined
): Promise<{
  title: string;
  description: string | null;
  skills: VacancyRow["skills"];
  translated: boolean;
}> {
  const targetLocale = normalizeContentLocale(targetLocaleInput);
  const hasStored = Boolean(vacancy.titleEn?.trim() && vacancy.titleKa?.trim());

  if (hasStored) {
    const sourceLocale = vacancy.sourceLocale
      ? normalizeContentLocale(vacancy.sourceLocale)
      : null;
    return {
      title: pickLocalizedTitle(vacancy, targetLocale),
      description: pickLocalizedDescription(vacancy, targetLocale),
      skills: vacancy.skills.map((s) => ({
        ...s,
        name: pickLocalizedSkillName(s, targetLocale),
      })),
      translated: sourceLocale !== null && sourceLocale !== targetLocale,
    };
  }

  const legacy = await translateVacancyLegacy(
    {
      title: vacancy.title,
      description: vacancy.description,
      jobRoleSlug: vacancy.jobRoleSlug,
      sourceLocale: vacancy.sourceLocale,
      skills: vacancy.skills,
    },
    targetLocale
  );

  return {
    title: legacy.title,
    description: legacy.description,
    skills: legacy.skills,
    translated: legacy.translated,
  };
}

/** @deprecated Use resolveVacancyForLocale — kept for imports */
export const translateVacancyForLocale = resolveVacancyForLocale;
