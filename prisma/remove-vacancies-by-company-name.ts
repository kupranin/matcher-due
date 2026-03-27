/**
 * Remove all vacancies from companies whose name matches "kursi.ge" or "spar" (case-insensitive).
 * Run: npx tsx prisma/remove-vacancies-by-company-name.ts
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
const prisma = new PrismaClient(
  dbUrl ? { datasources: { db: { url: dbUrl } } } : undefined
);

const NAMES_TO_REMOVE = ["kursi.ge", "spar"].map((n) => n.toLowerCase());

async function main() {
  await prisma.$connect();

  const allCompanies = await prisma.company.findMany({
    select: { id: true, name: true },
  });
  const companies = allCompanies.filter((c) =>
    NAMES_TO_REMOVE.includes(c.name.trim().toLowerCase())
  );

  if (companies.length === 0) {
    console.log("No companies found with names:", NAMES_TO_REMOVE.join(", "));
    return;
  }

  const companyIds = companies.map((c) => c.id);
  for (const c of companies) {
    console.log("Company:", c.name, "(id:", c.id, ")");
  }

  const count = await prisma.vacancy.deleteMany({
    where: { companyId: { in: companyIds } },
  });

  console.log("Deleted", count.count, "vacancy(ies) from the above companies.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
