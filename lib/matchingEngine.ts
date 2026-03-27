/**
 * Matcher.ge — Filter & Rank Vacancies for a Candidate
 *
 * 3-phase logic:
 *   Phase 1: Waterfall (hard gates) — profession, location/relocation, salary (80% rule).
 *   Phase 2: Weighted scoring (0–100) — skills, experience, education with employer priorities 1–5.
 *   Phase 3: Output — vacancy IDs sorted by compatibility_score DESC.
 *
 * DRY, dependency-free, suitable for Supabase Edge Function or backend utility.
 */

// —— Input types (task contract) ——

export interface MatchingCandidate {
  profession_id: string;
  city: string;
  is_willing_to_relocate: boolean;
  min_salary: number; // e.g. GEL/month
  skills: string[]; // skill names
  years_experience: number;
  education_level: string; // e.g. "High School" | "Bachelor" | "Master" | "PhD"
}

export interface MatchingVacancy {
  id: string;
  profession_id: string;
  city: string;
  is_remote: boolean;
  max_salary: number | null; // null → include with salaryUndisclosed flag
  required_skills: string[];
  min_years_experience: number;
  min_education_level: string;
  /** Employer priority 1–5 for skills segment */
  skills_priority?: number;
  /** Employer priority 1–5 for experience segment */
  experience_priority?: number;
  /** Employer priority 1–5 for education segment */
  education_priority?: number;
}

// —— Output ——

export interface RankedVacancyResult {
  vacancyId: string;
  compatibility_score: number; // 0–100
  salaryUndisclosed?: boolean;
}

// —— Constants ——

const SALARY_FLOOR_RATIO = 0.8; // vacancy.max_salary >= 0.8 * candidate.min_salary
const PRIORITY_MIN = 1;
const PRIORITY_MAX = 5;
const DEFAULT_PRIORITY = 3;

// —— Phase 1: Hard gates ——

function gateProfession(candidate: MatchingCandidate, vacancy: MatchingVacancy): boolean {
  return candidate.profession_id === vacancy.profession_id;
}

function gateLocationRelocation(candidate: MatchingCandidate, vacancy: MatchingVacancy): boolean {
  if (candidate.is_willing_to_relocate) return true;
  if (vacancy.is_remote) return true;
  return candidate.city === vacancy.city;
}

function gateSalary(
  candidate: MatchingCandidate,
  vacancy: MatchingVacancy
): { pass: boolean; salaryUndisclosed: boolean } {
  if (vacancy.max_salary == null) {
    return { pass: true, salaryUndisclosed: true };
  }
  const floor = candidate.min_salary * SALARY_FLOOR_RATIO;
  return {
    pass: vacancy.max_salary >= floor,
    salaryUndisclosed: false,
  };
}

function passesPhase1(
  candidate: MatchingCandidate,
  vacancy: MatchingVacancy
): { pass: boolean; salaryUndisclosed: boolean } {
  if (!gateProfession(candidate, vacancy)) return { pass: false, salaryUndisclosed: false };
  if (!gateLocationRelocation(candidate, vacancy)) return { pass: false, salaryUndisclosed: false };
  const salary = gateSalary(candidate, vacancy);
  if (!salary.pass) return { pass: false, salaryUndisclosed: false };
  return { pass: true, salaryUndisclosed: salary.salaryUndisclosed };
}

// —— Phase 2: Weighted scoring ——

/** Normalize priority 1–5 to weight (1–5 then scale so W1+W2+W3 = 1) */
function normalizeWeights(
  w1: number,
  w2: number,
  w3: number
): [number, number, number] {
  const clamp = (n: number) => Math.min(PRIORITY_MAX, Math.max(PRIORITY_MIN, Number(n) || DEFAULT_PRIORITY));
  const a = clamp(w1);
  const b = clamp(w2);
  const c = clamp(w3);
  const sum = a + b + c;
  if (sum <= 0) return [1 / 3, 1 / 3, 1 / 3];
  return [a / sum, b / sum, c / sum];
}

