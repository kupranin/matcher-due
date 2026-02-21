/**
 * Mock data for match calculation and swipe decks.
 * Used for MVP — replace with API data later.
 */

import type { CandidateProfile, VacancyProfile } from "./matchCalculation";
import { passesPreCalcFilter, calculateMatch } from "./matchCalculation";
import { HARDCODED_VACANCIES } from "./hardcodedVacancies";
import type { VacancyCard } from "./hardcodedVacancies";

// ——— Current user (logged-in candidate) ———
export const MOCK_CANDIDATE_PROFILE: CandidateProfile = {
  locationCityId: "tbilisi",
  salaryMin: 1000,
  willingToRelocate: true,
  experienceMonths: 12,
  educationLevel: "High School",
  workTypes: ["Full-time", "Part-time"],
  skills: [
    { name: "Customer service", level: "Intermediate" },
    { name: "Coffee preparation", level: "Intermediate" },
    { name: "Cash handling", level: "Advanced" },
    { name: "Communication", level: "Intermediate" },
  ],
};

// ——— Current vacancy (employer's posted job) ———
export const MOCK_VACANCY_PROFILE: VacancyProfile = {
  locationCityId: "tbilisi",
  isRemote: false,
  salaryMax: 1500,
  requiredExperienceMonths: 6,
  requiredEducationLevel: "High School",
  workType: "Full-time",
  skills: [
    { name: "Customer service", level: "Intermediate", weight: 5 },
    { name: "Coffee preparation", level: "Intermediate", weight: 5 },
    { name: "Cash handling", level: "Intermediate", weight: 3 },
    { name: "Cleanliness", level: "Beginner", weight: 2 },
    { name: "Teamwork", level: "Intermediate", weight: 2 },
  ],
};

// ——— Vacancies for candidate swipe deck ———
export type { VacancyCard } from "./hardcodedVacancies";

/** 200 hardcoded vacancies until DB is ready. See lib/hardcodedVacancies.ts */
export const MOCK_VACANCIES_FULL: VacancyCard[] = HARDCODED_VACANCIES;

// ——— Candidates for employer swipe deck ———
export interface CandidateCard {
  id: string;
  name: string;
  job: string;
  location: string;
  workType: string;
  skills: string;
  photo?: string;
  profile: CandidateProfile;
}

export const MOCK_CANDIDATES_FULL: CandidateCard[] = [
  {
    id: "1",
    name: "Nino K.",
    job: "Barista",
    location: "Tbilisi",
    workType: "Full-time",
    skills: "Customer service, Coffee prep, Cash handling",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
    profile: {
      locationCityId: "tbilisi",
      salaryMin: 1100,
      willingToRelocate: false,
      experienceMonths: 12,
      educationLevel: "High School",
      workTypes: ["Full-time"],
      skills: [
        { name: "Customer service", level: "Intermediate" },
        { name: "Coffee preparation", level: "Intermediate" },
        { name: "Cash handling", level: "Advanced" },
      ],
    },
  },
  {
    id: "2",
    name: "Giorgi M.",
    job: "Cashier",
    location: "Tbilisi",
    workType: "Part-time",
    skills: "POS, Attention to detail, Customer service",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    profile: {
      locationCityId: "tbilisi",
      salaryMin: 900,
      willingToRelocate: true,
      experienceMonths: 6,
      educationLevel: "High School",
      workTypes: ["Part-time", "Full-time"],
      skills: [
        { name: "Cash handling", level: "Intermediate" },
        { name: "Attention to detail", level: "Intermediate" },
        { name: "Customer service", level: "Intermediate" },
      ],
    },
  },
  {
    id: "3",
    name: "Mariam T.",
    job: "Receptionist",
    location: "Batumi",
    workType: "Full-time",
    skills: "MS Office, Communication, Organization",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
    profile: {
      locationCityId: "batumi",
      salaryMin: 1000,
      willingToRelocate: false,
      experienceMonths: 8,
      educationLevel: "Bachelor",
      workTypes: ["Full-time"],
      skills: [
        { name: "Communication", level: "Advanced" },
        { name: "Organization", level: "Intermediate" },
        { name: "MS Office", level: "Intermediate" },
      ],
    },
  },
  {
    id: "4",
    name: "Luka D.",
    job: "Sales Associate",
    location: "Tbilisi",
    workType: "Part-time",
    skills: "Upselling, Product knowledge, Communication",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
    profile: {
      locationCityId: "tbilisi",
      salaryMin: 850,
      willingToRelocate: true,
      experienceMonths: 3,
      educationLevel: "High School",
      workTypes: ["Part-time"],
      skills: [
        { name: "Communication", level: "Intermediate" },
        { name: "Upselling", level: "Intermediate" },
        { name: "Product knowledge", level: "Beginner" },
      ],
    },
  },
  {
    id: "5",
    name: "Ana S.",
    job: "Call Center Agent",
    location: "Tbilisi",
    workType: "Remote",
    skills: "Typing, Patience, Communication",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80",
    profile: {
      locationCityId: "tbilisi",
      salaryMin: 1200,
      willingToRelocate: true,
      experienceMonths: 18,
      educationLevel: "Bachelor",
      workTypes: ["Remote", "Full-time"],
      skills: [
        { name: "Communication", level: "Advanced" },
        { name: "Typing", level: "Intermediate" },
        { name: "Patience", level: "Intermediate" },
      ],
    },
  },
  {
    id: "6",
    name: "David G.",
    job: "Warehouse Worker",
    location: "Rustavi",
    workType: "Full-time",
    skills: "Physical stamina, Teamwork, Attention to detail",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80",
    profile: {
      locationCityId: "rustavi",
      salaryMin: 1000,
      willingToRelocate: false,
      experienceMonths: 24,
      educationLevel: "High School",
      workTypes: ["Full-time"],
      skills: [
        { name: "Physical stamina", level: "Advanced" },
        { name: "Teamwork", level: "Intermediate" },
        { name: "Attention to detail", level: "Intermediate" },
      ],
    },
  },
];

