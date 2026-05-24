import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { getStockPhotosForJob } from "@/lib/vacancyStockPhotos";
import { normalizeContentLocale, resolveJobRoleSlug } from "@/lib/jobRoleSlug";
import { translateVacancyForLocale } from "@/lib/vacancyTranslation";

const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;

/** GET /api/vacancies — list published vacancies. ?companyId= for employer's. ?candidateProfileId= to exclude already liked/matched for candidate opportunities. ?locale=en|ka translates display fields. */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");
    const candidateProfileId = searchParams.get("candidateProfileId")?.trim() || null;
    const displayLocale = normalizeContentLocale(searchParams.get("locale"));

    let excludeVacancyIds: string[] = [];
    if (candidateProfileId) {
      const [likedOrMatched, discarded] = await Promise.all([
        prisma.match.findMany({
          where: { candidateProfileId, candidateLiked: true },
          select: { vacancyId: true },
        }),
        prisma.discard.findMany({
          where: { candidateProfileId },
          select: { vacancyId: true },
        }),
      ]);
      excludeVacancyIds = [
        ...likedOrMatched.map((m) => m.vacancyId),
        ...discarded.map((d) => d.vacancyId),
      ];
    }

    const list = await prisma.vacancy.findMany({
      where: companyId
        ? { companyId, status: "PUBLISHED" }
        : excludeVacancyIds.length > 0
          ? { status: "PUBLISHED", id: { notIn: excludeVacancyIds } }
          : { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      include: {
        company: { select: { name: true } },
        skills: true,
      },
    });
    const payload = await Promise.all(
      list.map(async (v) => {
        const skills = v.skills.map((s) => ({
          name: s.name,
          level: s.level,
          weight: s.weight,
          isRequired: s.isRequired,
        }));
        const jobRoleSlug = v.jobRoleSlug ?? resolveJobRoleSlug(v.title);
        const translated = await translateVacancyForLocale(
          {
            title: v.title,
            description: v.description,
            jobRoleSlug,
            sourceLocale: v.sourceLocale,
            skills,
          },
          displayLocale
        );

        return {
          id: v.id,
          title: translated.title,
          originalTitle: v.title,
          jobRoleSlug: translated.jobRoleSlug ?? jobRoleSlug,
          sourceLocale: translated.sourceLocale ?? v.sourceLocale,
          translated: translated.translated,
          company: v.company.name,
          locationCityId: v.locationCityId,
          locationDistrictId: v.locationDistrictId,
          salaryMin: v.salaryMin,
          salaryMax: v.salaryMax,
          workType: v.workType,
          isRemote: v.isRemote,
          requiredExperienceMonths: v.requiredExperienceMonths,
          requiredEducationLevel: v.requiredEducationLevel,
          description: translated.description,
          photo: v.photo?.trim() || getStockPhotosForJob(v.title)[0] || null,
          contactName: v.contactName,
          contactEmail: v.contactEmail,
          contactPhone: v.contactPhone,
          skills: translated.skills,
          createdAt: v.createdAt.toISOString(),
        };
      })
    );
    return NextResponse.json(payload);
  } catch (e) {
    console.error("Vacancies list error:", e);
    return NextResponse.json({ error: "Failed to list vacancies" }, { status: 500 });
  }
}

