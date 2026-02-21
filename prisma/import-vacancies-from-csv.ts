/**
 * Import companies and vacancies from Supabase CSV exports.
 *
 * Usage:
 *   npx tsx prisma/import-vacancies-from-csv.ts <company_csv_path> <vacancy_csv_path>
 *   npx tsx prisma/import-vacancies-from-csv.ts --check <company_csv_path> <vacancy_csv_path>
 *
 * --check  Only validate format and report; do not write to DB.
 *
 * Company CSV expected columns: id, user_id, name, company_id, contact_email, contact_phone,
 *   created_at, updated_at, address, bio, employee_count, industry, linkedin, website
 * Note: The export uses "name" for job-title-like labels; we import as company display name.
 *
 * Vacancy CSV expected columns: id, company_id, title, location_city_id, location_district_id,
 *   salary_min, salary_max, work_type, is_remote, required_experience_months, required_education_level,
 *   description, photo, status, contact_name, contact_email, contact_phone, created_at, updated_at
 */

import { parse } from "csv-parse/sync";
import * as fs from "fs";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth";

const COMPANY_COLS = [
  "id",
  "user_id",
  "name",
  "company_id",
  "contact_email",
  "contact_phone",
  "created_at",
  "updated_at",
  "address",
  "bio",
  "employee_count",
  "industry",
  "linkedin",
  "website",
];

const VACANCY_COLS = [
  "id",
  "company_id",
  "title",
  "location_city_id",
  "location_district_id",
  "salary_min",
  "salary_max",
  "work_type",
  "is_remote",
  "required_experience_months",
  "required_education_level",
  "description",
  "photo",
  "status",
  "contact_name",
  "contact_email",
  "contact_phone",
  "created_at",
  "updated_at",
];

const WORK_TYPE_MAP: Record<string, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  temporary: "Temporary",
  remote: "Remote",
};

const DEFAULT_PASSWORD = "Import1ChangeMe!";

function parseCsv(filePath: string, columns: string[]): Record<string, string>[] {
  const raw = fs.readFileSync(filePath, "utf-8");
  const rows = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
    relax_quotes: true,
    trim: true,
  }) as Record<string, string>[];
  return rows;
}

function validateCompanyCsv(rows: Record<string, string>[]): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  const first = rows[0];
  if (!first) {
    errors.push("Company CSV is empty.");
    return { ok: false, errors };
  }
  for (const col of COMPANY_COLS) {
    if (!(col in first)) errors.push(`Company CSV: missing column "${col}".`);
  }
  for (let i = 0; i < Math.min(5, rows.length); i++) {
    const r = rows[i];
    if (!r.id?.trim()) errors.push(`Company CSV row ${i + 2}: empty id.`);
    if (!r.name?.trim()) errors.push(`Company CSV row ${i + 2}: empty name.`);
    if (!r.contact_email?.trim()) errors.push(`Company CSV row ${i + 2}: empty contact_email.`);
  }
  return { ok: errors.length === 0, errors };
}

function validateVacancyCsv(rows: Record<string, string>[]): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  const first = rows[0];
  if (!first) {
    errors.push("Vacancy CSV is empty.");
    return { ok: false, errors };
  }
  for (const col of VACANCY_COLS) {
    if (!(col in first)) errors.push(`Vacancy CSV: missing column "${col}".`);
  }
  for (let i = 0; i < Math.min(5, rows.length); i++) {
    const r = rows[i];
    if (!r.id?.trim()) errors.push(`Vacancy CSV row ${i + 2}: empty id.`);
    if (!r.company_id?.trim()) errors.push(`Vacancy CSV row ${i + 2}: empty company_id.`);
    if (!r.title?.trim()) errors.push(`Vacancy CSV row ${i + 2}: empty title.`);
    const min = r.salary_min != null && r.salary_min !== "" ? parseInt(r.salary_min, 10) : NaN;
    const max = r.salary_max != null && r.salary_max !== "" ? parseInt(r.salary_max, 10) : NaN;
    if (isNaN(min) || min < 0) errors.push(`Vacancy CSV row ${i + 2}: invalid salary_min.`);
    if (isNaN(max) || max < 0) errors.push(`Vacancy CSV row ${i + 2}: invalid salary_max.`);
  }
  return { ok: errors.length === 0, errors };
}

