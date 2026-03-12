import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/** GET /api/candidates — list candidate profiles (for employer swipe deck). No auth required; returns all profiles. */
export async function GET() {
  try {
    // See note in /api/employer/candidates: production DB is missing the
    // `date_of_birth` column on CandidateProfile, so we avoid the Prisma
    // model here and instead query via SQL plus a separate skills lookup.
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
      ORDER BY "created_at" DESC`;

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

    const payload = rawCandidates.map((c) => ({
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
      age: null,
      skills: skillsByCandidate.get(c.id) ?? [],
    }));

    console.log("[GET /api/candidates] totalCandidates:", payload.length, payload[0] ? `sample id=${payload[0].id}` : "no candidates");

    return NextResponse.json(payload);
  } catch (e) {
    console.error("Candidates list error:", e);
    return NextResponse.json({ error: "Failed to list candidates" }, { status: 500 });
  }
}
