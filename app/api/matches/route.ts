import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { computeMatchScore } from "@/lib/matchScore";

/** POST /api/matches — record a like (candidate or employer). Creates or updates Match. */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const vacancyId = typeof body?.vacancyId === "string" ? body.vacancyId.trim() : "";
    const candidateProfileId = typeof body?.candidateProfileId === "string" ? body.candidateProfileId.trim() : "";
    const candidateLiked = Boolean(body?.candidateLiked);
    const employerLiked = Boolean(body?.employerLiked);
    const candidatePitch = typeof body?.candidatePitch === "string" ? body.candidatePitch.trim() || null : null;

    if (!vacancyId || !candidateProfileId) {
      return NextResponse.json({ error: "vacancyId and candidateProfileId required" }, { status: 400 });
    }

    const [candidate, vacancy] = await Promise.all([
      prisma.candidateProfile.findUnique({
        where: { id: candidateProfileId },
        include: { skills: true },
      }),
      prisma.vacancy.findUnique({
        where: { id: vacancyId },
        include: { skills: true },
      }),
    ]);

    let matchScore: number | null = null;
    if (candidate && vacancy) {
      matchScore = computeMatchScore(
        {
          locationCityId: candidate.locationCityId,
          salaryMin: candidate.salaryMin,
          willingToRelocate: candidate.willingToRelocate,
          experienceMonths: candidate.experienceMonths,
          educationLevel: candidate.educationLevel,
          workTypes: candidate.workTypes,
          skills: candidate.skills.map((s) => ({ name: s.name, level: s.level })),
        },
        {
          locationCityId: vacancy.locationCityId,
          salaryMax: vacancy.salaryMax,
          isRemote: vacancy.isRemote,
          requiredExperienceMonths: vacancy.requiredExperienceMonths,
          requiredEducationLevel: vacancy.requiredEducationLevel,
          workType: vacancy.workType,
          skills: vacancy.skills.map((s) => ({ name: s.name, level: s.level, weight: s.weight })),
        }
      );
    }

    const match = await prisma.match.upsert({
      where: {
        vacancyId_candidateProfileId: { vacancyId, candidateProfileId },
      },
      update: {
        ...(employerLiked && { employerLiked: true }),
        ...(candidateLiked && { candidateLiked: true }),
        ...(candidatePitch != null && { candidatePitch }),
        ...(matchScore != null && { matchScore }),
      },
      create: {
        vacancyId,
        candidateProfileId,
        candidateLiked,
        employerLiked,
        candidatePitch,
        matchScore: matchScore ?? undefined,
      },
    });
    return NextResponse.json({
      id: match.id,
      candidateLiked: match.candidateLiked,
      employerLiked: match.employerLiked,
      createdAt: typeof match.createdAt?.toISOString === "function" ? match.createdAt.toISOString() : String(match.createdAt),
    });
  } catch (e) {
    console.error("Match upsert error:", e);
    return NextResponse.json({ error: "Failed to save like" }, { status: 500 });
  }
}

/** GET /api/matches?candidateProfileId= — matches for candidate. GET /api/matches?companyId= — matches for employer's company. */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const candidateProfileId = searchParams.get("candidateProfileId");
    const companyId = searchParams.get("companyId");

    if (candidateProfileId) {
      const list = await prisma.match.findMany({
        where: { candidateProfileId },
        include: {
          vacancy: { include: { company: { select: { name: true } } } },
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(
        list.map((m) => ({
          id: m.id,
          vacancyId: m.vacancyId,
          candidateProfileId: m.candidateProfileId,
          candidateLiked: m.candidateLiked,
          employerLiked: m.employerLiked,
          candidatePitch: m.candidatePitch,
          matchScore: m.matchScore ?? undefined,
          createdAt: m.createdAt.toISOString(),
          vacancyTitle: m.vacancy.title,
          company: m.vacancy.company.name,
        }))
      );
    }
    if (companyId) {
      const list = await prisma.match.findMany({
        where: { vacancy: { companyId } },
        include: {
          vacancy: { select: { title: true }, include: { company: { select: { name: true } } } },
          candidateProfile: { select: { id: true, fullName: true, jobTitle: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(
        list.map((m) => ({
          id: m.id,
          vacancyId: m.vacancyId,
          candidateProfileId: m.candidateProfileId,
          candidateLiked: m.candidateLiked,
          employerLiked: m.employerLiked,
          candidatePitch: m.candidatePitch,
          matchScore: m.matchScore ?? undefined,
          createdAt: m.createdAt.toISOString(),
          vacancyTitle: m.vacancy.title,
          company: m.vacancy.company.name,
          candidateName: m.candidateProfile.fullName,
          candidateJobTitle: m.candidateProfile.jobTitle,
        }))
      );
    }
    return NextResponse.json({ error: "candidateProfileId or companyId required" }, { status: 400 });
  } catch (e) {
    console.error("Matches list error:", e);
    return NextResponse.json({ error: "Failed to list matches" }, { status: 500 });
  }
}
