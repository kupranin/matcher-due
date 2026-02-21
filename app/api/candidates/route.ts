import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/** GET /api/candidates — list candidate profiles (for employer swipe deck). */
export async function GET() {
  try {
    const list = await prisma.candidateProfile.findMany({
      include: { skills: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(
      list.map((c) => ({
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
        skills: c.skills.map((s) => ({ name: s.name, level: s.level })),
      }))
    );
  } catch (e) {
    console.error("Candidates list error:", e);
    return NextResponse.json({ error: "Failed to list candidates" }, { status: 500 });
  }
}
