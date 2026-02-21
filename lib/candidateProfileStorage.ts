/**
 * Candidate profile storage (localStorage MVP).
 * Used by userFlow, cabinet, and cabinet/profile.
 */

import type { CandidateProfile } from "./matchCalculation";
import type { EducationLevel } from "./matchCalculation";
import { GEORGIAN_CITIES } from "./georgianLocations";
import { MOCK_CANDIDATE_PROFILE } from "./matchMockData";

export const CANDIDATE_PROFILE_KEY = "matcher_candidate_profile";
export const CANDIDATE_USER_ID_KEY = "matcher_candidate_user_id";
export const CANDIDATE_PROFILE_ID_KEY = "matcher_candidate_profile_id";

export function getCandidateUserId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(CANDIDATE_USER_ID_KEY);
}

export function getCandidateProfileId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(CANDIDATE_PROFILE_ID_KEY);
}

export interface StoredCandidateProfile {
  /** For match calculation */
  profile: CandidateProfile;
  /** For profile page / display */
  fullName: string;
  email: string;
  phone: string;
  /** Optional display-only fields */
  bio?: string;
  job?: string;
  linkedIn?: string;
  languages?: string;
}

type SkillLevel = "Beginner" | "Intermediate" | "Advanced";

/** Parse experience text (e.g. "1 year", "6 months") to months */
export function parseExperienceMonths(text: string): number {
  const t = text.trim().toLowerCase();
  const yearMatch = t.match(/(\d+)\s*(year|yr)/);
  const monthMatch = t.match(/(\d+)\s*(month|mo)/);
  if (yearMatch) return parseInt(yearMatch[1], 10) * 12;
  if (monthMatch) return parseInt(monthMatch[1], 10);
  if (/^\d+$/.test(t)) return parseInt(t, 10);
  return 6; // fallback
}

/** Map userFlow workType to workTypes array */
function workTypeToArray(workType: string | null): string[] {
  if (!workType) return ["Full-time"];
  const map: Record<string, string> = {
    "full-time": "Full-time",
    "part-time": "Part-time",
    temp: "Temporary",
    remote: "Remote",
  };
  return [map[workType] ?? "Full-time"];
}

/** Map userFlow skills to CandidateProfile skills */
function mapSkills(skills: { name: string; level?: SkillLevel }[]): { name: string; level: SkillLevel }[] {
  return skills.map((s) => ({
    name: s.name,
    level: (s.level as SkillLevel) ?? "Intermediate",
  }));
}

export function buildProfileFromUserFlow(params: {
  job: string | null;
  experience: "yes" | "no" | null;
  experienceText: string;
  workType: string | null;
  skills: { name: string; level?: SkillLevel }[];
  locationCityId: string | null;
  willingToRelocate?: boolean;
  salary: string;
  education?: EducationLevel;
}): CandidateProfile {
  const {
    experience,
    experienceText,
    workType,
    skills,
    locationCityId,
    willingToRelocate = false,
    salary,
    education,
  } = params;

  const salaryMin = Math.max(0, parseInt(salary.replace(/\s/g, ""), 10) || 0) || 800;
  const experienceMonths = experience === "yes" ? parseExperienceMonths(experienceText) : 0;

  return {
    locationCityId: locationCityId ?? "tbilisi",
    salaryMin,
    willingToRelocate,
    experienceMonths,
    educationLevel: education ?? "High School",
    skills: mapSkills(skills),
    workTypes: workTypeToArray(workType),
  };
}

export function saveCandidateProfile(stored: StoredCandidateProfile): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CANDIDATE_PROFILE_KEY, JSON.stringify(stored));
  } catch (e) {
    console.warn("Failed to save candidate profile", e);
  }
}

export function loadCandidateProfile(): StoredCandidateProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CANDIDATE_PROFILE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredCandidateProfile;
    if (parsed?.profile && typeof parsed.profile === "object") return parsed;
    return null;
  } catch (e) {
    console.warn("Failed to load candidate profile", e);
    return null;
  }
}

/** Get CandidateProfile for match calculation. Uses stored profile or fallback. */
export function getCandidateProfileForMatch(): CandidateProfile {
  const stored = loadCandidateProfile();
  return stored?.profile ?? MOCK_CANDIDATE_PROFILE;
}

/** Build CandidateProfile from profile page form data */
export function buildProfileFromProfilePage(params: {
  location: string;
  locationCityId?: string;
  salary: string;
  experience: string;
  skills: { name: string; level?: SkillLevel }[];
  workTypes: string[];
  willingToRelocate?: boolean;
}): CandidateProfile {
  const { location, locationCityId, salary, experience, skills, workTypes, willingToRelocate } = params;
  const profile = loadCandidateProfile()?.profile;
  const resolvedCityId =
    locationCityId ??
    (profile && "locationCityId" in profile ? profile.locationCityId : undefined) ??
    (location.trim()
      ? GEORGIAN_CITIES.find((c) => c.nameEn.toLowerCase().includes(location.trim().toLowerCase()))?.id
      : undefined) ??
    "tbilisi";
  return {
    locationCityId: resolvedCityId,
    salaryMin: Math.max(0, parseInt(salary.replace(/\s/g, ""), 10) || 0) || (profile?.salaryMin ?? 800),
    willingToRelocate: willingToRelocate ?? profile?.willingToRelocate ?? false,
    experienceMonths: experience.trim() ? parseExperienceMonths(experience) : (profile?.experienceMonths ?? 0),
    educationLevel: profile?.educationLevel ?? "High School",
    skills: mapSkills(skills),
    workTypes: workTypes.length > 0 ? workTypes : (profile?.workTypes ?? ["Full-time"]),
  };
}
