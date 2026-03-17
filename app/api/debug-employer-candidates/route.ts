import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiVacancyToProfile, buildCandidateCardsWithMatch } from "@/lib/vacancyApi";

type DebugResponse = {
  authUserId: string | null;
  companyId: string | null;
  requestedVacancyId: string | null;
  selectedVacancyFound: boolean;
  selectedVacancy: {
    id: string;
    title: string;
    city: string;
    companyId: string;
  } | null;
  totalRawCandidateProfiles: number;
  totalAfterAvailableFilter: number;
  totalAfterLocationFilter: number;
  totalAfterRoleFilter: number;
  totalAfterCardBuild: number;
  sampleRawCandidates: Array<{
    id: string;
    firstName: string | null;
    lastName: string | null;
    city: string;
    availableToWork: boolean | null;
    preferredRole: string | null;
    desiredPositions: string[] | null;
    minSalary: number;
  }>;
  sampleExcluded: Array<{
    id: string;
    reason: string;
  }>;
  sampleFinalCards: Array<{
    candidateProfileId: string;
    candidateName: string;
    city: string;
    preferredRole: string | null;
    score: number;
  }>;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const vacancyId = searchParams.get("vacancyId")?.trim() || null;

    let authUserId: string | null = null;
    let companyId: string | null = null;
    let selectedVacancy:
      | {
          id: string;
          title: string;
          city: string;
          companyId: string;
          isRemote: boolean;
          salaryMax: number;
          salaryMin: number | null;
          requiredExperienceMonths: number;
          requiredEducationLevel: string;
          workType: string;
          locationCityId: string;
        }
      | null = null;

    if (vacancyId) {
      const vacancy = await prisma.vacancy.findUnique({
        where: { id: vacancyId },
        include: {
          company: {
            include: {
              user: true,
            },
          },
        },
      });

      if (vacancy) {
        authUserId = vacancy.company.user.authUserId ?? null;
        companyId = vacancy.companyId;
        selectedVacancy = {
          id: vacancy.id,
          title: vacancy.title,
          city: vacancy.locationCityId,
          companyId: vacancy.companyId,
          isRemote: vacancy.isRemote,
          salaryMax: vacancy.salaryMax,
          salaryMin: vacancy.salaryMin ?? null,
          requiredExperienceMonths: vacancy.requiredExperienceMonths,
          requiredEducationLevel: vacancy.requiredEducationLevel,
          workType: vacancy.workType,
          locationCityId: vacancy.locationCityId,
        };
      }
    }

    // IMPORTANT: Production DB is missing the `date_of_birth` column on
    // CandidateProfile. To keep this debug endpoint working across environments
    // we query the table via SQL and join skills separately, instead of using
    // the Prisma model (which would expect the missing column).
    const rawProfilesSql = await prisma.$queryRaw<
      Array<{
        id: string;
        full_name: string;
        job_title: string | null;
        location_city_id: string;
        salary_min: number;
        work_types: string[] | null;
        experience_months: number;
        education_level: string;
        willing_to_relocate: boolean;
        available_to_work: boolean | null;
        photo: string | null;
      }>
    >`SELECT "id",
        "full_name",
        "job_title",
        "location_city_id",
        "salary_min",
        "work_types",
        "experience_months",
        "education_level",
        "willing_to_relocate",
        "available_to_work",
        "photo"
      FROM "CandidateProfile"
      ORDER BY "created_at" DESC`;

    const candidateIds = rawProfilesSql.map((c) => c.id);
    const rawSkills =
      candidateIds.length > 0
        ? await prisma.candidateSkill.findMany({
            where: { candidateProfileId: { in: candidateIds } },
          })
        : [];

    const skillsByCandidate = new Map<
      string,
      Array<{ name: string; level: string }>
    >();
    for (const s of rawSkills) {
      const list =
        skillsByCandidate.get(s.candidateProfileId) ??
        ([] as Array<{ name: string; level: string }>);
      list.push({ name: s.name, level: s.level });
      skillsByCandidate.set(s.candidateProfileId, list);
    }

    const rawProfiles = rawProfilesSql.map((c) => ({
      id: c.id,
      fullName: c.full_name,
      jobTitle: c.job_title,
      locationCityId: c.location_city_id,
      salaryMin: c.salary_min,
      workTypes: c.work_types ?? [],
      experienceMonths: c.experience_months,
      educationLevel: c.education_level,
      willingToRelocate: c.willing_to_relocate,
      availableToWork: c.available_to_work,
      photo: c.photo?.trim() || null,
      skills: skillsByCandidate.get(c.id) ?? [],
    }));

    const totalRawCandidateProfiles = rawProfiles.length;

    // 1) availableToWork filter (very relaxed: only drop explicit false)
    const afterAvailable = rawProfiles.filter(
      (c) => c.availableToWork !== false
    );
    const totalAfterAvailableFilter = afterAvailable.length;

    // 2) location filter (relaxed: allow same-city, willingToRelocate, or remote vacancy)
    let afterLocation = afterAvailable;
    if (selectedVacancy) {
      afterLocation = afterAvailable.filter((c) => {
        if (!selectedVacancy) return true;
        if (selectedVacancy.isRemote) return true;
        if (c.locationCityId === selectedVacancy.city) return true;
        if (c.willingToRelocate) return true;
        return false;
      });
    }
    const totalAfterLocationFilter = afterLocation.length;

    // 3) role/title filter (very relaxed; mostly diagnostics)
    const vacancyTitle = selectedVacancy?.title ?? "";
    const normalize = (s: string | null | undefined) =>
      (s || "").trim().toLowerCase();

    const afterRole = afterLocation.filter((c) => {
      if (!vacancyTitle) return true;
      const preferred = normalize(c.jobTitle);
      if (!preferred) return true;
      const vNorm = normalize(vacancyTitle);
      // allow partial overlaps in either direction
      return vNorm.includes(preferred) || preferred.includes(vNorm);
    });
    const totalAfterRoleFilter = afterRole.length;

    // 4) Build candidate cards with match score using the real card-builder
    let totalAfterCardBuild = 0;
    let sampleFinalCards: DebugResponse["sampleFinalCards"] = [];

    if (selectedVacancy) {
      const vacancyProfile = apiVacancyToProfile({
        locationCityId: selectedVacancy.locationCityId,
        salaryMax: selectedVacancy.salaryMax,
        salaryMin: selectedVacancy.salaryMin,
        workType: selectedVacancy.workType,
        isRemote: selectedVacancy.isRemote,
        requiredExperienceMonths: selectedVacancy.requiredExperienceMonths,
        requiredEducationLevel: selectedVacancy.requiredEducationLevel,
        skills: await prisma.vacancySkill
          .findMany({
            where: { vacancyId: selectedVacancy.id },
          })
          .then((skills) =>
            skills.map((s) => ({
              name: s.name,
              level: s.level,
              weight: s.weight,
            }))
          ),
      });

      const apiCandidates = afterRole.map((c) => ({
        id: c.id,
        fullName: c.fullName,
        jobTitle: c.jobTitle,
        locationCityId: c.locationCityId,
        salaryMin: c.salaryMin,
        workTypes: c.workTypes,
        experienceMonths: c.experienceMonths,
        educationLevel: c.educationLevel,
        willingToRelocate: c.willingToRelocate,
        availableToWork: c.availableToWork ?? undefined,
        photo: c.photo,
        age: null,
        skills: c.skills,
      }));

      const cards = buildCandidateCardsWithMatch(apiCandidates, vacancyProfile, selectedVacancy.title);

      totalAfterCardBuild = cards.length;
      sampleFinalCards = cards.slice(0, 20).map((card) => {
        const api = apiCandidates.find((c) => c.id === card.id);
        return {
          candidateProfileId: card.id,
          candidateName: card.name,
          city: card.location,
          preferredRole: api?.jobTitle ?? null,
          score: card.match,
        };
      });
    }

    // Sample raw candidates (pre-filters)
    const sampleRawCandidates: DebugResponse["sampleRawCandidates"] =
      rawProfiles.slice(0, 20).map((c) => ({
        id: c.id,
        firstName: c.fullName.split(" ")[0] ?? c.fullName,
        lastName: c.fullName.split(" ").slice(1).join(" ") || "",
        city: c.locationCityId,
        availableToWork: c.availableToWork,
        preferredRole: c.jobTitle,
        desiredPositions: [], // not modeled separately; keep for shape compatibility
        minSalary: c.salaryMin,
      }));

    // Sample excluded candidates with reasons (first stage that drops them)
    const afterAvailableIds = new Set(afterAvailable.map((c) => c.id));
    const afterLocationIds = new Set(afterLocation.map((c) => c.id));
    const afterRoleIds = new Set(afterRole.map((c) => c.id));

    const sampleExcluded: DebugResponse["sampleExcluded"] = [];
    for (const c of rawProfiles) {
      if (sampleExcluded.length >= 20) break;
      if (!afterAvailableIds.has(c.id)) {
        sampleExcluded.push({
          id: c.id,
          reason: "availableToWork === false",
        });
        continue;
      }
      if (!afterLocationIds.has(c.id)) {
        sampleExcluded.push({
          id: c.id,
          reason: "location mismatch and not willingToRelocate",
        });
        continue;
      }
      if (!afterRoleIds.has(c.id)) {
        sampleExcluded.push({
          id: c.id,
          reason: "preferredRole/title mismatch",
        });
        continue;
      }
    }

    const response: DebugResponse = {
      authUserId,
      companyId,
      requestedVacancyId: vacancyId,
      selectedVacancyFound: Boolean(selectedVacancy),
      selectedVacancy: selectedVacancy
        ? {
            id: selectedVacancy.id,
            title: selectedVacancy.title,
            city: selectedVacancy.city,
            companyId: selectedVacancy.companyId,
          }
        : null,
      totalRawCandidateProfiles,
      totalAfterAvailableFilter,
      totalAfterLocationFilter,
      totalAfterRoleFilter,
      totalAfterCardBuild,
      sampleRawCandidates,
      sampleExcluded,
      sampleFinalCards,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[GET /api/debug-employer-candidates] error", error);
    return NextResponse.json(
      { error: "Failed to build debug employer candidates payload" },
      { status: 500 }
    );
  }
}
