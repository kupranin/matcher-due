/**
 * Server-side: compute match score from Prisma CandidateProfile + Vacancy.
 * Used when creating/updating a Match and for any server-rendered deck.
 */

import type { CandidateProfile, VacancyProfile } from "./matchCalculation";
import { calculateMatch, normalizeEducationLevel } from "./matchCalculation";

type SkillLevel = "Beginner" | "Intermediate" | "Advanced";

function toSkillLevel(s: string): SkillLevel {
  if (s === "Beginner" || s === "Intermediate" || s === "Advanced") return s;
  return "Intermediate";
}

/** Build CandidateProfile for calculation from Prisma candidate (with skills). */
export function candidateToProfile(c: {
  locationCityId: string;
  salaryMin: number;
  willingToRelocate: boolean;
  experienceMonths: number;
  educationLevel: string;
  workTypes: string[];
  skills: Array<{ name: string; level: string }>;
}): CandidateProfile {
  return {
    locationCityId: c.locationCityId,
    salaryMin: c.salaryMin,
    willingToRelocate: c.willingToRelocate,
    experienceMonths: c.experienceMonths,
    educationLevel: normalizeEducationLevel(c.educationLevel),
    workTypes: c.workTypes?.length ? c.workTypes : ["Full-time"],
    skills: c.skills.map((s) => ({ name: s.name, level: toSkillLevel(s.level) })),
  };
}

/** Build VacancyProfile for calculation from Prisma vacancy (with skills). */
export function vacancyToProfile(v: {
  locationCityId: string;
  salaryMax: number;
  isRemote: boolean;
  requiredExperienceMonths: number;
  requiredEducationLevel: string;
  workType: string;
  skills: Array<{ name: string; level: string; weight: number }>;
}): VacancyProfile {
  return {
    locationCityId: v.locationCityId,
    isRemote: v.isRemote,
    salaryMax: v.salaryMax,
    requiredExperienceMonths: v.requiredExperienceMonths ?? 0,
    requiredEducationLevel: normalizeEducationLevel(v.requiredEducationLevel),
    workType: v.workType || "Full-time",
    skills: v.skills.map((s) => ({
      name: s.name,
      level: toSkillLevel(s.level),
      weight: Math.min(5, Math.max(1, s.weight ?? 3)),
    })),
  };
}

/** Compute match percentage (0–100) for a candidate–vacancy pair. */
export function computeMatchScore(
  candidate: Parameters<typeof candidateToProfile>[0],
  vacancy: Parameters<typeof vacancyToProfile>[0]
): number {
  const cProfile = candidateToProfile(candidate);
  const vProfile = vacancyToProfile(vacancy);
  return calculateMatch(cProfile, vProfile);
}
