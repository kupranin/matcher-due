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

type RoleMatchCategory = "strong" | "related" | "unrelated";

/** Map a free-text role/title into a coarse role family slug. */
function normalizeRoleToFamily(title: string | null | undefined): string | null {
  if (!title || typeof title !== "string") return null;
  const t = title.trim().toLowerCase();

  if (t.includes("clean") || t.includes("housekeep") || t.includes("janitor")) return "cleaner";
  if (t.includes("reception") || t.includes("front desk") || t.includes("hostess")) return "receptionist";
  if (t.includes("cashier") || t.includes("checkout")) return "cashier";
  if (t.includes("warehouse") || t.includes("stock") || t.includes("inventory")) return "warehouse";
  if (t.includes("sales") || t.includes("shop assistant") || t.includes("merchandiser")) return "sales";
  if (t.includes("cook") || t.includes("kitchen")) return "kitchen";
  if (t.includes("barista") || t.includes("coffee")) return "barista";
  if (t.includes("security") || t.includes("guard")) return "security";
  if (t.includes("driver") || t.includes("courier")) return "driver";

  return null;
}

/** Role relevance for employer browsing. */
function roleMatchCategory(vacancyTitle: string, candidatePreferredRole: string | null | undefined): RoleMatchCategory {
  const vacancyFamily = normalizeRoleToFamily(vacancyTitle);
  const candidateFamily = normalizeRoleToFamily(candidatePreferredRole);

  if (!vacancyFamily || !candidateFamily) {
    // When we can't confidently categorize, treat as related so we don't over-filter.
    return "related";
  }

  if (vacancyFamily === candidateFamily) return "strong";

  const RELATED: Record<string, string[]> = {
    cleaner: ["service", "housekeeping"],
    reception: ["sales", "customer_service"],
    receptionist: ["sales", "customer_service"],
    cashier: ["sales"],
    warehouse: ["sales", "driver"],
    sales: ["cashier"],
    kitchen: ["barista"],
  };

  if (RELATED[vacancyFamily]?.includes(candidateFamily) || RELATED[candidateFamily]?.includes(vacancyFamily)) {
    return "related";
  }

  return "unrelated";
}

/** Salary compatibility for employer browsing (candidate within +15% of vacancy budget). */
function isSalaryCompatible(candidateMin: number, vacancyMax: number): boolean {
  if (!candidateMin || !vacancyMax) return true;
  return candidateMin <= vacancyMax * 1.15;
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
    .filter((v) => {
      const cat = roleMatchCategory(v.title, candidatePreferredJob ?? null);
      return cat !== "unrelated";
    })
    .map((v) => {
      const profile = apiVacancyToProfile(v);
      // Always compute a match score; if hard filters fail inside calculateMatch,
      // the score will be low (0–) but the vacancy will still be shown.
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
    // Do not hide low-score vacancies; show all and let ranking happen via `match`.
    .filter((x): x is VacancyCardFromApi => x != null)
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
    age?: number | null;
    photo?: string | null;
    availableToWork?: boolean;
    skills: Array<{ name: string; level: string }>;
  }>,
  vacancyProfile: VacancyProfile,
  vacancyTitle: string
): Array<CandidateCard & { match: number; age?: number | null }> {
  const safeSkills = (c: (typeof apiCandidates)[0]) => Array.isArray(c.skills) ? c.skills : [];
  const toSkillLevel = (level: string | null | undefined): CandidateProfile["skills"][0]["level"] => {
    const v = level?.trim?.();
    if (v === "Beginner" || v === "Advanced") return v;
    return "Intermediate";
  };
  // Browsing: filter by role relevance & salary; then score and sort by match desc.
  return apiCandidates
    .filter((c) => {
      const roleCat = roleMatchCategory(vacancyTitle, c.jobTitle);
      if (roleCat === "unrelated") {
        return false;
      }
      return isSalaryCompatible(c.salaryMin, vacancyProfile.salaryMax);
    })
    .map((c) => {
      const skills = safeSkills(c);
      const profile: CandidateProfile = {
        locationCityId: c.locationCityId ?? "",
        salaryMin: Number(c.salaryMin) || 0,
        willingToRelocate: Boolean(c.willingToRelocate),
        experienceMonths: Number(c.experienceMonths) || 0,
        educationLevel: normalizeEducationLevel(c.educationLevel),
        workTypes: c.workTypes?.length ? c.workTypes : ["Full-time"],
        skills: skills.map((s) => ({ name: s.name, level: toSkillLevel(s.level) })),
      };
      const rawMatch = calculateMatch(profile, vacancyProfile);
      const match = Number.isFinite(rawMatch) ? Math.min(100, Math.max(0, Math.round(rawMatch))) : 50;
      return {
        id: c.id,
        name: c.fullName ?? "Candidate",
        job: c.jobTitle ?? "Candidate",
        location: locationCityName(c.locationCityId ?? ""),
        workType: (c.workTypes && c.workTypes[0]) ? c.workTypes[0] : "Full-time",
        skills: skills.map((s) => s.name).join(", "),
        photo: c.photo ?? undefined,
        age: c.age ?? null,
        profile,
        match,
      };
    })
    .sort((a, b) => b.match - a.match);
}