function checkCompanyIdRefs(
  companyRows: Record<string, string>[],
  vacancyRows: Record<string, string>[]
): { ok: boolean; missing: string[] } {
  const companyIds = new Set(companyRows.map((r) => r.id?.trim()).filter(Boolean));
  const refs = new Set(vacancyRows.map((r) => r.company_id?.trim()).filter(Boolean));
  const missing = [...refs].filter((id) => !companyIds.has(id));
  return { ok: missing.length === 0, missing };
}

function toWorkType(raw: string): string {
  const key = (raw || "").trim().toLowerCase();
  return WORK_TYPE_MAP[key] ?? "Full-time";
}

function toBool(raw: string): boolean {
  const v = (raw || "").trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}

function toStatus(raw: string): "DRAFT" | "PUBLISHED" | "CLOSED" {
  const v = (raw || "").trim().toLowerCase();
  if (v === "active" || v === "published") return "PUBLISHED";
  if (v === "closed") return "CLOSED";
  return "PUBLISHED";
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args[0] === "--check";
  const paths = dryRun ? args.slice(1) : args;
  if (paths.length < 2) {
    console.error("Usage: npx tsx prisma/import-vacancies-from-csv.ts [--check] <company_csv> <vacancy_csv>");
    process.exit(1);
  }
  const [companyPath, vacancyPath] = paths;
  if (!fs.existsSync(companyPath)) {
    console.error("Company CSV not found:", companyPath);
    process.exit(1);
  }
  if (!fs.existsSync(vacancyPath)) {
    console.error("Vacancy CSV not found:", vacancyPath);
    process.exit(1);
  }

  console.log("Reading CSVs...");
  const companyRows = parseCsv(companyPath, COMPANY_COLS);
  const vacancyRows = parseCsv(vacancyPath, VACANCY_COLS);
  console.log(`Company rows: ${companyRows.length}, Vacancy rows: ${vacancyRows.length}`);

  const cVal = validateCompanyCsv(companyRows);
  const vVal = validateVacancyCsv(vacancyRows);
  const refCheck = checkCompanyIdRefs(companyRows, vacancyRows);

  if (!cVal.ok) {
    console.error("Company CSV format issues:");
    cVal.errors.forEach((e) => console.error("  -", e));
  }
  if (!vVal.ok) {
    console.error("Vacancy CSV format issues:");
    vVal.errors.forEach((e) => console.error("  -", e));
  }
  if (!refCheck.ok) {
    console.error("Vacancy company_id not in Company CSV:", refCheck.missing.slice(0, 5).join(", "), refCheck.missing.length > 5 ? `... (${refCheck.missing.length} total)` : "");
  }

  if (!cVal.ok || !vVal.ok || !refCheck.ok) {
    console.error("\nFix the issues above and run again.");
    process.exit(1);
  }
  console.log("Format check passed.\n");

  if (dryRun) {
    console.log("Dry run (--check): no DB changes.");
    return;
  }

  const prisma = new PrismaClient();
  const passwordHash = hashPassword(DEFAULT_PASSWORD);

  try {
    console.log("Creating users and companies...");
    const companyIdToUserId: Record<string, string> = {};
    const seenCompanyIds = new Set<string>();
    let usersCreated = 0;
    let companiesCreated = 0;
    for (let index = 0; index < companyRows.length; index++) {
      const row = companyRows[index];
      const id = row.id?.trim();
      if (!id) {
        console.warn(`Skipping company row ${index + 2}: empty id`);
        continue;
      }
      const name = (row.name || "Company").trim();
      // One unique user per row (so duplicate company ids still get separate users)
      const email = `import-${id}-${index}@matcher.ge`;
      const user = await prisma.user.upsert({
        where: { email },
        create: { email, passwordHash, role: "EMPLOYER" },
        update: { passwordHash },
      });
      usersCreated++;
      // Vacancy CSV company_id references company row id; first occurrence wins for linking
      if (!companyIdToUserId[id]) companyIdToUserId[id] = user.id;
      const companyData = {
        name: name.slice(0, 255),
        companyId: (row.company_id || "N/A").trim().slice(0, 64),
        contactEmail: (row.contact_email || email).trim().slice(0, 255),
        contactPhone: (row.contact_phone || "").trim().slice(0, 64) || "",
        bio: (row.bio || "").trim().slice(0, 5000) || null,
        website: (row.website || "").trim().slice(0, 512) || null,
        industry: (row.industry || "").trim().slice(0, 255) || null,
        employeeCount: (row.employee_count || "").trim().slice(0, 64) || null,
        address: (row.address || "").trim().slice(0, 512) || null,
        linkedIn: (row.linkedin || "").trim().slice(0, 512) || null,
      };
      const companyDbId = seenCompanyIds.has(id) ? `${id}-${index}` : id;
      seenCompanyIds.add(id);
      const existing = await prisma.company.findUnique({ where: { id: companyDbId } });
      if (existing) {
        await prisma.company.update({ where: { id: companyDbId }, data: companyData });
      } else {
        await prisma.company.create({
          data: { id: companyDbId, user: { connect: { id: user.id } }, ...companyData },
        });
        companiesCreated++;
      }
    }
    console.log(`Users: ${usersCreated} rows (each has a login). Companies: ${companiesCreated} created.`);

    console.log("Creating vacancies...");
    let created = 0;
    let skipped = 0;
    for (const row of vacancyRows) {
      const companyId = row.company_id?.trim();
      if (!companyId || !companyIdToUserId[companyId]) {
        skipped++;
        continue;
      }
      const vacancyId = row.id?.trim()!;
      const salaryMin = row.salary_min != null && row.salary_min !== "" ? parseInt(row.salary_min, 10) : null;
      const salaryMax = row.salary_max != null && row.salary_max !== "" ? parseInt(row.salary_max, 10) : 0;
      const locationCityId = (row.location_city_id || "").trim() || "tbilisi";
      const vacancyData = {
        companyId,
        title: (row.title || "Vacancy").trim().slice(0, 255),
        locationCityId: locationCityId.slice(0, 64),
        locationDistrictId: (row.location_district_id || "").trim().slice(0, 64) || null,
        salaryMin: salaryMin ?? null,
        salaryMax: isNaN(salaryMax) ? 0 : salaryMax,
        workType: toWorkType(row.work_type),
        isRemote: toBool(row.is_remote),
        requiredExperienceMonths: parseInt(row.required_experience_months || "0", 10) || 0,
        requiredEducationLevel: (row.required_education_level || "High School").trim().slice(0, 64),
        description: (row.description || "").trim().slice(0, 20000) || null,
        photo: (row.photo || "").trim().slice(0, 2048) || null,
        status: toStatus(row.status),
        contactName: (row.contact_name || "").trim().slice(0, 255) || null,
        contactEmail: (row.contact_email || "").trim().slice(0, 255) || null,
        contactPhone: (row.contact_phone || "").trim().slice(0, 64) || null,
      };
      await prisma.vacancy.upsert({
        where: { id: vacancyId },
        create: { id: vacancyId, ...vacancyData },
        update: vacancyData,
      });
      created++;
    }
    console.log(`Upserted ${created} vacancies, skipped ${skipped}.`);
    console.log("\nDone. Each company row has a login: email import-<id>-<rowIndex>@matcher.ge (e.g. import-7214b272-0@matcher.ge), password:", DEFAULT_PASSWORD);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
