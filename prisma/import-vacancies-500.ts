/**
 * Import vacancies from Generated_500_Vacancy_rows.csv.
 * - Matches company by contact_email (Company must exist).
 * - Assigns a relevant stock photo per vacancy title (from lib/vacancyStockPhotos).
 * - Links skills from JobRoleTemplate (en) when title matches a template; otherwise uses fallback skills.
 *
 * Usage: npx tsx prisma/import-vacancies-500.ts /path/to/Generated_500_Vacancy_rows.csv
 */

import * as path from "path";
import { config } from "dotenv";
config({ path: path.join(__dirname, "..", ".env") });

import { parse } from "csv-parse/sync";
import * as fs from "fs";
import { PrismaClient } from "@prisma/client";
import { getStockPhotosForJob } from "../lib/vacancyStockPhotos";

function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s*\/\s*.*$/, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

const FALLBACK_SKILLS = [
  { name: "Customer service", level: "Intermediate", weight: 4 },
  { name: "Communication", level: "Intermediate", weight: 3 },
  { name: "Teamwork", level: "Intermediate", weight: 3 },
];

function parseCsv(filePath: string): Record<string, string>[] {
  const raw = fs.readFileSync(filePath, "utf-8");
  return parse(raw, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
    trim: true,
  }) as Record<string, string>[];
}

function toWorkType(s: string): string {
  const v = (s || "").toLowerCase();
  if (v.includes("part") || v === "part_time") return "Part-time";
  if (v.includes("remote") || v === "remote") return "Remote";
  return "Full-time";
}

function toBool(s: string): boolean {
  const v = (s || "").toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}

async function main() {
  const csvPath = process.argv[2];
  if (!csvPath || !fs.existsSync(csvPath)) {
    console.error("Usage: npx tsx prisma/import-vacancies-500.ts /path/to/Generated_500_Vacancy_rows.csv");
    process.exit(1);
  }

  const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("Set DIRECT_URL or DATABASE_URL in .env");
    process.exit(1);
  }

  const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });
  const rows = parseCsv(csvPath);
  if (rows.length === 0) {
    console.error("CSV is empty.");
    process.exit(1);
  }

  // Load all EN job role templates with skills for matching
  const templates = await prisma.jobRoleTemplate.findMany({
    where: { locale: "en" },
    include: { skills: true },
  });

  function getSkillsForTitle(title: string): { name: string; level: string; weight: number }[] {
    const slug = titleToSlug(title);
    const titleLower = title.toLowerCase();
    const template = templates.find(
      (t) =>
        t.slug === slug ||
        titleToSlug(t.title) === slug ||
        titleLower.includes(t.title.toLowerCase()) ||
        t.title.toLowerCase().includes(titleLower)
    );
    if (template?.skills?.length) {
      return template.skills.map((s) => ({
        name: s.skillName,
        level: "Intermediate" as const,
        weight: s.weight,
      }));
    }
    return FALLBACK_SKILLS;
  }

  console.log("Importing", rows.length, "vacancies (with photos and skills)...");
  let created = 0;
  let skipped = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const contactEmail = (row.contact_email || "").trim().toLowerCase();
    if (!contactEmail) {
      skipped++;
      continue;
    }

    const company = await prisma.company.findFirst({ where: { contactEmail } });
    if (!company) {
      if (skipped < 5) console.warn("No company for contact_email:", contactEmail);
      skipped++;
      continue;
    }

    const title = (row.title || "Vacancy").trim().slice(0, 255);
    const salaryMin = row.salary_min != null && row.salary_min !== "" ? parseInt(row.salary_min, 10) : null;
    const salaryMax = row.salary_max != null && row.salary_max !== "" ? parseInt(row.salary_max, 10) : 0;
    const locationCityId = (row.location_city_id || "").trim() || "tbilisi";
    const photos = getStockPhotosForJob(title);
    const photo = photos[0] ?? null;

    const vacancy = await prisma.vacancy.create({
      data: {
        companyId: company.id,
        title,
        locationCityId: locationCityId.slice(0, 64),
        locationDistrictId: (row.location_district_id || "").trim().slice(0, 64) || null,
        salaryMin: salaryMin ?? null,
        salaryMax: isNaN(salaryMax) ? 0 : Math.max(0, salaryMax),
        workType: toWorkType(row.work_type || "Full-time"),
        isRemote: toBool(row.is_remote),
        requiredExperienceMonths: parseInt(row.required_experience_months || "0", 10) || 0,
        requiredEducationLevel: (row.required_education_level || "High School").trim().slice(0, 64),
        description: (row.description || "").trim().slice(0, 20000) || null,
        photo,
        status: "PUBLISHED",
        contactName: (row.contact_name || "").trim().slice(0, 255) || null,
        contactEmail: contactEmail.slice(0, 255) || null,
        contactPhone: (row.contact_phone || "").trim().slice(0, 64) || null,
      },
    });

    const skills = getSkillsForTitle(title);
    await prisma.vacancySkill.createMany({
      data: skills.map((s) => ({
        vacancyId: vacancy.id,
        name: s.name,
        level: s.level,
        weight: s.weight,
        isRequired: true,
      })),
      skipDuplicates: true,
    });

    created++;
    if ((i + 1) % 50 === 0) console.log("  ", i + 1, "/", rows.length);
  }

  console.log("Done. Vacancies created:", created, "| skipped:", skipped);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
