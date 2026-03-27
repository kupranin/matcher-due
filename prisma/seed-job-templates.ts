/**
 * Seed job role templates and skills from entry_level_jobs_300.csv
 * Run: npm run db:seed:jobs
 *
 * Populates JobRoleTemplate for both en and ka. Georgian titles come from:
 * 1. JobTitle_GE in CSV (if set), else
 * 2. prisma/data/job-title-en-to-ka.ts mapping, else
 * 3. English title as fallback so KA locale always has the same list.
 */

import { parse } from "csv-parse/sync";
import * as fs from "fs";
import * as path from "path";
import { PrismaClient } from "@prisma/client";
import { JOB_TITLE_EN_TO_KA, JOB_TITLE_SUFFIX_EN_TO_KA } from "./data/job-title-en-to-ka";

const prisma = new PrismaClient();

// Works from project root with tsx or ts-node (ESM/CJS). Run: npm run db:seed:jobs
const CSV_PATH = path.join(process.cwd(), "prisma", "data", "entry_level_jobs_300.csv");

function slugify(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, (c) => (c === "/" ? "-" : ""))
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "job";
}

function makeSlugUnique(baseSlug: string, seen: Map<string, number>): string {
  const n = seen.get(baseSlug) ?? 0;
  seen.set(baseSlug, n + 1);
  return n === 0 ? baseSlug : `${baseSlug}-${n + 1}`;
}

/** Resolve Georgian job title: exact match, or "Base (Suffix)" → "BaseKa (SuffixKa)". */
function resolveTitleKa(titleEn: string): string {
  const exact = JOB_TITLE_EN_TO_KA[titleEn];
  if (exact) return exact;
  const m = titleEn.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  if (m) {
    const base = m[1].trim();
    const suffix = m[2].trim();
    const baseKa = JOB_TITLE_EN_TO_KA[base];
    const suffixKa = JOB_TITLE_SUFFIX_EN_TO_KA[suffix];
    if (baseKa && suffixKa) return `${baseKa} (${suffixKa})`;
    if (baseKa) return `${baseKa} (${suffix})`;
  }
  return titleEn;
}

function parseSkills(skillsStr: string): string[] {
  if (!skillsStr || !skillsStr.trim()) return [];
  return skillsStr
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
}

async function main() {
  if (!fs.existsSync(CSV_PATH)) {
    throw new Error(`CSV not found at ${CSV_PATH}. Copy entry_level_jobs_300.csv to prisma/data/`);
  }

  const raw = fs.readFileSync(CSV_PATH, "utf-8");
  const rows = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_quotes: true,
    relax_column_count: true,
  }) as Array<{
    Source: string;
    JobTitle_EN: string;
    JobTitle_GE: string;
    Skills: string;
    Description: string;
  }>;

  const slugCount = new Map<string, number>();
  let created = 0;
  let skipped = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const titleEn = row.JobTitle_EN?.trim();
    const titleGe = row.JobTitle_GE?.trim();
    const source = row.Source?.trim() || "Entry-level";
    const description = row.Description?.trim() || "";
    const skills = parseSkills(row.Skills || "");

    if (!titleEn) {
      skipped++;
      continue;
    }

    const baseSlug = slugify(titleEn);
    const slug = makeSlugUnique(baseSlug, slugCount);

    // EN template
    const roleEn = await prisma.jobRoleTemplate.upsert({
      where: { slug_locale: { slug, locale: "en" } },
      update: {
        title: titleEn,
        category: source,
        description,
      },
      create: {
        slug,
        locale: "en",
        title: titleEn,
        category: source,
        description,
      },
    });

    // Delete existing skills so we can re-add (in case CSV changed)
    await prisma.roleSkillTemplate.deleteMany({ where: { roleId: roleEn.id } });

    const weightDefault = 3;
    for (let s = 0; s < skills.length; s++) {
      const weight = s === 0 ? 5 : s === 1 ? 4 : weightDefault;
      await prisma.roleSkillTemplate.create({
        data: {
          roleId: roleEn.id,
          skillName: skills[s],
          weight,
        },
      });
    }

    // KA template: always create so Georgian locale has full list. Use CSV JobTitle_GE, else mapping (exact or base+suffix), else EN fallback.
    const titleKa = titleGe || resolveTitleKa(titleEn) || titleEn;
    const roleKa = await prisma.jobRoleTemplate.upsert({
      where: { slug_locale: { slug, locale: "ka" } },
      update: {
        title: titleKa,
        category: source,
        description,
      },
      create: {
        slug,
        locale: "ka",
        title: titleKa,
        category: source,
        description,
      },
    });

    await prisma.roleSkillTemplate.deleteMany({ where: { roleId: roleKa.id } });
    for (let s = 0; s < skills.length; s++) {
      const weight = s === 0 ? 5 : s === 1 ? 4 : weightDefault;
      await prisma.roleSkillTemplate.create({
        data: {
          roleId: roleKa.id,
          skillName: skills[s],
          weight,
        },
      });
    }

    created++;
    if (created % 50 === 0) console.log(`  ... ${created} job templates`);
  }

  console.log(`Job templates seed done: ${created} positions, ${skipped} rows skipped.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
