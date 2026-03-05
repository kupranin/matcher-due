/**
 * GET /api/vacancies/for-candidate?userId=...
 * Returns vacancies eligible for the candidate (hard gates only, no 60% threshold).
 * Does NOT depend on Match table. Logs diagnostic when candidate opens Opportunities.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getStockPhotosForJob } from "@/lib/vacancyStockPhotos";
import { listVacanciesForCandidate, type VacancyForCandidateInput } from "@/lib/vacancyApi";
import type { CandidateProfile } from "@/lib/matchCalculation";
import { normalizeEducationLevel } from "@/lib/matchCalculation";

type SkillLevel = "Beginner" | "Intermediate" | "Advanced";

function toSkillLevel(s: string): SkillLevel {
  if (s === "Beginner" || s === "Intermediate" || s === "Advanced") return s;
  return "Intermediate";
}

function buildCandidateProfileFromDb(p: {
  locationCityId: string;
  salaryMin: number;
  willingToRelocate: boolean;
  experienceMonths: number;
  educationLevel: string;
  workTypes: string[];
  skills: Array<{ name: string; level: string }>;
  availableToWork: boolean;
  jobTitle: string | null;
}): CandidateProfile {
  return {
    locationCityId: p.locationCityId,
    salaryMin: p.salaryMin,
    willingToRelocate: p.willingToRelocate,
    experienceMonths: p.experienceMonths,
    educationLevel: normalizeEducationLevel(p.educationLevel),
    workTypes: p.workTypes?.length ? p.workTypes : ["Full-time"],
    skills: p.skills.map((s) => ({ name: s.name, level: toSkillLevel(s.level) })),
    availableToWork: p.availableToWork,
    primaryPosition: p.jobTitle ?? null,
    desiredPositions: null,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
      include: { skills: true },
    });
    if (!profile) {
      return NextResponse.json({ candidateMeta: null, vacancies: [], error: "Candidate profile not found" }, { status: 200 });
    }

    const firstName = profile.fullName?.trim().split(/\s+/)[0] ?? null;
    const candidateMeta = {
      photoUrl: profile.photo?.trim() || null,
      firstName,
    };

    const vacancies = await prisma.vacancy.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      include: {
        company: { select: { name: true } },
        skills: true,
      },
    });

    const apiVacancies: VacancyForCandidateInput = vacancies.map((v) => ({
      id: v.id,
      title: v.title,
      company: v.company.name,
      locationCityId: v.locationCityId,
      salaryMin: v.salaryMin,
      salaryMax: v.salaryMax,
      workType: v.workType,
      isRemote: v.isRemote,
      requiredExperienceMonths: v.requiredExperienceMonths,
      requiredEducationLevel: v.requiredEducationLevel,
      skills: v.skills.map((s) => ({ name: s.name, level: s.level, weight: s.weight })),
      photo: v.photo ?? getStockPhotosForJob(v.title)[0] ?? null,
    }));

    const candidateProfile = buildCandidateProfileFromDb({
      locationCityId: profile.locationCityId,
      salaryMin: profile.salaryMin,
      willingToRelocate: profile.willingToRelocate,
      experienceMonths: profile.experienceMonths,
      educationLevel: profile.educationLevel,
      workTypes: profile.workTypes,
      skills: profile.skills.map((s) => ({ name: s.name, level: s.level })),
      availableToWork: profile.availableToWork,
      jobTitle: profile.jobTitle,
    });

    const { cards, diagnostic } = listVacanciesForCandidate(
      apiVacancies,
      candidateProfile,
      profile.jobTitle ?? undefined,
      { includeDiagnostic: true, diagnosticCandidateId: profile.id }
    );

    if (diagnostic) {
      console.info("[Candidate Opportunities]", JSON.stringify(diagnostic));
    }

    return NextResponse.json({ candidateMeta, vacancies: cards });
  } catch (e) {
    console.error("Vacancies for-candidate error:", e);
    return NextResponse.json({ candidateMeta: null, error: "Failed to load opportunities", vacancies: [] }, { status: 500 });
  }
}