const WORK_TYPES = ["Full-time", "Part-time", "Temporary", "Remote"] as const;
const EDUCATION_LEVELS = ["None", "High School", "Bachelor", "Master", "PhD"] as const;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const contactName = typeof body?.contactName === "string" ? body.contactName.trim() : "";
    const contactEmail = typeof body?.contactEmail === "string" ? body.contactEmail.trim().toLowerCase() : "";
    const contactPhone = typeof body?.contactPhone === "string" ? body.contactPhone.trim() : null;
    const companyName = typeof body?.companyName === "string" ? body.companyName.trim() || null : null;
    const userIdFromBody = typeof body?.userId === "string" ? body.userId : null;

    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const locationCityId = typeof body?.locationCityId === "string" ? body.locationCityId.trim() : "";
    const locationDistrictId = typeof body?.locationDistrictId === "string" ? body.locationDistrictId.trim() || null : null;
    const salaryMin = body?.salaryMin != null ? Math.max(0, parseInt(String(body.salaryMin), 10) || 0) : null;
    const salaryMax = Math.max(0, parseInt(String(body?.salaryMax ?? "0"), 10) || 1200);
    const workTypeRaw = typeof body?.workType === "string" ? body.workType.trim() : "Full-time";
    const workType = WORK_TYPES.includes(workTypeRaw as (typeof WORK_TYPES)[number]) ? workTypeRaw : "Full-time";
    const isRemote = Boolean(body?.isRemote);
    const requiredExperienceMonths = Math.max(0, parseInt(String(body?.requiredExperienceMonths ?? "0"), 10) || 0);
    const requiredEducationLevel = EDUCATION_LEVELS.includes((body?.requiredEducationLevel as (typeof EDUCATION_LEVELS)[number]) ?? "High School")
      ? (body.requiredEducationLevel as (typeof EDUCATION_LEVELS)[number])
      : "High School";
    const description = typeof body?.description === "string" ? body.description.trim() || null : null;
    const photo = typeof body?.photo === "string" ? body.photo.trim() || null : null;
    const jobRoleSlugRaw =
      typeof body?.jobRoleSlug === "string" ? body.jobRoleSlug.trim() || null : null;
    const sourceLocaleRaw =
      typeof body?.sourceLocale === "string" ? body.sourceLocale.trim() : null;
    const sourceLocale = sourceLocaleRaw === "ka" ? "ka" : sourceLocaleRaw === "en" ? "en" : null;
    const jobRoleSlug = jobRoleSlugRaw ?? resolveJobRoleSlug(title);

    const skills = Array.isArray(body?.skills)
      ? (body.skills as Array<{ name?: string; level?: string; weight?: number; isRequired?: boolean }>)
          .filter((s) => s && typeof s?.name === "string" && (s.name = (s.name as string).trim()).length > 0)
          .slice(0, 30)
          .map((s) => ({
            name: s.name!,
            level: SKILL_LEVELS.includes((s.level as (typeof SKILL_LEVELS)[number]) ?? "Intermediate")
              ? (s.level as (typeof SKILL_LEVELS)[number])
              : "Intermediate",
            weight: typeof s.weight === "number" && s.weight >= 1 && s.weight <= 5 ? s.weight : 3,
            isRequired: Boolean(s.isRequired),
          }))
      : [];

    if (!title || title.length < 2) {
      return NextResponse.json({ error: "Job title required" }, { status: 400 });
    }
    if (!locationCityId) {
      return NextResponse.json({ error: "Location (city) required" }, { status: 400 });
    }

    const companyIdFromBody = typeof body?.companyId === "string" ? body.companyId.trim() : null;
    let company: { id: string; contactEmail: string; contactPhone: string | null } | null = null;
    let user: { id: string } | null = null;

    if (companyIdFromBody) {
      const existing = await prisma.company.findUnique({
        where: { id: companyIdFromBody },
        select: { id: true, userId: true, contactEmail: true, contactPhone: true },
      });
      if (existing) {
        company = existing;
        user = { id: existing.userId };
      }
    }

    if (!company && userIdFromBody) {
      const byUser = await prisma.company.findUnique({
        where: { userId: userIdFromBody },
        select: { id: true, userId: true, contactEmail: true, contactPhone: true },
      });
      if (byUser) {
        company = byUser;
        user = { id: byUser.userId };
      }
    }

    if (!company) {
      const cookieStore = await cookies();
      const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
      if (token) {
        const session = await prisma.session.findUnique({
          where: { token },
          include: { user: { select: { id: true, role: true, email: true } } },
        });
        if (session?.user?.role === "EMPLOYER" && session.expiresAt >= new Date()) {
          user = { id: session.user.id };
          let byUser = await prisma.company.findUnique({
            where: { userId: session.user.id },
            select: { id: true, userId: true, contactEmail: true, contactPhone: true },
          });
          if (!byUser) {
            byUser = await prisma.company.create({
              data: {
                userId: session.user.id,
                name: companyName || title || "My Company",
                companyId: "N/A",
                contactEmail: session.user.email ?? "employer@matcher.ge",
                contactPhone: "",
              },
              select: { id: true, userId: true, contactEmail: true, contactPhone: true },
            });
          }
          company = byUser;
        }
      }
    }

    if (!company) {
      if (!contactEmail || contactEmail.length < 3) {
        return NextResponse.json(
          { error: "Please log in again to post a vacancy, or provide a contact email." },
          { status: 401 }
        );
      }
      if (userIdFromBody) {
        user = await prisma.user.findUnique({ where: { id: userIdFromBody }, select: { id: true } });
      }
      if (!user) {
        const existing = await prisma.user.findUnique({ where: { email: contactEmail } });
        if (existing) {
          user = { id: existing.id };
        } else {
          const randomPassword = Math.random().toString(36).slice(2) + Date.now();
          const newUser = await prisma.user.create({
            data: {
              email: contactEmail,
              passwordHash: hashPassword(randomPassword),
              role: "EMPLOYER",
            },
          });
          user = { id: newUser.id };
        }
      }
      company = await prisma.company.findUnique({ where: { userId: user.id } });
      if (!company) {
        company = await prisma.company.create({
          data: {
            userId: user.id,
            name: companyName || title || "My Company",
            companyId: "N/A",
            contactEmail: contactEmail,
            contactPhone: contactPhone || "",
          },
        });
      }
    }

    const contactEmailForVacancy = company.contactEmail || contactEmail || "";
    const contactPhoneForVacancy = company.contactPhone ?? contactPhone;

    const vacancy = await prisma.vacancy.create({
      data: {
        companyId: company.id,
        title,
        jobRoleSlug: jobRoleSlug ?? undefined,
        sourceLocale: sourceLocale ?? undefined,
        locationCityId,
        locationDistrictId,
        salaryMin: salaryMin ?? undefined,
        salaryMax,
        workType,
        isRemote,
        requiredExperienceMonths,
        requiredEducationLevel,
        description,
        status: "PUBLISHED",
        contactName: contactName || null,
        contactEmail: contactEmailForVacancy,
        contactPhone: contactPhoneForVacancy,
        photo: photo ?? undefined,
      },
    });

    if (skills.length > 0) {
      await prisma.vacancySkill.createMany({
        data: skills.map((s) => ({
          vacancyId: vacancy.id,
          name: s.name,
          level: s.level,
          weight: s.weight,
          isRequired: s.isRequired,
        })),
        skipDuplicates: true,
      });
    }

    return NextResponse.json({
      vacancyId: vacancy.id,
      companyId: company.id,
      ...(user && { userId: user.id }),
    });
  } catch (e) {
    console.error("Vacancy create error:", e);
    return NextResponse.json({ error: "Failed to create vacancy" }, { status: 500 });
  }
}
