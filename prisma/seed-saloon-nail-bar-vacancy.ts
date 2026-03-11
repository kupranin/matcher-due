/**
 * Add vacancy for existing company "Saloon Nail Bar".
 * Run: npx tsx prisma/seed-saloon-nail-bar-vacancy.ts
 *
 * IMPORTANT: Does NOT create a company. Finds Company where name = "Saloon Nail Bar" and attaches the vacancy.
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient(
  process.env.DIRECT_URL ? { datasources: { db: { url: process.env.DIRECT_URL } } } : undefined
);

const COMPANY_NAME = "Saloon Nail Bar"; // DB may have "Nail Bar" – script also tries contains "saloon" + "nail"
const TBILISI_ID = "tbilisi";

const VACANCY = {
  normalizedTitle: "salon_administrator",
  targetRole: "Salon Administrator",
  title: "Salon Administrator",
  salaryMin: 1200,
  salaryMax: 1600,
  workType: "Full-time",
  requiredExperienceMonths: 24,
  requiredEducationLevel: "None",
  description:
    "Manage client appointments; greet and assist customers; coordinate salon staff schedules; manage phone and social media bookings; handle payments and POS system; ensure smooth daily salon operations. Georgian required; Russian or English preferred. 0–2 years preferred.",
  requiredSkills: [
    { name: "Customer service", level: "Intermediate", weight: 5 },
    { name: "Appointment scheduling", level: "Intermediate", weight: 5 },
    { name: "POS system operation", level: "Intermediate", weight: 5 },
    { name: "Communication", level: "Intermediate", weight: 5 },
    { name: "Friendliness", level: "Intermediate", weight: 4 },
    { name: "Organization", level: "Intermediate", weight: 5 },
    { name: "Multitasking", level: "Intermediate", weight: 4 },
    { name: "Attention to detail", level: "Intermediate", weight: 4 },
  ],
  preferredSkills: [
    { name: "Beauty salon experience", level: "Beginner", weight: 3 },
    { name: "Social media messaging", level: "Beginner", weight: 2 },
    { name: "Basic sales skills", level: "Beginner", weight: 2 },
  ],
};

async function main() {
  console.log("Connecting to database...");
  await prisma.$connect();

  let company = await prisma.company.findFirst({
    where: { name: { equals: COMPANY_NAME, mode: "insensitive" } },
    select: { id: true, name: true },
  });

  if (!company) {
    const all = await prisma.company.findMany({ select: { id: true, name: true } });
    company = all.find(
      (c) => c.name.toLowerCase().includes("saloon") && c.name.toLowerCase().includes("nail")
    ) ?? null;
  }

  if (!company) {
    throw new Error(
      `Company "${COMPANY_NAME}" not found. Create the company first (e.g. via employer registration at /employer/register), or add it with: npx tsx prisma/create-company-saloon-nail-bar.ts`
    );
  }

  console.log(`Found company: ${company.name} (id: ${company.id})\n`);

  const existing = await prisma.vacancy.findFirst({
    where: { companyId: company.id, title: VACANCY.title },
    select: { id: true },
  });

  if (existing) {
    await prisma.vacancy.update({
      where: { id: existing.id },
      data: { salaryMin: VACANCY.salaryMin, salaryMax: VACANCY.salaryMax },
    });
    console.log(`  Updated salary: ${VACANCY.title} → ${VACANCY.salaryMin}–${VACANCY.salaryMax} GEL`);
  } else {
    const vacancy = await prisma.vacancy.create({
      data: {
        companyId: company.id,
        title: VACANCY.title,
        locationCityId: TBILISI_ID,
        salaryMin: VACANCY.salaryMin,
        salaryMax: VACANCY.salaryMax,
        workType: VACANCY.workType,
        isRemote: false,
        requiredExperienceMonths: VACANCY.requiredExperienceMonths,
        requiredEducationLevel: VACANCY.requiredEducationLevel,
        description: VACANCY.description,
        status: "PUBLISHED",
      },
    });

    const allSkills: Array<{ name: string; level: string; weight: number; isRequired: boolean }> = [
      ...VACANCY.requiredSkills.map((s) => ({ ...s, isRequired: true })),
      ...VACANCY.preferredSkills.map((s) => ({ ...s, isRequired: false })),
    ];

    await prisma.vacancySkill.createMany({
      data: allSkills.map((s) => ({
        vacancyId: vacancy.id,
        name: s.name,
        level: s.level as "Beginner" | "Intermediate" | "Advanced",
        weight: s.weight,
        isRequired: s.isRequired,
      })),
    });

    console.log(`  Created: ${VACANCY.title} (id: ${vacancy.id}, ${allSkills.length} skills)`);
  }

  console.log("\n--- Summary ---");
  console.log(`Company: ${company.name} (id: ${company.id})`);
  console.log(`Vacancy: ${VACANCY.title} | ${VACANCY.salaryMin}–${VACANCY.salaryMax} GEL`);
  console.log("\nConfirmation: Vacancy is PUBLISHED and attached to the existing Saloon Nail Bar company_id:", company.id);

  console.log("\n--- Structured JSON (for reference) ---");
  const jsonPayload = {
    company_id: company.id,
    company_name: company.name,
    confirmation: "Vacancy attached to existing Saloon Nail Bar company_id",
    vacancy: {
      normalizedTitle: VACANCY.normalizedTitle,
      targetRole: VACANCY.targetRole,
      title: VACANCY.title,
      seniorityLevel: VACANCY.requiredExperienceMonths >= 36 ? "Senior" : VACANCY.requiredExperienceMonths >= 12 ? "Mid" : "Entry",
      experienceMonths: VACANCY.requiredExperienceMonths,
      salaryMin: VACANCY.salaryMin,
      salaryMax: VACANCY.salaryMax,
      employmentType: VACANCY.workType,
      requiredSkills: VACANCY.requiredSkills.map((s) => s.name),
      softSkills: ["friendliness", "organization", "multitasking", "attention to detail"],
      tags: ["beauty", "salon", "receptionist", "administrator", "customer service"],
    },
  };
  console.log(JSON.stringify(jsonPayload, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
