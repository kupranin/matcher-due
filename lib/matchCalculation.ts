/**
 * Matcher.ge Match Calculation Logic
 *
 * 1. Hard Gates (passesHardGate) — availability, position match, geography, finance
 * 2. Weighted Scoring — experience, education, skills with employer-assigned weights (1–5)
 * 3. Final Aggregation — weighted average × 100
 * 4. Viewer Visibility — shouldShowToViewer (employer threshold 60%)
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

  /** New: candidate must be available to be eligible. */
  availableToWork?: boolean;
  /** New: main position the candidate wants (e.g. "Cashier"). */
  primaryPosition?: string | null;
  /** New: additional desired positions. */
  desiredPositions?: string[] | null;
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

  /** New: required position title for this vacancy (e.g. "Cashier"). */
  positionTitle?: string | null;
}

export type ViewerType = "employer" | "candidate" | "admin";

export type GateReasons = {
  availabilityPassed: boolean;
  positionPassed: boolean;
  geographyPassed: boolean;
  financePassed: boolean;
  availabilityReason: string;
  positionReason: string;
  geographyReason: string;
  financeReason: string;
};

export interface GateResult {
  passed: boolean;
  reasons: GateReasons;
}

export interface MatchResult {
  eligible: boolean;
  matchPercent: number;
  gates: GateReasons;
  scores: {
    experience?: { score: number; weight: number };
    education?: { score: number; weight: number };
    skills?: Array<{ name: string; score: number; weight: number; candidateHasSkill: boolean }>;
  };
  aggregation: {
    sumPoints: number;
    sumWeights: number;
    raw: number;
    rounded: number;
  };
}

