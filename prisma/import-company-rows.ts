/**
 * Import USERS only from Company_rows.csv (uses contact_email per row).
 * Creates/updates one User (EMPLOYER) per row with email = contact_email and password 12345678.
 * Does NOT create or update Company records — user part only.
 *
 * Usage: npx tsx prisma/import-company-rows.ts /path/to/Company_rows.csv
 * Optional: PASSWORD=12345678 (default 12345678)
 */

import * as path from "path";
import { parse } from "csv-parse/sync";
import * as fs from "fs";
import { config } from "dotenv";

// Load .env from project root (parent of prisma/) so DATABASE_URL is set
config({ path: path.join(__dirname, "..", ".env") });
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth";

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
  const csvPath = process.argv[2] || process.env.CSV_PATH;
  const password = process.env.PASSWORD ?? "12345678";

  if (!csvPath) {
    console.error("Usage: npx tsx prisma/import-company-rows.ts /path/to/Company_rows.csv");
    process.exit(1);
  }
  if (!fs.existsSync(csvPath)) {
    console.error("File not found:", csvPath);
    process.exit(1);
  }

  const rows = parseCsv(csvPath);
  if (rows.length === 0) {
    console.error("CSV is empty.");
    process.exit(1);
  }

  const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("No DATABASE_URL or DIRECT_URL in environment. Load .env from project root or set the variable.");
    process.exit(1);
  }
  const dbHost = dbUrl.replace(/^[^@]+@/, "").split("/")[0].split("?")[0];
  console.log("Database host:", dbHost);
  console.log("(Users go to Postgres table 'User' in Table Editor, NOT Supabase Authentication.)");

  const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

  const passwordHash = hashPassword(password);
  console.log("Importing users only (no companies). Rows:", rows.length, "| Password:", password);

  let created = 0;
  let updated = 0;
  let failed = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const email = (row.contact_email || "").trim().toLowerCase();
    if (!email || email.length < 3) {
      console.warn("Row", i + 2, "skipped: no contact_email");
      continue;
    }

    try {
      const existing = await prisma.user.findUnique({ where: { email } });
      await prisma.user.upsert({
        where: { email },
        create: { email, passwordHash, role: "EMPLOYER" },
        update: { passwordHash },
      });
      if (existing) updated++;
      else created++;
    } catch (err) {
      failed++;
      console.error("Row", i + 2, "email", email, "error:", (err as Error).message);
    }

    if ((i + 1) % 20 === 0) console.log("  ", i + 1, "/", rows.length);
  }

  if (failed > 0) console.log("Failed rows:", failed);

  console.log("Done. Users created:", created, "| updated:", updated);

  const total = await prisma.user.count();
  const sample = await prisma.user.findMany({ take: 5, select: { email: true, role: true } });
  console.log("Total users in DB now:", total);
  console.log("Sample emails:", sample.map((u) => u.email).join(", "));
  console.log("");
  console.log("In Supabase: open Table Editor → select table 'User' (not Authentication).");
  console.log("Login in your app with any contact_email from CSV, password:", password);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
