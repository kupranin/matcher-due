import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;

function parseExperienceMonths(text: string): number {
  const t = text.trim().toLowerCase();
  const yearMatch = t.match(/(\d+)\s*(year|yr)/);
  const monthMatch = t.match(/(\d+)\s*(month|mo)/);
  if (yearMatch) return parseInt(yearMatch[1], 10) * 12;
  if (monthMatch) return parseInt(monthMatch[1], 10);
  if (/^\d+$/.test(t)) return parseInt(t, 10);
  return 0;
}

/** GET /api/candidates/profile?userId= — load profile by user id (for cabinet). */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
      include: { skills: true, user: { select: { email: true } } },
    });
    if (!profile) return NextResponse.json(null);
    return NextResponse.json({
      profileId: profile.id,
      userId: profile.userId,
      fullName: profile.fullName,
      phone: profile.phone,
      email: profile.user.email,
      locationCityId: profile.locationCityId,
      locationDistrictId: profile.locationDistrictId,
      salaryMin: profile.salaryMin,
      willingToRelocate: profile.willingToRelocate,
      experienceMonths: profile.experienceMonths,
      experienceText: profile.experienceText,
      educationLevel: profile.educationLevel,
      workTypes: profile.workTypes,
      jobTitle: profile.jobTitle,
      availableToWork: profile.availableToWork,
      skills: profile.skills.map((s) => ({ name: s.name, level: s.level })),
    });
  } catch (e) {
    console.error("Candidate profile get error:", e);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

/** PATCH /api/candidates/profile — update profile (body: userId + profile fields). */
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const userId = typeof body?.userId === "string" ? body.userId.trim() : "";
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
    const existing = await prisma.candidateProfile.findUnique({ where: { userId } });
    if (!existing) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    const fullName = typeof body?.fullName === "string" ? body.fullName.trim() : undefined;
    const phone = typeof body?.phone === "string" ? body.phone.trim() : undefined;
    const locationCityId = typeof body?.locationCityId === "string" ? body.locationCityId.trim() : undefined;
    const locationDistrictId = typeof body?.locationDistrictId === "string" ? body.locationDistrictId.trim() || null : undefined;
    const salaryMin = body?.salaryMin != null ? Math.max(0, parseInt(String(body.salaryMin), 10) || 800) : undefined;
    const experienceText = typeof body?.experienceText === "string" ? body.experienceText.trim() || null : undefined;
    const experienceMonths = body?.experienceMonths != null ? Math.max(0, parseInt(String(body.experienceMonths), 10) || 0) : undefined;
    const educationLevel = typeof body?.educationLevel === "string" ? body.educationLevel : undefined;
    const workTypes = Array.isArray(body?.workTypes) ? (body.workTypes as string[]).filter((w: unknown) => typeof w === "string").slice(0, 10) : undefined;
    const willingToRelocate = body?.willingToRelocate === true || body?.willingToRelocate === false ? body.willingToRelocate : undefined;
    const jobTitle = typeof body?.jobTitle === "string" ? body.jobTitle.trim() || null : undefined;
    const availableToWork = body?.availableToWork === true || body?.availableToWork === false ? body.availableToWork : undefined;
    const skills = Array.isArray(body?.skills)
      ? (body.skills as Array<{ name?: string; level?: string }>)
          .filter((s) => s && typeof s?.name === "string" && (s.name as string).trim().length > 0)
          .slice(0, 20)
          .map((s) => ({
            name: (s.name as string).trim(),
            level: SKILL_LEVELS.includes((s.level as (typeof SKILL_LEVELS)[number]) ?? "Intermediate") ? (s.level as (typeof SKILL_LEVELS)[number]) : "Intermediate",
          }))
      : undefined;
    const update: Record<string, unknown> = {};
    if (fullName !== undefined) update.fullName = fullName;
    if (phone !== undefined) update.phone = phone;
    if (locationCityId !== undefined) update.locationCityId = locationCityId;
    if (locationDistrictId !== undefined) update.locationDistrictId = locationDistrictId;
    if (salaryMin !== undefined) update.salaryMin = salaryMin;
    if (experienceText !== undefined) update.experienceText = experienceText;
    if (experienceMonths !== undefined) update.experienceMonths = experienceMonths;
    if (educationLevel !== undefined) update.educationLevel = educationLevel;
    if (workTypes !== undefined) update.workTypes = workTypes.length ? workTypes : ["Full-time"];
    if (willingToRelocate !== undefined) update.willingToRelocate = willingToRelocate;
    if (jobTitle !== undefined) update.jobTitle = jobTitle;
    if (availableToWork !== undefined) update.availableToWork = availableToWork;
    await prisma.candidateProfile.update({ where: { userId }, data: update as never });
    if (skills !== undefined) {
      await prisma.candidateSkill.deleteMany({ where: { candidateProfileId: existing.id } });
      if (skills.length > 0) {
        await prisma.candidateSkill.createMany({
          data: skills.map((s) => ({ candidateProfileId: existing.id, name: s.name, level: s.level })),
          skipDuplicates: true,
        });
      }
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Candidate profile patch error:", e);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";
    const fullName = typeof body?.fullName === "string" ? body.fullName.trim() : "";
    const phone = typeof body?.phone === "string" ? body.phone.trim() : null;
    const locationCityId = typeof body?.locationCityId === "string" ? body.locationCityId.trim() : "";
    const locationDistrictId = typeof body?.locationDistrictId === "string" ? body.locationDistrictId.trim() || null : null;
    const salaryMin = typeof body?.salaryMin === "number" ? body.salaryMin : parseInt(String(body?.salaryMin ?? "0"), 10) || 800;
    const experienceText = typeof body?.experienceText === "string" ? body.experienceText.trim() || null : null;
    const experienceMonths =
      typeof body?.experienceMonths === "number"
        ? body.experienceMonths
        : experienceText
          ? parseExperienceMonths(experienceText)
          : 0;
    const educationLevel =
      typeof body?.educationLevel === "string" && ["None", "High School", "Bachelor", "Master", "PhD"].includes(body.educationLevel)
        ? body.educationLevel
        : "High School";
    const workTypes = Array.isArray(body?.workTypes)
      ? (body.workTypes as string[]).filter((w: unknown) => typeof w === "string").slice(0, 10)
      : ["Full-time"];
    const willingToRelocate = body?.willingToRelocate === true || body?.willingToRelocate === false ? body.willingToRelocate : false;
    const jobTitle = typeof body?.jobTitle === "string" ? body.jobTitle.trim() || null : null;
    const skills = Array.isArray(body?.skills)
      ? (body.skills as Array<{ name?: string; level?: string }>)
          .filter((s) => s && typeof s?.name === "string" && (s.name = s.name.trim()).length > 0)
          .slice(0, 20)
          .map((s) => ({
            name: s.name!,
            level: SKILL_LEVELS.includes((s.level as (typeof SKILL_LEVELS)[number]) ?? "Intermediate")
              ? (s.level as (typeof SKILL_LEVELS)[number])
              : "Intermediate",
          }))
      : [];

    if (!email || email.length < 3) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    if (!fullName || fullName.length < 2) {
      return NextResponse.json({ error: "Full name required" }, { status: 400 });
    }
    if (!locationCityId) {
      return NextResponse.json({ error: "Location (city) required" }, { status: 400 });
    }
    const salaryMinSafe = Math.max(0, Math.min(1_000_000, salaryMin)) || 800;

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      if (!password || password.length < 8) {
        return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
      }
      user = await prisma.user.create({
        data: {
          email,
          passwordHash: hashPassword(password),
          role: "CANDIDATE",
        },
      });
    }

    const profileData = {
      fullName,
      phone,
      locationCityId,
      locationDistrictId,
      salaryMin: salaryMinSafe,
      willingToRelocate,
      experienceMonths,
      experienceText,
      educationLevel,
      workTypes: workTypes.length ? workTypes : ["Full-time"],
      jobTitle,
    };

    const profile = await prisma.candidateProfile.upsert({
      where: { userId: user.id },
      update: profileData,
      create: {
        userId: user.id,
        ...profileData,
      },
    });

    await prisma.candidateSkill.deleteMany({ where: { candidateProfileId: profile.id } });
    if (skills.length > 0) {
      await prisma.candidateSkill.createMany({
        data: skills.map((s) => ({
          candidateProfileId: profile.id,
          name: s.name,
          level: s.level,
        })),
        skipDuplicates: true,
      });
    }

    return NextResponse.json({ userId: user.id, profileId: profile.id });
  } catch (e) {
    console.error("Candidate profile save error:", e);
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }
}
