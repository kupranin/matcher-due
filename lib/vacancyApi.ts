/**
 * Helpers to build vacancy/candidate cards from API for cabinet.
 */

import type { CandidateProfile, VacancyProfile } from "./matchCalculation";
import { passesPreCalcFilter, calculateMatch, normalizeEducationLevel } from "./matchCalculation";
import type { CandidateCard } from "./matchMockData";
import { GEORGIAN_CITIES } from "./georgianLocations";
import { getStockPhotosForJob } from "./vacancyStockPhotos";

export type VacancyCardFromApi = {
  id: string;
  title: string;
  company: string;
  location: string;
  workType: string;
  salary: string;
  photo: string;
  profile: VacancyProfile;
  match: number;
};

function locationCityName(cityId: string): string {
  const c = GEORGIAN_CITIES.find((x) => x.id === cityId);
  return c?.nameEn ?? cityId;
}

function apiSkillToVacancySkill(s: { name: string; level?: string; weight?: number }): { name: string; level: "Beginner" | "Intermediate" | "Advanced"; weight: number } {
  const level = s.level && ["Beginner", "Intermediate", "Advanced"].includes(s.level) ? (s.level as "Beginner" | "Intermediate" | "Advanced") : "Intermediate";
  return { name: s.name, level, weight: typeof s.weight === "number" && s.weight >= 1 && s.weight <= 5 ? s.weight : 3 };
}

/** Map API vacancy payload to VacancyProfile for match calculation */
export function apiVacancyToProfile(v: {
  locationCityId: string;
  salaryMax: number;
  salaryMin?: number | null;
  workType: string;
  isRemote?: boolean;
  requiredExperienceMonths?: number;
  requiredEducationLevel?: string;
  skills?: Array<{ name: string; level?: string; weight?: number }>;
}): VacancyProfile {
  return {
    locationCityId: v.locationCityId,
    isRemote: Boolean(v.isRemote),
    salaryMax: v.salaryMax,
    requiredExperienceMonths: v.requiredExperienceMonths ?? 0,
    requiredEducationLevel: normalizeEducationLevel(v.requiredEducationLevel),
    workType: v.workType || "Full-time",
    skills: (v.skills ?? []).map(apiSkillToVacancySkill),
  };
}

/** Normalize job title for matching so Waiter/Waitress and similar pairs match. */
function normalizeJobTitleForMatch(title: string): string {
  const t = title.trim().toLowerCase();
  if (t === "waitress" || t === "waiter") return "waiter";
  return t;
}

/** True if vacancy title matches candidate's preferred job (so we don't show Waiter to someone who wants Barista). */
function vacancyTitleMatchesPreferredJob(vacancyTitle: string, preferredJob: string | null | undefined): boolean {
  if (!preferredJob || typeof preferredJob !== "string") return true;
  const want = normalizeJobTitleForMatch(preferredJob);
  if (!want) return true;
  const vacancy = normalizeJobTitleForMatch(vacancyTitle);
  return vacancy.includes(want) || want.includes(vacancy);
}

/** Build vacancy cards with match % from API list and candidate profile. Only shows vacancies whose title matches candidate's preferred job (e.g. Barista → no Waiter). */
export function buildVacancyCardsWithMatch(
  apiVacancies: Array<{
    id: string;
    title: string;
    company: string;
    locationCityId: string;
    salaryMin?: number | null;
    salaryMax: number;
    workType: string;
    isRemote?: boolean;
    requiredExperienceMonths?: number;
    requiredEducationLevel?: string;
    skills?: Array<{ name: string; level?: string; weight?: number }>;
    photo?: string | null;
  }>,
  candidateProfile: CandidateProfile,
  /** Candidate's preferred job title (e.g. "Barista"). Vacancies not matching this are excluded. */
  candidatePreferredJob?: string | null
): VacancyCardFromApi[] {
  return apiVacancies
    .filter((v) => vacancyTitleMatchesPreferredJob(v.title, candidatePreferredJob))
    .map((v) => {
      const profile = apiVacancyToProfile(v);
      if (!passesPreCalcFilter(candidateProfile, profile)) return null;
      const match = calculateMatch(candidateProfile, profile);
      const salaryStr = v.salaryMin != null ? `${v.salaryMin.toLocaleString()}–${v.salaryMax.toLocaleString()} GEL` : `${v.salaryMax.toLocaleString()} GEL`;
      return {
        id: v.id,
        title: v.title,
        company: v.company,
        location: locationCityName(v.locationCityId),
        workType: v.workType,
        salary: salaryStr,
        photo: v.photo?.trim() || getStockPhotosForJob(v.title)[0] || "https://images.unsplash.com/photo-1521737711867-e3b97395f902?w=800&q=80",
        profile,
        match,
      };
    })
    .filter((x): x is VacancyCardFromApi => x != null && x.match >= 70)
    .sort((a, b) => b.match - a.match);
}

/** Build candidate cards with match % from API list and vacancy profile (for employer cabinet). */
export function buildCandidateCardsWithMatch(
  apiCandidates: Array<{
    id: string;
    fullName: string;
    jobTitle: string | null;
    locationCityId: string;
    salaryMin: number;
    workTypes: string[];
    experienceMonths: number;
    educationLevel: string;
    willingToRelocate: boolean;
    availableToWork?: boolean;
    skills: Array<{ name: string; level: string }>;
  }>,
  vacancyProfile: VacancyProfile
): Array<CandidateCard & { match: number }> {
  const safeSkills = (c: (typeof apiCandidates)[0]) => Array.isArray(c.skills) ? c.skills : [];
  const toSkillLevel = (level: string | null | undefined): CandidateProfile["skills"][0]["level"] => {
    const v = level?.trim?.();
    if (v === "Beginner" || v === "Advanced") return v;
    return "Intermediate";
  };
  return apiCandidates
    .filter((c) => c.availableToWork !== false)
    .map((c) => {
      const skills = safeSkills(c);
      const profile: CandidateProfile = {
        locationCityId: c.locationCityId,
        salaryMin: c.salaryMin,
        willingToRelocate: c.willingToRelocate,
        experienceMonths: c.experienceMonths,
        educationLevel: normalizeEducationLevel(c.educationLevel),
        workTypes: c.workTypes?.length ? c.workTypes : ["Full-time"],
        skills: skills.map((s) => ({ name: s.name, level: toSkillLevel(s.level) })),
      };
      const rawMatch = calculateMatch(profile, vacancyProfile);
      const match = Number.isFinite(rawMatch) ? Math.min(100, Math.max(0, Math.round(rawMatch))) : 0;
      return {
        id: c.id,
        name: c.fullName,
        job: c.jobTitle ?? "Candidate",
        location: locationCityName(c.locationCityId),
        workType: (c.workTypes && c.workTypes[0]) ? c.workTypes[0] : "Full-time",
        skills: skills.map((s) => s.name).join(", "),
        profile,
        match,
      };
    })
    .filter((c) => c.match >= 70)
    .sort((a, b) => b.match - a.match);
}