/** Normalize strings for matching: trim, collapse spaces, lowercase. */
function normalizeForMatch(value: string | null | undefined): string {
  if (!value || typeof value !== "string") return "";
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

/** Position matching (candidate vs vacancy). */
export function matchPosition(candidate: CandidateProfile, vacancy: VacancyProfile): boolean {
  const vacancyTitleNorm = normalizeForMatch(vacancy.positionTitle ?? "");
  if (!vacancyTitleNorm) {
    // If vacancy has no positionTitle configured, skip this gate (treated as pass by default).
    return true;
  }
  const positions = new Set<string>();
  if (candidate.primaryPosition) {
    const n = normalizeForMatch(candidate.primaryPosition);
    if (n) positions.add(n);
  }
  if (candidate.desiredPositions && Array.isArray(candidate.desiredPositions)) {
    for (const p of candidate.desiredPositions) {
      const n = normalizeForMatch(p);
      if (n) positions.add(n);
    }
  }
  if (positions.size === 0) {
    // Candidate has no declared positions; treat as mismatch.
    return false;
  }
  if (positions.has(vacancyTitleNorm)) return true;
  // Fallback: token/contains match (e.g. "Receptionist" matches "Senior Receptionist")
  const posList = Array.from(positions);
  return posList.some((p) => vacancyTitleNorm.includes(p) || p.includes(vacancyTitleNorm));
}

/**
 * 1. Hard Gates — availability, position, geography, finance.
 * Returns detailed reasons for debugging and UI.
 */
export function passesHardGate(candidate: CandidateProfile, vacancy: VacancyProfile): GateResult {
  // 0) Availability
  const availabilityPassed = candidate.availableToWork !== false;
  const availabilityReason = availabilityPassed ? "Candidate is available to work." : "Candidate is not available to work.";

  // 1) Position match
  const positionPassed = matchPosition(candidate, vacancy);
  const positionReason = positionPassed
    ? "Candidate's desired or primary position matches vacancy positionTitle."
    : "Candidate's positions do not include vacancy positionTitle.";

  // 2) Geography gate (with relocate / remote overrides)
  let geographyPassed = false;
  let geographyReason = "";
  if (candidate.willingToRelocate) {
    geographyPassed = true;
    geographyReason = "Candidate is willing to relocate.";
  } else if (vacancy.isRemote) {
    geographyPassed = true;
    geographyReason = "Vacancy is remote.";
  } else if (normalizeForMatch(candidate.locationCityId) && normalizeForMatch(candidate.locationCityId) === normalizeForMatch(vacancy.locationCityId)) {
    geographyPassed = true;
    geographyReason = "Candidate city matches vacancy city.";
  } else {
    geographyPassed = false;
    geographyReason = "Candidate city does not match vacancy city and candidate is not willing to relocate.";
  }

  // 3) Finance gate: vacancy.maxBudget >= 0.8 * candidate.minSalary
  // If candidate.minSalary is null: do NOT apply finance gate (show vacancy).
  // If vacancy.salaryMax is null: FAIL finance gate.
  let financePassed = false;
  let financeReason = "";
  const salaryMax = typeof vacancy.salaryMax === "number" ? vacancy.salaryMax : NaN;
  const salaryMin = typeof candidate.salaryMin === "number" ? candidate.salaryMin : NaN;
  if (!Number.isFinite(salaryMax)) {
    financePassed = false;
    financeReason = "Vacancy has no max salary (maxBudget required).";
  } else if (!Number.isFinite(salaryMin)) {
    financePassed = true;
    financeReason = "Candidate has no min salary; finance gate skipped.";
  } else {
    const threshold = salaryMin * 0.8;
    financePassed = salaryMax >= threshold;
    financeReason = financePassed
      ? `Vacancy salaryMax (${salaryMax}) covers at least 80% of candidate salaryMin (${salaryMin}).`
      : `Vacancy salaryMax (${salaryMax}) is below 80% of candidate salaryMin (${salaryMin}).`;
  }

  const passed = availabilityPassed && positionPassed && geographyPassed && financePassed;
  return {
    passed,
    reasons: {
      availabilityPassed,
      positionPassed,
      geographyPassed,
      financePassed,
      availabilityReason,
      positionReason,
      geographyReason,
      financeReason,
    },
  };
}

/** Legacy filter: now delegates to passesHardGate. */
export function passesPreCalcFilter(candidate: CandidateProfile, vacancy: VacancyProfile): boolean {
  return passesHardGate(candidate, vacancy).passed;
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

/** 2 & 3. Weighted scoring + final aggregation — detailed result (0–100). */
export function calculateMatchResult(candidate: CandidateProfile, vacancy: VacancyProfile): MatchResult {
  const gate = passesHardGate(candidate, vacancy);
  if (!gate.passed) {
    return {
      eligible: false,
      matchPercent: 0,
      gates: gate.reasons,
      scores: {},
      aggregation: { sumPoints: 0, sumWeights: 0, raw: 0, rounded: 0 },
    };
  }

  const segments: {
    key: "experience" | "education" | `skill:${string}`;
    score: number;
    weight: number;
    meta?: { name?: string; hasSkill?: boolean };
  }[] = [];

  // Experience — weight 1–5 (default 3)
  const expWeight = Math.min(5, Math.max(1, vacancy.experienceWeight ?? 3));
  const expScore = experienceScore(candidate.experienceMonths, vacancy.requiredExperienceMonths);
  segments.push({ key: "experience", score: expScore, weight: expWeight });

  // Education — weight 1–5 (default 3)
  const eduWeight = Math.min(5, Math.max(1, vacancy.educationWeight ?? 3));
  const eduScore = educationScore(candidate.educationLevel, vacancy.requiredEducationLevel);
  segments.push({ key: "education", score: eduScore, weight: eduWeight });

  // Skills — each has its own weight from vacancy
  for (const vs of vacancy.skills) {
    const cs = candidate.skills.find((s) => s.name.toLowerCase() === vs.name.toLowerCase());
    const skillScoreVal = cs ? skillScore(cs.level, vs.level) : 0; // no skill = 0 for that segment
    segments.push({
      key: `skill:${vs.name}`,
      score: skillScoreVal,
      weight: vs.weight,
      meta: { name: vs.name, hasSkill: Boolean(cs) },
    });
  }

  const sumPoints = segments.reduce((acc, s) => acc + s.score * s.weight, 0);
  const sumWeights = segments.reduce((acc, s) => acc + s.weight, 0);

  if (sumWeights <= 0) {
    return {
      eligible: true,
      matchPercent: 100,
      gates: gate.reasons,
      scores: {},
      aggregation: { sumPoints: 0, sumWeights: 0, raw: 100, rounded: 100 },
    };
  }

  const raw = (sumPoints / sumWeights) * 100;
  const rounded = Math.round(raw);
  const matchPercent = Number.isFinite(rounded) ? Math.min(100, Math.max(0, rounded)) : 0;

  const experienceSegment = segments.find((s) => s.key === "experience");
  const educationSegment = segments.find((s) => s.key === "education");
  const skillSegments = segments.filter((s) => s.key.startsWith("skill:"));

  return {
    eligible: true,
    matchPercent,
    gates: gate.reasons,
    scores: {
      experience: experienceSegment && { score: experienceSegment.score, weight: experienceSegment.weight },
      education: educationSegment && { score: educationSegment.score, weight: educationSegment.weight },
      skills: skillSegments.map((s) => ({
        name: s.meta?.name ?? "",
        score: s.score,
        weight: s.weight,
        candidateHasSkill: Boolean(s.meta?.hasSkill),
      })),
    },
    aggregation: {
      sumPoints,
      sumWeights,
      raw,
      rounded: matchPercent,
    },
  };
}

/** Backwards-compatible helper: returns only the matchPercent (0–100). */
export function calculateMatch(candidate: CandidateProfile, vacancy: VacancyProfile): number {
  return calculateMatchResult(candidate, vacancy).matchPercent;
}

/** Viewer visibility rule (employer threshold 60%). */
export function shouldShowToViewer(result: MatchResult, viewerType: ViewerType): boolean {
  if (!result.eligible) return false;
  if (viewerType === "employer") {
    return result.matchPercent >= 60;
  }
  if (viewerType === "candidate") return true;
  if (viewerType === "admin") return true;
  return false;
}
