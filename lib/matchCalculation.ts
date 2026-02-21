/**
 * Matcher.ge Match Calculation Logic
 *
 * 1. Pre-Calculation Filter (Hard Gate) — disqualify if binary requirements fail
 * 2. Weighted Scoring — experience, education, skills with employer-assigned weights (1–5)
 * 3. Final Aggregation — weighted average × 100
 */

export type SkillLevel = "Beginner" | "Intermediate" | "Advanced";

export type EducationLevel = "None" | "High School" | "Bachelor" | "Master" | "PhD";

/** Numeric mapping for skill levels (used for partial credit) */
const SKILL_LEVEL_NUM: Record<SkillLevel, number> = {
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
};

/** Numeric mapping for education (higher = more) */
const EDUCATION_LEVEL_NUM: Record<EducationLevel, number> = {
  None: 0,
  "High School": 1,
  Bachelor: 2,
  Master: 3,
  PhD: 4,
};

/** Normalize API/DB education string to EducationLevel */
export function normalizeEducationLevel(value: string | null | undefined): EducationLevel {
  if (!value || typeof value !== "string") return "High School";
  const v = value.trim();
  if (v === "None") return "None";
  if (v === "High School" || v.toLowerCase() === "high school") return "High School";
  if (v === "Bachelor" || v.toLowerCase() === "bachelor") return "Bachelor";
  if (v === "Master" || v.toLowerCase() === "master") return "Master";
  if (v === "PhD" || v.toLowerCase() === "phd") return "PhD";
  return "High School";
}

export interface CandidateSkill {
  name: string;
  level: SkillLevel;
}

export interface VacancySkill {
  name: string;
  level: SkillLevel;
  weight: number; // 1–5, employer priority
}

export interface CandidateProfile {
  /** City ID for geography check (must match vacancy or willingToRelocate / remote) */
  locationCityId: string;
  salaryMin: number; // GEL/month
  willingToRelocate: boolean;
  experienceMonths: number;
  educationLevel: EducationLevel;
  skills: CandidateSkill[];
  workTypes: string[]; // e.g. ["Full-time", "Part-time", "Remote"]
}

export interface VacancyProfile {
  /** City ID for geography check */
  locationCityId: string;
  isRemote: boolean;
  salaryMax: number; // GEL/month
  requiredExperienceMonths: number;
  requiredEducationLevel: EducationLevel;
  /** Weight 1–5 for experience segment (default 3) */
  experienceWeight?: number;
  /** Weight 1–5 for education segment (default 3) */
  educationWeight?: number;
  skills: VacancySkill[];
  workType: string;
}

/** 1. Pre-Calculation Filter (Hard Gate) — returns false if candidate is disqualified */
export function passesPreCalcFilter(
  candidate: CandidateProfile,
  vacancy: VacancyProfile
): boolean {
  // Geography: must match city, be remote role, or candidate has "Willing to Relocate"
  const geographyOk =
    vacancy.isRemote ||
    vacancy.locationCityId === candidate.locationCityId ||
    candidate.willingToRelocate;

  if (!geographyOk) return false;

  // Financial Viability: vacancy's maximum budget >= 80% of candidate's minimum salary
  const financialOk = vacancy.salaryMax >= candidate.salaryMin * 0.8;

  if (!financialOk) return false;

  return true;
}

/** Normalize API/DB skill level to SkillLevel so we never get NaN. */
function normalizeSkillLevel(level: string | null | undefined): SkillLevel {
  if (!level || typeof level !== "string") return "Intermediate";
  const v = level.trim();
  if (v === "Beginner") return "Beginner";
  if (v === "Advanced") return "Advanced";
  return "Intermediate";
}

/** Partial credit for skill: userLevel / requiredLevel (cap at 1). Accepts any string so API values (e.g. "Expert") don't produce NaN. */
function skillScore(userLevel: SkillLevel | string, requiredLevel: SkillLevel | string): number {
  const u = SKILL_LEVEL_NUM[normalizeSkillLevel(userLevel)];
  const r = SKILL_LEVEL_NUM[normalizeSkillLevel(requiredLevel)];
  if (u >= r) return 1.0;
  return u / r; // e.g. Beginner(1) / Advanced(3) = 1/3
}

/** Experience score: min(1, userMonths / requiredMonths) */
function experienceScore(
  userMonths: number,
  requiredMonths: number
): number {
  if (requiredMonths <= 0) return 1.0;
  if (userMonths >= requiredMonths) return 1.0;
  return userMonths / requiredMonths;
}

/** Education score: meets = 1, below = penalty 0.5 */
const EDUCATION_PENALTY = 0.5;

function educationScore(
  userLevel: EducationLevel,
  requiredLevel: EducationLevel
): number {
  if (EDUCATION_LEVEL_NUM[userLevel] >= EDUCATION_LEVEL_NUM[requiredLevel]) {
    return 1.0;
  }
  return EDUCATION_PENALTY;
}

/** 2 & 3. Weighted scoring + final aggregation — returns 0–100 (rounded) */
export function calculateMatch(
  candidate: CandidateProfile,
  vacancy: VacancyProfile
): number {
  if (!passesPreCalcFilter(candidate, vacancy)) return 0;

  const segments: { score: number; weight: number }[] = [];

  // Experience — weight 1–5 (default 3)
  const expWeight = Math.min(5, Math.max(1, vacancy.experienceWeight ?? 3));
  const expScore = experienceScore(
    candidate.experienceMonths,
    vacancy.requiredExperienceMonths
  );
  segments.push({ score: expScore, weight: expWeight });

  // Education — weight 1–5 (default 3)
  const eduWeight = Math.min(5, Math.max(1, vacancy.educationWeight ?? 3));
  const eduScore = educationScore(
    candidate.educationLevel,
    vacancy.requiredEducationLevel
  );
  segments.push({ score: eduScore, weight: eduWeight });

  // Skills — each has its own weight from vacancy
  for (const vs of vacancy.skills) {
    const cs = candidate.skills.find(
      (s) => s.name.toLowerCase() === vs.name.toLowerCase()
    );
    const skillScoreVal = cs
      ? skillScore(cs.level, vs.level)
      : 0; // no skill = 0 for that segment
    segments.push({ score: skillScoreVal, weight: vs.weight });
  }

  const sumPoints = segments.reduce((acc, s) => acc + s.score * s.weight, 0);
  const sumWeights = segments.reduce((acc, s) => acc + s.weight, 0);

  if (sumWeights <= 0) return 100; // no requirements = perfect

  const raw = (sumPoints / sumWeights) * 100;
  const rounded = Math.round(raw);
  return Number.isFinite(rounded) ? Math.min(100, Math.max(0, rounded)) : 0;
}
