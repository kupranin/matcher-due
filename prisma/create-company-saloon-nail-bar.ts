/**
 * One-time script: create company "Saloon Nail Bar" and an employer user so the vacancy seed can run.
 * Run: npx tsx prisma/create-company-saloon-nail-bar.ts
 *
 * Safe to run multiple times: uses upsert for user and finds or creates company by name.
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient(
  process.env.DIRECT_URL ? { datasources: { db: { url: process.env.DIRECT_URL } } } : undefined
);

const COMPANY_NAME = "Saloon Nail Bar";
const EMPLOYER_EMAIL = "saloon-nail-bar@example.com";
const PASSWORD = "password123";

async function main() {
  await prisma.$connect();

  const existing = await prisma.company.findFirst({
    where: { name: { contains: "Saloon", mode: "insensitive" } },
    select: { id: true, name: true },
  });

  if (existing) {
    console.log(`Company already exists: ${existing.name} (id: ${existing.id})`);
    console.log("You can run: npx tsx prisma/seed-saloon-nail-bar-vacancy.ts");
    return;
  }

  const user = await prisma.user.upsert({
    where: { email: EMPLOYER_EMAIL },
    update: {},
    create: {
      email: EMPLOYER_EMAIL,
      passwordHash: hashSync(PASSWORD, 10),
      role: "EMPLOYER",
    },
  });

  const company = await prisma.company.create({
    data: {
      userId: user.id,
      name: COMPANY_NAME,
      companyId: "SALOON-NAIL-BAR-001",
      contactEmail: EMPLOYER_EMAIL,
      contactPhone: "+995555000000",
      industry: "Beauty / Nail salon",
    },
  });

  console.log(`Created company: ${company.name} (id: ${company.id})`);
  console.log(`Employer user: ${EMPLOYER_EMAIL} (password: ${PASSWORD})`);
  console.log("\nRun the vacancy seed: npx tsx prisma/seed-saloon-nail-bar-vacancy.ts");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
