/**
 * Import companies from the simple CSV format:
 *   id, name, contact_email, contact_phone, industry, address, website
 * Creates one User (EMPLOYER) per row with the same password for all.
 *
 * Usage: npx tsx prisma/import-companies-simple.ts <path-to-company.csv> [password]
 * Default password: 12345678@
 *
 * Optional: OFFSET=0 LIMIT=100 to import a slice (if you hit "max clients" with Supabase,
 * stop other apps using the DB or run in chunks: LIMIT=100, then OFFSET=100 LIMIT=100, etc.)
 *
 * Example: npx tsx prisma/import-companies-simple.ts ./company_import_300_with_extra_fields.csv
 */

import { parse } from "csv-parse/sync";
import * as fs from "fs";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth";

const EXPECTED_COLS = ["id", "name", "contact_email", "contact_phone", "industry", "address", "website"];

function parseCsv(filePath: string): Record<string, string>[] {
  const raw = fs.readFileSync(filePath, "utf-8");
  return parse(raw, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
    trim: true,
  }) as Record<string, string>[];
}

async function main() {
  const csvPath = process.argv[2];
  const password = process.argv[3] ?? "12345678@";
  const offset = parseInt(process.env.OFFSET || "0", 10) || 0;
  const limit = parseInt(process.env.LIMIT || "0", 10) || 0;

  if (!csvPath) {
    console.error("Usage: npx tsx prisma/import-companies-simple.ts <company_csv_path> [password]");
    console.error("Optional: OFFSET=0 LIMIT=100 to import a slice (e.g. if you hit connection limits).");
    process.exit(1);
  }
  if (!fs.existsSync(csvPath)) {
    console.error("File not found:", csvPath);
    process.exit(1);
  }

  let rows = parseCsv(csvPath);
  if (offset > 0 || (limit > 0 && limit < rows.length)) {
    rows = rows.slice(offset, limit > 0 ? offset + limit : undefined);
    console.log("Slice: offset", offset, "limit", limit || "all", "->", rows.length, "rows");
  }
  const first = rows[0];
  if (!first) {
    console.error("CSV is empty.");
    process.exit(1);
  }
  for (const col of EXPECTED_COLS) {
    if (!(col in first)) {
      console.error("Missing column:", col, "Expected:", EXPECTED_COLS.join(", "));
      process.exit(1);
    }
  }

  console.log("Companies to import:", rows.length, "| Password for all:", password);
  console.log("Importing…");
  const passwordHash = hashPassword(password);
  const dbUrl = process.env.DATABASE_URL || "";
  const urlWithLimit = dbUrl.includes("connection_limit")
    ? dbUrl
    : dbUrl + (dbUrl.includes("?") ? "&" : "?") + "connection_limit=1";
  const prisma = new PrismaClient({ datasources: { db: { url: urlWithLimit } } });
  const BATCH_SIZE = 25;

  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

  try {
    let created = 0;
    let updated = 0;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const email = (row.contact_email || "").trim().toLowerCase();
      const name = (row.name || "Company").trim();
      const companyIdTax = String(row.id || "").trim() || "N/A";
      if (!email || email.length < 3) {
        console.warn("Skipping row: no contact_email");
        continue;
      }

      const user = await prisma.user.upsert({
        where: { email },
        create: { email, passwordHash, role: "EMPLOYER" },
        update: { passwordHash },
      });
      const existingCompany = await prisma.company.findUnique({ where: { userId: user.id } });
      const companyData = {
        name: name.slice(0, 255),
        companyId: companyIdTax.slice(0, 64),
        contactEmail: email.slice(0, 255),
        contactPhone: (row.contact_phone || "").trim().slice(0, 64) || "",
        industry: (row.industry || "").trim().slice(0, 255) || null,
        address: (row.address || "").trim().slice(0, 512) || null,
        website: (row.website || "").trim().slice(0, 512) || null,
      };
      if (existingCompany) {
        await prisma.company.update({ where: { id: existingCompany.id }, data: companyData });
        updated++;
      } else {
        await prisma.company.create({
          data: { user: { connect: { id: user.id } }, ...companyData },
        });
        created++;
      }
      if ((i + 1) % BATCH_SIZE === 0) {
        await delay(800);
        console.log("  ", i + 1, "/", rows.length);
      }
    }
    console.log("Done. Created:", created, "| Updated:", updated);
    console.log("All company logins use contact_email from CSV and password:", password);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
