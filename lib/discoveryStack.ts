/**
 * getDiscoveryStack — ranked list of potential matches in two tiers:
 * 1. Incoming Interest (employer already liked candidate, or candidate already liked vacancy)
 * 2. Discovery (all other potential matches)
 *
 * Applies: profession match, location/relocation, 80% salary rule, weighted scoring.
 * Excludes: mutual matches (and optionally any existing Match row for "dislike" semantics).
 * Supports: limit/offset pagination, sort_by = 'priority' | 'match_only'.
 */

import { prisma } from "@/lib/db";
import { candidateToProfile, vacancyToProfile, computeMatchScore } from "@/lib/matchScore";
import { passesPreCalcFilter } from "@/lib/matchCalculation";
import { candidateJobMatchesVacancy } from "@/lib/vacancyApi";

export type GetDiscoveryStackParams =
  | {
      role: "candidate";
      candidateProfileId: string;
    }
  | {
      role: "employer";
      vacancyId: string;
    };

export type GetDiscoveryStackOptions = {
  limit?: number;
  offset?: number;
  /** 'priority' = Incoming Interest first then by match_percentage; 'match_only' = pure match % */
  sort_by?: "priority" | "match_only";
};

/** One item in the discovery stack (candidate view: vacancy; employer view: candidate). */
export type DiscoveryStackItem = {
  tier: "incoming" | "discovery";
  match_percentage: number;
  vacancyId?: string;
  candidateProfileId?: string;
  payload?: Record<string, unknown>;
};

export type GetDiscoveryStackResult = {
  items: DiscoveryStackItem[];
  total: number;
};

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function professionMatch(candidateJobTitle: string | null | undefined, vacancyTitle: string): boolean {
  if (!vacancyTitle?.trim()) return false;
  return candidateJobMatchesVacancy(candidateJobTitle, vacancyTitle);
}

function scorePair(
  candidate: {
    jobTitle: string | null;
    locationCityId: string;
    salaryMin: number;
    willingToRelocate: boolean;
    experienceMonths: number;
    educationLevel: string;
    workTypes: string[];
    skills: Array<{ name: string; level: string }>;
  },
  vacancy: {
    title: string;
    locationCityId: string;
    salaryMax: number;
    isRemote: boolean;
    requiredExperienceMonths: number;
    requiredEducationLevel: string;
    workType: string;
    skills: Array<{ name: string; level: string; weight: number }>;
  }
): { pass: boolean; match_percentage: number } {
  if (!professionMatch(candidate.jobTitle, vacancy.title)) return { pass: false, match_percentage: 0 };
  const cProfile = candidateToProfile({
    locationCityId: candidate.locationCityId,
    salaryMin: candidate.salaryMin,
    willingToRelocate: candidate.willingToRelocate,
    experienceMonths: candidate.experienceMonths,
    educationLevel: candidate.educationLevel,
    workTypes: candidate.workTypes,
    skills: candidate.skills,
  });
  const vProfile = vacancyToProfile({
    locationCityId: vacancy.locationCityId,
    salaryMax: vacancy.salaryMax,
    isRemote: vacancy.isRemote,
    requiredExperienceMonths: vacancy.requiredExperienceMonths,
    requiredEducationLevel: vacancy.requiredEducationLevel,
    workType: vacancy.workType,
    skills: vacancy.skills,
  });
  if (!passesPreCalcFilter(cProfile, vProfile)) return { pass: false, match_percentage: 0 };
  const match_percentage = computeMatchScore(candidate, vacancy);
  return { pass: true, match_percentage };
}