// ——— Compute match for candidate viewing vacancies ———
export function getVacanciesWithMatch(
  candidateProfile: CandidateProfile
): Array<VacancyCard & { match: number }> {
  return MOCK_VACANCIES_FULL.filter((v) =>
    passesPreCalcFilter(candidateProfile, v.profile)
  )
    .map((v) => ({
      ...v,
      match: calculateMatch(candidateProfile, v.profile),
    }))
    .sort((a, b) => b.match - a.match);
}

// ——— Employer's posted vacancies (MVP: mock; replace with API) ———
export interface EmployerVacancy {
  id: string;
  title: string;
  location: string;
  workType: string;
  salary: string;
  profile: VacancyProfile;
}

export const MOCK_EMPLOYER_VACANCIES: EmployerVacancy[] = [
  {
    id: "emp-1",
    title: "Barista",
    location: "Tbilisi",
    workType: "Full-time",
    salary: "1,200–1,500 GEL",
    profile: {
      locationCityId: "tbilisi",
      isRemote: false,
      salaryMax: 1500,
      requiredExperienceMonths: 6,
      requiredEducationLevel: "High School",
      workType: "Full-time",
      skills: [
        { name: "Customer service", level: "Intermediate", weight: 5 },
        { name: "Coffee preparation", level: "Intermediate", weight: 5 },
        { name: "Cash handling", level: "Intermediate", weight: 3 },
      ],
    },
  },
  {
    id: "emp-2",
    title: "Cashier",
    location: "Tbilisi",
    workType: "Part-time",
    salary: "900–1,100 GEL",
    profile: {
      locationCityId: "tbilisi",
      isRemote: false,
      salaryMax: 1100,
      requiredExperienceMonths: 0,
      requiredEducationLevel: "High School",
      workType: "Part-time",
      skills: [
        { name: "Cash handling", level: "Intermediate", weight: 5 },
        { name: "Attention to detail", level: "Intermediate", weight: 4 },
        { name: "Customer service", level: "Beginner", weight: 3 },
      ],
    },
  },
];

// ——— Employer subscription (MVP: mock — wire to API later) ———
export interface EmployerSubscription {
  packageLabel: string;
  pricePaid: number;
  validUntil: string; // ISO date
  vacanciesUsed: number;
  vacanciesTotal: number; // -1 for unlimited
}

export const MOCK_EMPLOYER_SUBSCRIPTION: EmployerSubscription | null = {
  packageLabel: "5 vacancies",
  pricePaid: 170,
  validUntil: "2026-02-13",
  vacanciesUsed: 2,
  vacanciesTotal: 5,
};

// ——— Compute match for employer viewing candidates ———
export function getCandidatesWithMatch(
  vacancyProfile: VacancyProfile
): Array<CandidateCard & { match: number }> {
  return MOCK_CANDIDATES_FULL.filter((c) =>
    passesPreCalcFilter(c.profile, vacancyProfile)
  )
    .map((c) => ({
      ...c,
      match: calculateMatch(c.profile, vacancyProfile),
    }))
    .sort((a, b) => b.match - a.match);
}
