/**
 * Import candidate profiles from Generated_Candidate_Profiles.csv into the database.
 * Creates a User (CANDIDATE) per row with password 12345678, then CandidateProfile.
 *
 * Run: npx tsx prisma/import-candidate-profiles.ts [path/to/Generated_Candidate_Profiles.csv]
 * Default path: ./prisma/data/Generated_Candidate_Profiles.csv (copy CSV there) or use full path.
 */

import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse/sync";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth";

const CSV_PATH =
  process.argv[2] ||
  path.join(process.cwd(), "prisma", "data", "Generated_Candidate_Profiles.csv");

const PASSWORD = "12345678";

const prisma = new PrismaClient(
  process.env.DIRECT_URL || process.env.DATABASE_URL
    ? {
        datasources: {
          db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL },
        },
      }
    : undefined
);

function parseWorkTypes(raw: string): string[] {
  if (!raw || !raw.trim()) return ["Full-time"];
  try {
    const s = raw.replace(/""/g, '"');
    const arr = JSON.parse(s);
    return Array.isArray(arr) && arr.every((x) => typeof x === "string")
      ? arr
      : ["Full-time"];
  } catch {
    return ["Full-time"];
  }
}

function parseBool(raw: string): boolean {
  const v = (raw || "").trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}

async function main() {
  if (!fs.existsSync(CSV_PATH)) {
    throw new Error(`CSV not found at ${CSV_PATH}. Pass path as first argument.`);
  }

  const raw = fs.readFileSync(CSV_PATH, "utf-8");
  const rows = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_quotes: true,
    relax_column_count: true,
  }) as Array<{
    id: string;
    user_id: string;
    full_name: string;
    phone: string;
    location_city_id: string;
    location_district_id: string;
    salary_min: string;
    willing_to_relocate: string;
    experience_months: string;
    experience_text: string;
    education_level: string;
    work_types: string;
    photo: string;
    job_title: string;
    created_at: string;
    updated_at: string;
    available_to_work: string;
  }>;

  const passwordHash = hashPassword(PASSWORD);

  console.log(`Importing ${rows.length} candidate profiles from ${CSV_PATH}...`);
  let created = 0;
  let skipped = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const fullName = (row.full_name || "").trim();
    if (!fullName) {
      skipped++;
      continue;
    }

    const email = `candidate-${i + 1}@imported.matcher.local`;
    const salaryMin = Math.max(0, parseInt(row.salary_min || "0", 10) || 0);
    const experienceMonths = Math.max(0, parseInt(row.experience_months || "0", 10) || 0);
    const workTypes = parseWorkTypes(row.work_types || "");
    const locationCityId = (row.location_city_id || "tbilisi").trim().toLowerCase();
    const locationDistrictId = (row.location_district_id || "").trim() || null;
    const educationLevel =
      (row.education_level || "High School").trim() || "High School";

    try {
      const user = await prisma.user.upsert({
        where: { email },
        update: { passwordHash },
        create: {
          email,
          passwordHash,
          role: "CANDIDATE",
        },
      });

      await prisma.candidateProfile.upsert({
        where: { userId: user.id },
        update: {
          fullName,
          phone: (row.phone || "").trim() || null,
          locationCityId,
          locationDistrictId,
          salaryMin,
          willingToRelocate: parseBool(row.willing_to_relocate),
          experienceMonths,
          experienceText: (row.experience_text || "").trim() || null,
          educationLevel,
          workTypes,
          photo: (row.photo || "").trim() || null,
          jobTitle: (row.job_title || "").trim() || null,
          availableToWork: parseBool(row.available_to_work),
        },
        create: {
          userId: user.id,
          fullName,
          phone: (row.phone || "").trim() || null,
          locationCityId,
          locationDistrictId,
          salaryMin,
          willingToRelocate: parseBool(row.willing_to_relocate),
          experienceMonths,
          experienceText: (row.experience_text || "").trim() || null,
          educationLevel,
          workTypes,
          photo: (row.photo || "").trim() || null,
          jobTitle: (row.job_title || "").trim() || null,
          availableToWork: parseBool(row.available_to_work),
        },
      });

      created++;
      if (created % 50 === 0) console.log(`  ... ${created} imported`);
    } catch (e) {
      console.error(`Row ${i + 1} (${fullName}):`, e);
      skipped++;
    }
  }

  console.log(`Done. Imported ${created} candidates, skipped ${skipped}.`);
  console.log(`All passwords set to: ${PASSWORD}`);
  console.log(`Log in with e.g. candidate-1@imported.matcher.local / ${PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());