async function getStackForCandidate(
  candidateProfileId: string,
  options: GetDiscoveryStackOptions
): Promise<GetDiscoveryStackResult> {
  const limit = Math.min(MAX_LIMIT, Math.max(1, options.limit ?? DEFAULT_LIMIT));
  const offset = Math.max(0, options.offset ?? 0);
  const sortBy = options.sort_by === "match_only" ? "match_only" : "priority";

  const [candidate, allVacancies, matchesForCandidate] = await Promise.all([
    prisma.candidateProfile.findUnique({
      where: { id: candidateProfileId },
      include: { skills: true },
    }),
    prisma.vacancy.findMany({
      where: { status: "PUBLISHED" },
      include: { company: { select: { name: true } }, skills: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.match.findMany({
      where: { candidateProfileId },
      select: { vacancyId: true, employerLiked: true, candidateLiked: true },
    }),
  ]);

  if (!candidate) return { items: [], total: 0 };

  const candidateData = {
    jobTitle: candidate.jobTitle,
    locationCityId: candidate.locationCityId,
    salaryMin: candidate.salaryMin,
    willingToRelocate: candidate.willingToRelocate,
    experienceMonths: candidate.experienceMonths,
    educationLevel: candidate.educationLevel,
    workTypes: candidate.workTypes,
    skills: candidate.skills.map((s) => ({ name: s.name, level: s.level })),
  };

  const matchByVacancy = new Map(
    matchesForCandidate.map((m) => [m.vacancyId, { employerLiked: m.employerLiked, candidateLiked: m.candidateLiked }])
  );

  const mutualPairIds = new Set(
    matchesForCandidate.filter((m) => m.employerLiked && m.candidateLiked).map((m) => m.vacancyId)
  );

  const incoming: DiscoveryStackItem[] = [];
  const discovery: DiscoveryStackItem[] = [];

  for (const v of allVacancies) {
    if (mutualPairIds.has(v.id)) continue;
    const m = matchByVacancy.get(v.id);
    if (m?.candidateLiked) continue; // Candidate already liked or passed; exclude from stack
    const { pass, match_percentage } = scorePair(candidateData, v);
    if (!pass) continue;

    const isIncoming = m?.employerLiked === true && !m?.candidateLiked;

    const item: DiscoveryStackItem = {
      tier: isIncoming ? "incoming" : "discovery",
      match_percentage,
      vacancyId: v.id,
      payload: {
        title: v.title,
        company: v.company?.name,
        locationCityId: v.locationCityId,
        salaryMax: v.salaryMax,
        workType: v.workType,
      },
    };
    if (isIncoming) incoming.push(item);
    else discovery.push(item);
  }

  incoming.sort((a, b) => b.match_percentage - a.match_percentage);
  discovery.sort((a, b) => b.match_percentage - a.match_percentage);

  const combined =
    sortBy === "priority" ? [...incoming, ...discovery] : [...incoming, ...discovery].sort((a, b) => b.match_percentage - a.match_percentage);

  const total = combined.length;
  const items = combined.slice(offset, offset + limit);

  return { items, total };
}

async function getStackForEmployer(
  vacancyId: string,
  options: GetDiscoveryStackOptions
): Promise<GetDiscoveryStackResult> {
  const limit = Math.min(MAX_LIMIT, Math.max(1, options.limit ?? DEFAULT_LIMIT));
  const offset = Math.max(0, options.offset ?? 0);
  const sortBy = options.sort_by === "match_only" ? "match_only" : "priority";

  const [vacancy, allCandidates, matchesForVacancy] = await Promise.all([
    prisma.vacancy.findUnique({
      where: { id: vacancyId },
      include: { company: { select: { name: true } }, skills: true },
    }),
    prisma.candidateProfile.findMany({
      where: { availableToWork: true },
      include: { skills: true },
    }),
    prisma.match.findMany({
      where: { vacancyId },
      select: { candidateProfileId: true, employerLiked: true, candidateLiked: true },
    }),
  ]);

  if (!vacancy) return { items: [], total: 0 };

  const vacancyData = {
    title: vacancy.title,
    locationCityId: vacancy.locationCityId,
    salaryMax: vacancy.salaryMax,
    isRemote: vacancy.isRemote,
    requiredExperienceMonths: vacancy.requiredExperienceMonths,
    requiredEducationLevel: vacancy.requiredEducationLevel,
    workType: vacancy.workType,
    skills: vacancy.skills.map((s) => ({ name: s.name, level: s.level, weight: s.weight })),
  };

  const matchByCandidate = new Map(
    matchesForVacancy.map((m) => [m.candidateProfileId, { employerLiked: m.employerLiked, candidateLiked: m.candidateLiked }])
  );

  const mutualPairIds = new Set(
    matchesForVacancy.filter((m) => m.employerLiked && m.candidateLiked).map((m) => m.candidateProfileId)
  );

  const incoming: DiscoveryStackItem[] = [];
  const discovery: DiscoveryStackItem[] = [];

  for (const c of allCandidates) {
    if (mutualPairIds.has(c.id)) continue;
    const m = matchByCandidate.get(c.id);
    if (m?.employerLiked) continue; // Employer already liked or passed; exclude from stack
    const { pass, match_percentage } = scorePair(
      {
        jobTitle: c.jobTitle,
        locationCityId: c.locationCityId,
        salaryMin: c.salaryMin,
        willingToRelocate: c.willingToRelocate,
        experienceMonths: c.experienceMonths,
        educationLevel: c.educationLevel,
        workTypes: c.workTypes,
        skills: c.skills.map((s) => ({ name: s.name, level: s.level })),
      },
      vacancyData
    );
    if (!pass) continue;

    const isIncoming = m?.candidateLiked === true && !m?.employerLiked;

    const item: DiscoveryStackItem = {
      tier: isIncoming ? "incoming" : "discovery",
      match_percentage,
      candidateProfileId: c.id,
      payload: {
        fullName: c.fullName,
        jobTitle: c.jobTitle,
        locationCityId: c.locationCityId,
        salaryMin: c.salaryMin,
        workTypes: c.workTypes,
      },
    };
    if (isIncoming) incoming.push(item);
    else discovery.push(item);
  }

  incoming.sort((a, b) => b.match_percentage - a.match_percentage);
  discovery.sort((a, b) => b.match_percentage - a.match_percentage);

  const combined =
    sortBy === "priority" ? [...incoming, ...discovery] : [...incoming, ...discovery].sort((a, b) => b.match_percentage - a.match_percentage);

  const total = combined.length;
  const items = combined.slice(offset, offset + limit);

  return { items, total };
}

/**
 * Retrieves the discovery stack (potential matches) for a candidate or employer.
 * Excludes mutual matches. Applies profession, location, 80% salary, weighted scoring.
 */
export async function getDiscoveryStack(
  params: GetDiscoveryStackParams,
  options: GetDiscoveryStackOptions = {}
): Promise<GetDiscoveryStackResult> {
  if (params.role === "candidate") {
    return getStackForCandidate(params.candidateProfileId, options);
  }
  return getStackForEmployer(params.vacancyId, options);
}
