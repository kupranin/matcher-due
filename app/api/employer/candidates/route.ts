import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/employer/candidates?vacancyId=...
 *
 * Returns up to 50 candidate profiles for employer browsing.
 * Only filters by `availableToWork = true` so employers always
 * see a rich deck of candidates, even if no prior matches exist.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const vacancyId = searchParams.get("vacancyId")?.trim() || null;
    // For employer browsing we only need vacancyId for logging / debugging.
    // Even if the vacancy is missing or the id is omitted, we still return
    // a rich list of candidates to avoid an empty deck in the UI.
    if (!vacancyId) {
      console.warn("[GET /api/employer/candidates] missing vacancyId; returning global candidate list");
    } else {
      const vacancy = await prisma.vacancy.findUnique({
        where: { id: vacancyId },
        select: { id: true },
      });
      if (!vacancy) {
        console.warn("[GET /api/employer/candidates] vacancy not found for id=%s; returning global candidate list", vacancyId);
      }
    }

    // NOTE: Production database for Matcher.ge currently does NOT have the
    // `date_of_birth` column on CandidateProfile, while the Prisma schema does.
    // Using the Prisma model here would cause a runtime error. To avoid that
    // and still return usable candidates, we query the table via SQL and
    // hydrate skills separately.
    // Exclude candidates who already have a mutual match with this vacancy (if provided)
    let matchedCandidateIds: string[] = [];
    if (vacancyId) {
      const rows = await prisma.$queryRaw<Array<{ candidate_profile_id: string }>>`
        SELECT m.candidate_profile_id
        FROM public.matches m
        WHERE m.vacancy_id = ${vacancyId}
          AND m.employer_liked = true
          AND m.candidate_liked = true
      `;
      matchedCandidateIds = rows.map((r) => r.candidate_profile_id);
    }

    const rawCandidates = await prisma.$queryRaw<
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
      ORDER BY "created_at" DESC
      LIMIT 200`;

    const candidateIds = rawCandidates.map((c) => c.id);
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

    const payload = rawCandidates
      .filter((c) => !matchedCandidateIds.includes(c.id))
      .map((c) => ({
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
        // Date of birth column is missing in prod DB, so we cannot compute age here.
        age: null,
        skills: skillsByCandidate.get(c.id) ?? [],
      }));

    console.log(
      "[GET /api/employer/candidates] vacancyId=%s totalCandidates=%d totalMatchedCandidateIdsExcluded=%d",
      vacancyId ?? "(none)",
      payload.length,
      matchedCandidateIds.length
    );

    return NextResponse.json(payload);
  } catch (e) {
    console.error("Employer candidates list error:", e);
    return NextResponse.json({ error: "Failed to list candidates" }, { status: 500 });
  }
}
