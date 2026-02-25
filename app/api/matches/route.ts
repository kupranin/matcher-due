import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { SESSION_COOKIE_NAME } from "@/lib/session";
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

    await prisma.match.upsert({
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

    // Re-fetch so we return the exact DB state (both likes); fixes mutual match not showing when employer likes after candidate
    const match = await prisma.match.findUnique({
      where: { vacancyId_candidateProfileId: { vacancyId, candidateProfileId } },
    });
    if (!match) {
      return NextResponse.json({ error: "Failed to save like" }, { status: 500 });
    }
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

/** GET /api/matches — ?candidateProfileId= for candidate; ?companyId= or session for employer. */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const candidateProfileId = searchParams.get("candidateProfileId");
    let companyId = searchParams.get("companyId");

    // Resolve employer company from session when no companyId
    if (!companyId && !candidateProfileId) {
      const cookieStore = await cookies();
      const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
      if (token) {
        const session = await prisma.session.findUnique({
          where: { token },
          include: { user: { select: { id: true, role: true } } },
        });
        if (session && session.expiresAt >= new Date() && session.user.role === "EMPLOYER") {
          const company = await prisma.company.findUnique({
            where: { userId: session.user.id },
            select: { id: true },
          });
          if (company) companyId = company.id;
        }
      }
    }

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
          candidateLiked: Boolean(m.candidateLiked),
          employerLiked: Boolean(m.employerLiked),
          candidatePitch: m.candidatePitch,
          matchScore: m.matchScore ?? undefined,
          createdAt: m.createdAt.toISOString(),
          vacancyTitle: m.vacancy?.title ?? "",
          company: m.vacancy?.company?.name ?? "",
          candidateName: m.candidateProfile?.fullName ?? "Candidate",
          candidateJobTitle: m.candidateProfile?.jobTitle ?? null,
        }))
      );
    }
    // No companyId (e.g. session not sent or no company): return empty array so UI shows "No matches" instead of error
    return NextResponse.json([]);
  } catch (e) {
    console.error("Matches list error:", e);
    return NextResponse.json({ error: "Failed to list matches" }, { status: 500 });
  }
}
