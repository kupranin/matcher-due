/**
 * For companies whose name *contains* "kursi" or "spar" (case-insensitive):
 * 1. Delete all their vacancies (and related data via cascade).
 * 2. Rename the company to "My Company" so the cabinet no longer shows Spar/kursi.ge.
 *
 * This catches names like "SPAR", "Spar Georgia", "kursi.ge", etc.
 *
 * Run: npm run db:rename-companies-kursi-spar
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
const prisma = new PrismaClient(
  dbUrl ? { datasources: { db: { url: dbUrl } } } : undefined
);

const NEW_NAME = "My Company";

async function main() {
  await prisma.$connect();

  const companies = await prisma.company.findMany({
    where: {
      OR: [
        { name: { contains: "spar", mode: "insensitive" } },
        { name: { contains: "kursi", mode: "insensitive" } },
      ],
    },
    select: { id: true, name: true },
  });

  if (companies.length === 0) {
    console.log('No companies found whose name contains "spar" or "kursi" (case-insensitive).');
    return;
  }

  const companyIds = companies.map((c) => c.id);

  // 1. Delete all vacancies for these companies (cascade will remove VacancySkill, matches, etc.)
  const deletedVacancies = await prisma.vacancy.deleteMany({
    where: { companyId: { in: companyIds } },
  });
  console.log(
    "Deleted",
    deletedVacancies.count,
    "vacancy(ies) from companies:",
    companies.map((c) => c.name).join(", ")
  );

  // 2. Rename companies so cabinet shows "My Company" instead of Spar/kursi.ge
  for (const c of companies) {
    console.log("Renaming:", c.name, "(id:", c.id, ") ->", NEW_NAME);
    await prisma.company.update({
      where: { id: c.id },
      data: { name: NEW_NAME },
    });
  }

  console.log("Done. Renamed", companies.length, "company(ies).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
