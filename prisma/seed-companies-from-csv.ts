/**
 * Create companies for existing users by matching contact_email.
 * CSV must have: id, user_id, name, company_id, contact_email, contact_phone, address, bio, employee_count, industry, linkedIn, website
 * User IDs in DB are matched by contact_email (users must already exist from import-company-rows or similar).
 *
 * Usage: npx tsx prisma/seed-companies-from-csv.ts /path/to/Logically_Correct_Company_rows.csv
 */

import * as path from "path";
import { config } from "dotenv";
import { parse } from "csv-parse/sync";
import * as fs from "fs";
import { PrismaClient } from "@prisma/client";

config({ path: path.join(__dirname, "..", ".env") });

function parseCsv(filePath: string): Record<string, string>[] {
  const raw = fs.readFileSync(filePath, "utf-8");
  return parse(raw, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
    trim: true,
  }) as Record<string, string>[];
}

function str(val: unknown): string {
  if (val == null) return "";
  const s = String(val).trim();
  return s === "undefined" || s === "null" ? "" : s;
}

function numStr(val: unknown): string {
  const s = str(val);
  if (!s) return "N/A";
  const n = parseFloat(s);
  if (Number.isNaN(n)) return s;
  return Number.isInteger(n) ? String(n) : String(n);
}

async function main() {
  const csvPath = process.argv[2];
  if (!csvPath || !fs.existsSync(csvPath)) {
    console.error("Usage: npx tsx prisma/seed-companies-from-csv.ts /path/to/Logically_Correct_Company_rows.csv");
    process.exit(1);
  }

  const rows = parseCsv(csvPath);
  if (rows.length === 0) {
    console.error("CSV is empty.");
    process.exit(1);
  }

  const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("Set DIRECT_URL or DATABASE_URL in .env");
    process.exit(1);
  }

  const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });
  console.log("Creating companies for", rows.length, "rows (matching users by contact_email)...");

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const email = str(row.contact_email).toLowerCase();
    if (!email || email.length < 3) {
      skipped++;
      continue;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.warn("No user for email:", email, "- skip row", i + 2);
      skipped++;
      continue;
    }

    const name = str(row.name) || "Company";
    const companyIdTax = numStr(row.company_id);
    const contactPhone = str(row.contact_phone);
    const address = str(row.address) || null;
    const bio = str(row.bio) || null;
    const industry = str(row.industry) || null;
    const employeeCount = str(row.employee_count) || null;
    const website = str(row.website) || null;
    const linkedIn = str(row.linkedIn || row.linkedin) || null;

    const data = {
      name: name.slice(0, 255),
      companyId: companyIdTax.slice(0, 64),
      contactEmail: email.slice(0, 255),
      contactPhone: contactPhone.slice(0, 64) || "",
      address: address?.slice(0, 512) || null,
      bio: bio?.slice(0, 2000) || null,
      industry: industry?.slice(0, 255) || null,
      employeeCount: employeeCount?.slice(0, 64) || null,
      website: website?.slice(0, 512) || null,
      linkedIn: linkedIn?.slice(0, 512) || null,
    };

    const existing = await prisma.company.findUnique({ where: { userId: user.id } });
    if (existing) {
      await prisma.company.update({ where: { id: existing.id }, data });
      updated++;
    } else {
      await prisma.company.create({
        data: { userId: user.id, ...data },
      });
      created++;
    }

    if ((i + 1) % 25 === 0) console.log("  ", i + 1, "/", rows.length);
  }

  console.log("Done. Companies created:", created, "| updated:", updated, "| skipped (no user):", skipped);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
