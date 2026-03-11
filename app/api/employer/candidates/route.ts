import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateAge } from "@/lib/age";

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

    const candidates = await prisma.candidateProfile.findMany({
      where: { availableToWork: true },
      include: { skills: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const payload = candidates.map((c) => ({
      id: c.id,
      fullName: c.fullName,
      jobTitle: c.jobTitle,
      locationCityId: c.locationCityId,
      salaryMin: c.salaryMin,
      workTypes: c.workTypes,
      experienceMonths: c.experienceMonths,
      educationLevel: c.educationLevel,
      willingToRelocate: c.willingToRelocate,
      availableToWork: c.availableToWork,
      photo: c.photo?.trim() || null,
      age: calculateAge(c.dateOfBirth),
      skills: c.skills.map((s) => ({ name: s.name, level: s.level })),
    }));

    console.log(
      "[GET /api/employer/candidates] vacancyId=%s totalCandidates=%d",
      vacancyId ?? "(none)",
      payload.length
    );

    return NextResponse.json(payload);
  } catch (e) {
    console.error("Employer candidates list error:", e);
    return NextResponse.json({ error: "Failed to list candidates" }, { status: 500 });
  }
}
