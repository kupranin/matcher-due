import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getEmployerCompanyFromSession } from "@/lib/employerAuth";
import { getStockPhotosForJob } from "@/lib/vacancyStockPhotos";
import { deductSlotInTx, STRICT_PAYWALL_ERROR } from "@/lib/vacancyManager";

const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;
const WORK_TYPES = ["Full-time", "Part-time", "Temporary", "Remote"] as const;
const EDUCATION_LEVELS = ["None", "High School", "Bachelor", "Master", "PhD"] as const;

/**
 * GET /api/vacancies
 * - With employer session: returns only that company's vacancies (company matches vacancy).
 * - Without employer session (e.g. candidate, or credentials: omit): returns all PUBLISHED vacancies.
 */
export async function GET(request: Request) {
  try {
    const ctx = await getEmployerCompanyFromSession(request);
    const companyId = ctx?.companyId ?? null;

    const list = await prisma.vacancy.findMany({
      where: companyId ? { companyId } : { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      include: {
        company: { select: { name: true } },
        skills: true,
      },
    });
    return NextResponse.json(
      list.map((v) => ({
        id: v.id,
        title: v.title,
        company: v.company.name,
        locationCityId: v.locationCityId,
        locationDistrictId: v.locationDistrictId,
        salaryMin: v.salaryMin,
        salaryMax: v.salaryMax,
        workType: v.workType,
        isRemote: v.isRemote,
        requiredExperienceMonths: v.requiredExperienceMonths,
        requiredEducationLevel: v.requiredEducationLevel,
        description: v.description,
        photo: v.photo?.trim() || getStockPhotosForJob(v.title)[0] || null,
        contactName: v.contactName,
        contactEmail: v.contactEmail,
        contactPhone: v.contactPhone,
        skills: v.skills,
        createdAt: v.createdAt.toISOString(),
      }))
    );
  } catch (e) {
    console.error("Vacancies list error:", e);
    return NextResponse.json({ error: "Failed to load vacancies" }, { status: 500 });
  }
}

/**
 * POST /api/vacancies
 * Create vacancy for the current employer's company only. User → Company → Vacancy.
 * Requires employer session. Company must match vacancy (vacancy.companyId = session company).
 */
export async function POST(request: Request) {
  try {
    const ctx = await getEmployerCompanyFromSession(request);
    if (!ctx) {
      return NextResponse.json(
        { error: "Sign in as employer to post a vacancy" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const contactName = typeof body?.contactName === "string" ? body.contactName.trim() : "";
    const contactEmail = typeof body?.contactEmail === "string" ? body.contactEmail.trim().toLowerCase() : "";
    const contactPhone = typeof body?.contactPhone === "string" ? body.contactPhone.trim() : null;

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
    const DESCRIPTION_MAX = 200;
    const descriptionRaw = typeof body?.description === "string" ? body.description.trim() || null : null;
    const description = descriptionRaw ? descriptionRaw.slice(0, DESCRIPTION_MAX) : null;
    const photo = typeof body?.photo === "string" ? body.photo.trim() || null : null;

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

    const company = await prisma.company.findUnique({
      where: { id: ctx.companyId },
      select: { id: true, contactEmail: true, contactPhone: true },
    });
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const contactEmailForVacancy = company.contactEmail || contactEmail || "";
    const contactPhoneForVacancy = company.contactPhone ?? contactPhone;

    const vacancy = await prisma.$transaction(async (tx) => {
      await deductSlotInTx(tx, company.id);
      const v = await tx.vacancy.create({
        data: {
          companyId: company.id,
          title,
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
        await tx.vacancySkill.createMany({
          data: skills.map((s) => ({
            vacancyId: v.id,
            name: s.name,
            level: s.level,
            weight: s.weight,
            isRequired: s.isRequired,
          })),
          skipDuplicates: true,
        });
      }
      return v;
    });

    return NextResponse.json({
      vacancyId: vacancy.id,
      companyId: company.id,
      userId: ctx.userId,
    });
  } catch (e) {
    const err = e as Error;
    if (err.message === STRICT_PAYWALL_ERROR) {
      return NextResponse.json(
        { error: "No vacancy slots left. Choose a package to post.", code: STRICT_PAYWALL_ERROR },
        { status: 402 }
      );
    }
    console.error("Vacancy create error:", e);
    return NextResponse.json({ error: "Failed to create vacancy" }, { status: 500 });
  }
}
