/**
 * Minimal seed: only the two login users + candidate profile + company.
 * Run: npx tsx prisma/seed-users-only.ts
 * Use when full seed hangs; then log in with nino@example.com or hr@coffeelab.ge, password: password123
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";

const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
const prisma = new PrismaClient(
  dbUrl ? { datasources: { db: { url: dbUrl } } } : undefined
);

const PASSWORD = "password123";
const passwordHash = hashSync(PASSWORD, 10);

async function main() {
  console.log("Connecting...");
  await prisma.$connect();

  console.log("Creating candidate user nino@example.com...");
  const candidateUser = await prisma.user.upsert({
    where: { email: "nino@example.com" },
    update: { passwordHash },
    create: { email: "nino@example.com", passwordHash, role: "CANDIDATE" },
  });

  console.log("Creating candidate profile...");
  await prisma.candidateProfile.upsert({
    where: { userId: candidateUser.id },
    update: {},
    create: {
      userId: candidateUser.id,
      fullName: "Nino K.",
      phone: "+995555123456",
      locationCityId: "tbilisi",
      salaryMin: 1100,
      willingToRelocate: false,
      experienceMonths: 12,
      educationLevel: "High School",
      workTypes: ["Full-time"],
      jobTitle: "Barista",
    },
  });

  console.log("Creating employer user hr@coffeelab.ge...");
  const employerUser = await prisma.user.upsert({
    where: { email: "hr@coffeelab.ge" },
    update: { passwordHash },
    create: { email: "hr@coffeelab.ge", passwordHash, role: "EMPLOYER" },
  });

  console.log("Creating company...");
  await prisma.company.upsert({
    where: { userId: employerUser.id },
    update: {},
    create: {
      userId: employerUser.id,
      name: "Coffee Lab",
      companyId: "123456789",
      contactEmail: "hr@coffeelab.ge",
      contactPhone: "+995555999999",
    },
  });

  console.log("Done. You can log in with:");
  console.log("  Candidate: nino@example.com");
  console.log("  Employer:  hr@coffeelab.ge");
  console.log("  Password:  password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
