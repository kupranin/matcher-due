/**
 * Helpers to build vacancy/candidate cards from API for cabinet.
 */

import type { CandidateProfile, VacancyProfile } from "./matchCalculation";
import { passesPreCalcFilter, calculateMatch, normalizeEducationLevel } from "./matchCalculation";
import type { CandidateCard } from "./matchMockData";
import { GEORGIAN_CITIES } from "./georgianLocations";
import { getStockPhotosForJob } from "./vacancyStockPhotos";
import { getEnglishTitleForSlug, resolveJobRoleSlug } from "./jobRoleSlug";

/**
 * Shape of a vacancy card as used on the candidate side.
 *
 * NOTE: `description` is optional because not all vacancies in the API
 * necessarily provide it. When present, we normalize it to `string | null`
 * (never `undefined`) at construction time so render code can safely treat
 * "missing" as falsy.
 */
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
  description: string | null;
  /** True when vacancy skills intersect candidate skills (simple overlap). */
  topMatch: boolean;
};

function locationCityName(cityId: string, locale: "en" | "ka" = "en"): string {
  const c = GEORGIAN_CITIES.find((x) => x.id === cityId);
  if (!c) return cityId;
  return locale === "ka" && c.nameKa ? c.nameKa : c.nameEn;
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

export type RoleFamily =
  | "cleaning"
  | "reception"
  | "cashier"
  | "retail_sales"
  | "warehouse"
  | "hospitality_service"
  | "admin_support";

export type RoleMatchCategory = "strong" | "related" | "unrelated";

/** Normalize a free-text role/title into a coarse role family. */
export function getRoleFamily(title: string | null | undefined): RoleFamily | null {
  if (!title || typeof title !== "string") return null;
  const t = title.trim().toLowerCase();

  // CLEANING_FAMILY
  if (
    t.includes("clean") ||
    t.includes("housekeep") ||
    t.includes("janitor") ||
    t.includes("sanitation")
  )
    return "cleaning";

  // RECEPTION_FAMILY
  if (
    t.includes("reception") ||
    t.includes("front desk") ||
    t.includes("hostess") ||
    t.includes("host ") ||
    t.includes("guest relations") ||
    t.includes("appointment")
  )
    return "reception";

  // CASHIER_FAMILY
  if (t.includes("cashier") || t.includes("checkout") || t.includes("pos "))
    return "cashier";

  // RETAIL_SALES_FAMILY
  if (
    t.includes("sales consultant") ||
    t.includes("sales assistant") ||
    t.includes("shop assistant") ||
    t.includes("store consultant") ||
    t.includes("promoter") ||
    t.includes("merchandiser") ||
    t.includes("retail")
  )
    return "retail_sales";

  // WAREHOUSE_FAMILY
  if (
    t.includes("warehouse") ||
    t.includes("stock clerk") ||
    t.includes("inventory") ||
    t.includes("stockroom") ||
    t.includes("logistics")
  )
    return "warehouse";

  // HOSPITALITY_SERVICE_FAMILY
  if (
    t.includes("waiter") ||
    t.includes("waitress") ||
    t.includes("server") ||
    t.includes("barista") ||
    t.includes("kitchen") ||
    t.includes("dishwasher") ||
    t.includes("assistant cook") ||
    t.includes("ბარისტ") ||
    t.includes("მიმტან") ||
    t.includes("ღვიძ") ||
    t.includes("სამზარეულ") ||
    t.includes("თეფშ")
  )
    return "hospitality_service";

  // ADMIN_SUPPORT_FAMILY
  if (
    t.includes("administrative assistant") ||
    t.includes("office assistant") ||
    t.includes("support operator") ||
    t.includes("customer support") ||
    t.includes("finance assistant") ||
    t.includes("admin ") ||
    t.includes("ადმინ") ||
    t.includes("ოფის")
  )
    return "admin_support";

  // Georgian role families
  if (t.includes("დამლაგ") || t.includes("დასუფთ") || t.includes("სუფთ")) return "cleaning";
  if (t.includes("რეცეპ") || t.includes("მიღებ")) return "reception";
  if (t.includes("მოლარ") || t.includes("კას")) return "cashier";
  if (
    t.includes("გაყიდ") ||
    t.includes("გამყიდ") ||
    t.includes("კონსულტ") ||
    t.includes("მაღაზ") ||
    t.includes("მერჩ")
  )
    return "retail_sales";
  if (t.includes("საწყობ") || t.includes("ინვენტარ") || t.includes("ლოგისტ")) return "warehouse";

  return null;
}

/** Role relevance for employer browsing. Uses slug when available for cross-language matching. */
export function roleMatchCategoryFromTitles(
  vacancyTitle: string,
  candidatePreferredRole: string | null | undefined,
  vacancySlug?: string | null,
  candidateSlug?: string | null
): RoleMatchCategory {
  const vSlug = vacancySlug || resolveJobRoleSlug(vacancyTitle);
  const cSlug = candidateSlug || resolveJobRoleSlug(candidatePreferredRole);

  if (vSlug && cSlug) {
    if (vSlug === cSlug) return "strong";
    const vEn = getEnglishTitleForSlug(vSlug) ?? vacancyTitle;
    const cEn = getEnglishTitleForSlug(cSlug) ?? (candidatePreferredRole ?? "");
    return roleMatchCategoryFromEnglishTitles(vEn, cEn);
  }

  return roleMatchCategoryFromEnglishTitles(vacancyTitle, candidatePreferredRole);
}

function roleMatchCategoryFromEnglishTitles(
  vacancyTitle: string,
  candidatePreferredRole: string | null | undefined
): RoleMatchCategory {
  const vacancyFamily = getRoleFamily(vacancyTitle);
  const candidateFamily = getRoleFamily(candidatePreferredRole);

  // If we can't classify either side, treat as unrelated to avoid obviously wrong roles.
  if (!vacancyFamily || !candidateFamily) return "unrelated";

  if (vacancyFamily === candidateFamily) return "strong";

  // Explicit adjacency rules (none for cleaning → hospitality; cleaner should be strict).
  const RELATED: Record<RoleFamily, RoleFamily[]> = {
    cleaning: [], // cleaner should only see cleaning roles
    reception: ["admin_support"],
    cashier: ["retail_sales"],
    retail_sales: ["cashier"],
    warehouse: ["retail_sales"],
    hospitality_service: [],
    admin_support: ["reception"],
  };

  if (
    RELATED[vacancyFamily]?.includes(candidateFamily) ||
    RELATED[candidateFamily]?.includes(vacancyFamily)
  ) {
    return "related";
  }

  return "unrelated";
}

/** Salary compatibility for employer browsing (candidate within +15% of vacancy budget). */
function isSalaryCompatible(candidateMin: number, vacancyMax: number): boolean {
  if (!candidateMin || !vacancyMax) return true;
  // Product rule: candidate's minimum expectation is not more than 15% above vacancy budget.
  return candidateMin <= vacancyMax * 1.15;
}

/** Build vacancy cards with match % from API list and candidate profile. Only shows vacancies whose title matches candidate's preferred job (e.g. Barista → no Waiter). */
export function buildVacancyCardsWithMatch(
  apiVacancies: Array<{
    id: string;
    title: string;
    jobRoleSlug?: string | null;
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
    // The raw API vacancy may or may not include description.
    description?: string | null | undefined;
  }>,
  candidateProfile: CandidateProfile,
  /** Candidate's preferred job title (e.g. "Barista"). Vacancies not matching this are excluded. */
  candidatePreferredJob?: string | null,
  candidateJobRoleSlug?: string | null,
  displayLocale: "en" | "ka" = "en"
): VacancyCardFromApi[] {
  const candidateSkillSet = new Set(
    (candidateProfile.skills ?? [])
      .map((s) => (typeof s?.name === "string" ? s.name.trim().toLowerCase() : ""))
      .filter(Boolean)
  );

  return apiVacancies
    .filter((v) => {
      const cat = roleMatchCategoryFromTitles(
        v.title,
        candidatePreferredJob ?? null,
        v.jobRoleSlug,
        candidateJobRoleSlug
      );
      return cat !== "unrelated";
    })
    .map((v) => {
      const profile = apiVacancyToProfile(v);
      // Always compute a match score; if hard filters fail inside calculateMatch,
      // the score will be low (0–) but the vacancy will still be shown.
      const match = calculateMatch(candidateProfile, profile);
      const salaryStr =
        v.salaryMin != null
          ? `${v.salaryMin.toLocaleString()}–${v.salaryMax.toLocaleString()} GEL`
          : `${v.salaryMax.toLocaleString()} GEL`;

      const vacancySkills = (v.skills ?? [])
        .map((s) => (typeof s?.name === "string" ? s.name.trim().toLowerCase() : ""))
        .filter(Boolean);
      const topMatch = vacancySkills.some((name) => candidateSkillSet.has(name));

      return {
        id: v.id,
        title: v.title,
        company: v.company,
        location: locationCityName(v.locationCityId, displayLocale),
        workType: v.workType,
        salary: salaryStr,
        photo:
          v.photo?.trim() ||
          getStockPhotosForJob(v.title)[0] ||
          "https://images.unsplash.com/photo-1521737711867-e3b97395f902?w=800&q=80",
        profile,
        match,
        // Normalize to `string | null` so card code never sees `undefined`.
        description: v.description ?? null,
        topMatch,
      };
    })
    // Do not hide low-score vacancies; show all and let ranking happen via `match`.
    // Mapper above never returns `null`, so no explicit type predicate filter is needed.
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
): Array<CandidateCard & { match: number; age?: number | null; matchedSkills?: string[] }> {
  const MIN_MATCH_PERCENT = 40;
  const safeSkills = (c: (typeof apiCandidates)[0]) => Array.isArray(c.skills) ? c.skills : [];
  const toSkillLevel = (level: string | null | undefined): CandidateProfile["skills"][0]["level"] => {
    const v = level?.trim?.();
    if (v === "Beginner" || v === "Advanced") return v;
    return "Intermediate";
  };
  // Browsing: filter by role relevance & salary; then score and sort by match desc.
  return apiCandidates
    .filter((c) => {
      const roleCat = roleMatchCategoryFromTitles(vacancyTitle, c.jobTitle);
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

      // Compute matched skills as overlap between vacancy required skills and candidate skills.
      const vacancySkillNames = (vacancyProfile.skills ?? []).map((s) =>
        s.name.trim().toLowerCase()
      );
      const candidateSkillNames = skills.map((s) => s.name.trim().toLowerCase());
      const seen = new Set<string>();
      const matchedSkills: string[] = [];
      for (let i = 0; i < candidateSkillNames.length; i++) {
        const cand = candidateSkillNames[i];
        if (!cand) continue;
        if (!vacancySkillNames.includes(cand)) continue;
        if (seen.has(cand)) continue;
        seen.add(cand);
        matchedSkills.push(skills[i]!.name);
        if (matchedSkills.length >= 5) break;
      }

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
        matchedSkills: matchedSkills,
        profile,
        match,
      };
    })
    // Product rule: employer swipe deck should not show very low-fit candidates.
    .filter((c) => c.match >= MIN_MATCH_PERCENT)
    .sort((a, b) => b.match - a.match);
}
