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

/** Same-job match: candidate's preferred job must equal the vacancy title or be a more specific version of it (e.g. "Senior Cashier" for "Cashier"). No cross-role matches (e.g. "Customer Service Rep" for "Cashier"). */
function candidateJobMatchesVacancyStrict(candidateJobTitle: string | null | undefined, vacancyTitle: string): boolean {
  if (!vacancyTitle || !candidateJobTitle || typeof candidateJobTitle !== "string" || !candidateJobTitle.trim())
    return false;
  const vacancyNorm = normalizeJobTitleForMatch(vacancyTitle);
  const jobNorm = normalizeJobTitleForMatch(candidateJobTitle);
  if (!vacancyNorm || !jobNorm) return false;
  return vacancyNorm === jobNorm || (vacancyNorm.length >= 3 && jobNorm.includes(vacancyNorm));
}

/** True when we should show this vacancy to a candidate with the given preferred job. Same role only: vacancy title equals or is a more specific version of the preferred job (e.g. "Senior Barista" for "Barista"). */
function vacancyMatchesCandidatePreference(vacancyTitle: string, preferredJob: string | null | undefined): boolean {
  if (!preferredJob || typeof preferredJob !== "string" || !preferredJob.trim()) return true;
  const vacancyNorm = normalizeJobTitleForMatch(vacancyTitle);
  const jobNorm = normalizeJobTitleForMatch(preferredJob);
  if (!vacancyNorm || !jobNorm) return true;
  return vacancyNorm === jobNorm || (jobNorm.length >= 3 && vacancyNorm.includes(jobNorm));
}

/** Minimum match % to show a vacancy (lower = more opportunities shown). */
const OPPORTUNITIES_MATCH_THRESHOLD = 50;

/** Build vacancy cards with match % from API list and candidate profile. When candidatePreferredJob is set, only vacancies for that role (or more specific, e.g. Senior Barista for Barista) are shown. */
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
  /** Candidate's preferred job title. When set, only vacancies matching this role are shown. */
  candidatePreferredJob?: string | null
): VacancyCardFromApi[] {
  const cards = apiVacancies
    .map((v) => {
      const profile = apiVacancyToProfile(v);
      if (!passesPreCalcFilter(candidateProfile, profile)) return null;
      if (!vacancyMatchesCandidatePreference(v.title, candidatePreferredJob)) return null;
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
    .filter((x): x is VacancyCardFromApi => x != null && x.match >= OPPORTUNITIES_MATCH_THRESHOLD);

  // Sort by match % descending
  return cards.sort((a, b) => b.match - a.match);
}

/** True if candidate's preferred job matches the vacancy title (so employer only sees candidates looking for this role). Uses strict same-job matching. */
export function candidateJobMatchesVacancy(candidateJobTitle: string | null | undefined, vacancyTitle: string): boolean {
  if (!vacancyTitle) return true;
  return candidateJobMatchesVacancyStrict(candidateJobTitle, vacancyTitle);
}

/** Minimum match % to show a candidate to employer (lower = more candidates shown). */
const EMPLOYER_MATCH_THRESHOLD = 50;

/** Build candidate cards with match % from API list and vacancy profile (for employer cabinet). Only includes candidates whose preferred job matches the vacancy when vacancyTitle is provided; candidates with no preferred job are shown for any vacancy. */
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
  vacancyProfile: VacancyProfile,
  /** When set, only candidates whose job title matches this vacancy (or who have no preferred job) are shown. */
  vacancyTitle?: string | null
): Array<CandidateCard & { match: number }> {
  const safeSkills = (c: (typeof apiCandidates)[0]) => Array.isArray(c.skills) ? c.skills : [];
  const toSkillLevel = (level: string | null | undefined): CandidateProfile["skills"][0]["level"] => {
    const v = level?.trim?.();
    if (v === "Beginner" || v === "Advanced") return v;
    return "Intermediate";
  };
  return apiCandidates
    .filter((c) => c.availableToWork !== false)
    .filter((c) => !vacancyTitle || !c.jobTitle?.trim() || candidateJobMatchesVacancy(c.jobTitle, vacancyTitle))
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
    .filter((c) => c.match >= EMPLOYER_MATCH_THRESHOLD)
    .sort((a, b) => b.match - a.match);
}
