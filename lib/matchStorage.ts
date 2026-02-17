/**
 * Client-side storage for likes and mutual matches (MVP — replace with API later).
 * Maps candidate vacancy ids to employer vacancy ids for mutual match detection.
 */

export const CANDIDATE_VACANCY_TO_EMPLOYER: Record<string, string> = {
  "1": "emp-1", // Coffee Lab Barista
  "2": "emp-2", // Carrefour Cashier
};

export const EMPLOYER_VACANCY_TO_CANDIDATE: Record<string, string> = Object.fromEntries(
  Object.entries(CANDIDATE_VACANCY_TO_EMPLOYER).map(([k, v]) => [v, k])
);

export const EMPLOYER_VACANCY_INFO: Record<string, { title: string; company: string }> = {
  "emp-1": { title: "Barista", company: "Coffee Lab" },
  "emp-2": { title: "Cashier", company: "Carrefour" },
};

/** Current logged-in candidate id (mock — Nino K.) */
export const CURRENT_CANDIDATE_ID = "1";

const KEY_CANDIDATE_LIKES = "matcher_candidate_likes";
const KEY_EMPLOYER_LIKES = "matcher_employer_likes";
const KEY_MUTUAL_MATCHES = "matcher_mutual_matches";

export type EmployerLike = { vacancyId: string; candidateId: string };

export function getCandidateLikes(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const s = localStorage.getItem(KEY_CANDIDATE_LIKES);
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

export function addCandidateLike(vacancyId: string): void {
  const likes = getCandidateLikes();
  if (!likes.includes(vacancyId)) {
    likes.push(vacancyId);
    localStorage.setItem(KEY_CANDIDATE_LIKES, JSON.stringify(likes));
  }
}

export function getEmployerLikes(): EmployerLike[] {
  if (typeof window === "undefined") return [];
  try {
    const s = localStorage.getItem(KEY_EMPLOYER_LIKES);
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

export function addEmployerLike(vacancyId: string, candidateId: string): void {
  const likes = getEmployerLikes();
  const exists = likes.some((l) => l.vacancyId === vacancyId && l.candidateId === candidateId);
  if (!exists) {
    likes.push({ vacancyId, candidateId });
    localStorage.setItem(KEY_EMPLOYER_LIKES, JSON.stringify(likes));
  }
}

export type MutualMatch = {
  id: string;
  vacancyId: string;
  candidateId: string;
  candidateName: string;
  vacancyTitle: string;
  company: string;
  createdAt: number;
};

export function checkMutualMatch(
  candidateLikedVacancyId: string,
  employerLikedVacancyId: string,
  candidateId: string
): boolean {
  const empVacancyId = CANDIDATE_VACANCY_TO_EMPLOYER[candidateLikedVacancyId];
  return empVacancyId === employerLikedVacancyId && candidateId === CURRENT_CANDIDATE_ID;
}

export function getMutualMatches(): MutualMatch[] {
  if (typeof window === "undefined") return [];
  try {
    const s = localStorage.getItem(KEY_MUTUAL_MATCHES);
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

export function checkAndRecordMutualMatch(
  candidateLikedVacancyId: string,
  employerLikedVacancyId: string,
  candidateId: string,
  candidateName: string,
  vacancyTitle: string,
  company: string
): MutualMatch | null {
  const empVacancyId = CANDIDATE_VACANCY_TO_EMPLOYER[candidateLikedVacancyId];
  if (empVacancyId !== employerLikedVacancyId || candidateId !== CURRENT_CANDIDATE_ID) return null;
  const existing = getMutualMatches();
  if (existing.some((m) => m.vacancyId === empVacancyId && m.candidateId === candidateId)) return null;
  return addMutualMatch({
    vacancyId: empVacancyId,
    candidateId,
    candidateName,
    vacancyTitle,
    company,
  });
}

export function addMutualMatch(match: Omit<MutualMatch, "id" | "createdAt">): MutualMatch {
  const matches = getMutualMatches();
  const id = `match-${match.vacancyId}-${match.candidateId}-${Date.now()}`;
  const full: MutualMatch = { ...match, id, createdAt: Date.now() };
  const exists = matches.some(
    (m) => m.vacancyId === match.vacancyId && m.candidateId === match.candidateId
  );
  if (!exists) {
    matches.push(full);
    localStorage.setItem(KEY_MUTUAL_MATCHES, JSON.stringify(matches));
  }
  return full;
}