/** Skill score 0–1: share of required_skills present in candidate.skills (case-insensitive). */
function skillScore(candidate: MatchingCandidate, vacancy: MatchingVacancy): number {
  const required = vacancy.required_skills;
  if (required.length === 0) return 1;
  const haveSet = new Set(candidate.skills.map((s) => s.trim().toLowerCase()));
  const matched = required.filter((r) => haveSet.has(r.trim().toLowerCase())).length;
  return matched / required.length;
}

/** Experience score 0–1: min(1, candidate_years / vacancy_min_years). */
function experienceScore(candidate: MatchingCandidate, vacancy: MatchingVacancy): number {
  const minYears = vacancy.min_years_experience;
  if (minYears <= 0) return 1;
  const years = Math.max(0, candidate.years_experience);
  return years >= minYears ? 1 : years / minYears;
}

/** Education level order (higher = more). */
const EDUCATION_ORDER: Record<string, number> = {
  none: 0,
  "high school": 1,
  bachelor: 2,
  master: 3,
  phd: 4,
};

function educationOrder(level: string): number {
  const key = (level || "").trim().toLowerCase();
  return EDUCATION_ORDER[key] ?? 1;
}

/** Education score 0–1: 1 if candidate meets or exceeds required; else partial (e.g. 0.5). */
function educationScore(candidate: MatchingCandidate, vacancy: MatchingVacancy): number {
  const candidateOrder = educationOrder(candidate.education_level);
  const requiredOrder = educationOrder(vacancy.min_education_level);
  if (candidateOrder >= requiredOrder) return 1;
  return 0.5; // below = penalty
}

/** Compute 0–100 score from weighted segments. */
function phase2Score(candidate: MatchingCandidate, vacancy: MatchingVacancy): number {
  const [wSkill, wExp, wEdu] = normalizeWeights(
    vacancy.skills_priority ?? DEFAULT_PRIORITY,
    vacancy.experience_priority ?? DEFAULT_PRIORITY,
    vacancy.education_priority ?? DEFAULT_PRIORITY
  );
  const skill = skillScore(candidate, vacancy);
  const exp = experienceScore(candidate, vacancy);
  const edu = educationScore(candidate, vacancy);
  const raw = skill * wSkill + exp * wExp + edu * wEdu;
  const out = Math.round(raw * 100);
  return Math.min(100, Math.max(0, out));
}

// —— Phase 3: Filter, score, sort ——

/**
 * Filter and rank vacancies for a candidate.
 * Returns a JSON-serializable array of vacancy IDs with compatibility_score DESC.
 * When vacancy.max_salary is null, the vacancy is still included and salaryUndisclosed is set.
 */
export function filterAndRankVacancies(
  candidate: MatchingCandidate,
  vacancies: MatchingVacancy[]
): RankedVacancyResult[] {
  const results: RankedVacancyResult[] = [];

  for (const vacancy of vacancies) {
    const phase1 = passesPhase1(candidate, vacancy);
    if (!phase1.pass) continue;

    const compatibility_score = phase2Score(candidate, vacancy);
    results.push({
      vacancyId: vacancy.id,
      compatibility_score,
      ...(phase1.salaryUndisclosed ? { salaryUndisclosed: true } : {}),
    });
  }

  results.sort((a, b) => b.compatibility_score - a.compatibility_score);
  return results;
}

/**
 * Returns only vacancy IDs in rank order (e.g. for minimal API response).
 */
export function filterAndRankVacancyIds(
  candidate: MatchingCandidate,
  vacancies: MatchingVacancy[]
): string[] {
  return filterAndRankVacancies(candidate, vacancies).map((r) => r.vacancyId);
}

// —— Usage (Supabase Edge / backend) ——
//
// import { filterAndRankVacancies } from "@/lib/matchingEngine";
// const ranked = filterAndRankVacancies(candidate, vacancies);
// return new Response(JSON.stringify(ranked), { headers: { "Content-Type": "application/json" } });
//
// When you have profession_id in DB, map from Prisma: candidate → profession_id, city (locationCityId), is_willing_to_relocate, min_salary (salaryMin), skills[], years_experience (experienceMonths/12), education_level; vacancy → id, profession_id, city, is_remote, max_salary, required_skills[], min_years_experience (requiredExperienceMonths/12), min_education_level, skills_priority/experience_priority/education_priority (1–5).
