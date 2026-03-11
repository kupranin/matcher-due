/**
 * Add vacancies for existing company "Degusto".
 * Run: npx tsx prisma/seed-degusto-vacancies.ts
 *
 * IMPORTANT: Does NOT create a company. Finds Company where name = "Degusto" and attaches vacancies.
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient(
  process.env.DIRECT_URL ? { datasources: { db: { url: process.env.DIRECT_URL } } } : undefined
);

const COMPANY_NAME = "Degusto";
const TBILISI_ID = "tbilisi";

type VacancyInput = {
  normalizedTitle: string;
  targetRole: string;
  title: string;
  salaryMin: number;
  salaryMax: number;
  workType: string;
  requiredExperienceMonths: number;
  requiredEducationLevel: string;
  description: string;
  requiredSkills: Array<{ name: string; level: string; weight: number }>;
  preferredSkills?: Array<{ name: string; level: string; weight: number }>;
};

const VACANCIES: VacancyInput[] = [
  {
    normalizedTitle: "assistant_cook",
    targetRole: "Assistant Cook",
    title: "Assistant Cook",
    salaryMin: 1200,
    salaryMax: 1600,
    workType: "Full-time",
    requiredExperienceMonths: 12,
    requiredEducationLevel: "High School",
    description:
      "Assist chefs in food preparation; prepare ingredients and basic dishes; maintain kitchen cleanliness and organization; support kitchen operations during busy hours. Culinary education preferred but not required. 0–1 year preferred.",
    requiredSkills: [
      { name: "Basic cooking knowledge", level: "Intermediate", weight: 5 },
      { name: "Kitchen hygiene practices", level: "Intermediate", weight: 5 },
      { name: "Food preparation", level: "Intermediate", weight: 5 },
      { name: "Teamwork", level: "Intermediate", weight: 5 },
      { name: "Speed and efficiency", level: "Intermediate", weight: 4 },
      { name: "Attention to detail", level: "Intermediate", weight: 4 },
    ],
    preferredSkills: [
      { name: "Restaurant kitchen experience", level: "Beginner", weight: 3 },
      { name: "Culinary training", level: "Beginner", weight: 2 },
    ],
  },
  {
    normalizedTitle: "cashier",
    targetRole: "Cashier",
    title: "Cashier",
    salaryMin: 1000,
    salaryMax: 1300,
    workType: "Full-time",
    requiredExperienceMonths: 12,
    requiredEducationLevel: "None",
    description:
      "Process customer payments; operate POS system; issue receipts; assist customers with orders; coordinate with kitchen staff. 0–1 year preferred.",
    requiredSkills: [
      { name: "Basic math", level: "Intermediate", weight: 5 },
      { name: "POS operation", level: "Intermediate", weight: 5 },
      { name: "Customer service", level: "Intermediate", weight: 5 },
      { name: "Communication", level: "Intermediate", weight: 4 },
      { name: "Accuracy", level: "Intermediate", weight: 5 },
      { name: "Friendliness", level: "Intermediate", weight: 4 },
    ],
    preferredSkills: [
      { name: "Restaurant cashier experience", level: "Beginner", weight: 2 },
    ],
  },
  {
    normalizedTitle: "waitress_waiter",
    targetRole: "Waitress / Waiter",
    title: "Waitress / Waiter",
    salaryMin: 1000,
    salaryMax: 1400,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description:
      "Greet and serve customers; take food and beverage orders; deliver meals to tables; maintain cleanliness of dining area; provide friendly service. Salary 1000–1400 GEL + tips. No experience required.",
    requiredSkills: [
      { name: "Customer service", level: "Intermediate", weight: 5 },
      { name: "Communication", level: "Intermediate", weight: 5 },
      { name: "Multitasking", level: "Intermediate", weight: 4 },
      { name: "Friendliness", level: "Intermediate", weight: 4 },
      { name: "Patience", level: "Intermediate", weight: 4 },
      { name: "Teamwork", level: "Intermediate", weight: 5 },
    ],
    preferredSkills: [
      { name: "Restaurant service experience", level: "Beginner", weight: 2 },
      { name: "Basic English", level: "Beginner", weight: 2 },
    ],
  },
  {
    normalizedTitle: "dishwasher",
    targetRole: "Dishwasher",
    title: "Dishwasher",
    salaryMin: 800,
    salaryMax: 1000,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description:
      "Wash dishes and kitchen equipment; maintain kitchen hygiene; assist kitchen staff with basic tasks; ensure cleanliness of dishwashing area. No experience required.",
    requiredSkills: [
      { name: "Reliability", level: "Intermediate", weight: 5 },
      { name: "Attention to hygiene", level: "Intermediate", weight: 5 },
      { name: "Discipline", level: "Intermediate", weight: 4 },
      { name: "Teamwork", level: "Intermediate", weight: 4 },
    ],
  },
];

async function main() {
  console.log("Connecting to database...");
  await prisma.$connect();

  const company = await prisma.company.findFirst({
    where: { name: COMPANY_NAME },
    select: { id: true, name: true },
  });

  if (!company) {
    throw new Error(
      `Company "${COMPANY_NAME}" not found. Do NOT create a new company. Ensure the company exists in the database and run this script again.`
    );
  }

  console.log(`Found company: ${company.name} (id: ${company.id})\n`);

  const created: Array<{ id: string; title: string; skillsCount: number }> = [];

  for (const v of VACANCIES) {
    const existing = await prisma.vacancy.findFirst({
      where: { companyId: company.id, title: v.title },
      select: { id: true },
    });

    if (existing) {
      await prisma.vacancy.update({
        where: { id: existing.id },
        data: { salaryMin: v.salaryMin, salaryMax: v.salaryMax },
      });
      console.log(`  Updated salary: ${v.title} → ${v.salaryMin}–${v.salaryMax} GEL`);
      continue;
    }

    const vacancy = await prisma.vacancy.create({
      data: {
        companyId: company.id,
        title: v.title,
        locationCityId: TBILISI_ID,
        salaryMin: v.salaryMin,
        salaryMax: v.salaryMax,
        workType: v.workType,
        isRemote: false,
        requiredExperienceMonths: v.requiredExperienceMonths,
        requiredEducationLevel: v.requiredEducationLevel,
        description: v.description,
        status: "PUBLISHED",
      },
    });

    const allSkills: Array<{ name: string; level: string; weight: number; isRequired: boolean }> = [
      ...v.requiredSkills.map((s) => ({ ...s, isRequired: true })),
      ...(v.preferredSkills ?? []).map((s) => ({ ...s, isRequired: false })),
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

    created.push({ id: vacancy.id, title: vacancy.title, skillsCount: allSkills.length });
    console.log(`  Created: ${v.title} (id: ${vacancy.id}, ${allSkills.length} skills)`);
  }

  console.log("\n--- Summary ---");
  console.log(`Company: ${company.name} (id: ${company.id})`);
  console.log(`Vacancies created: ${created.length}`);
  created.forEach((c) => console.log(`  - ${c.title} (${c.skillsCount} skills)`));
  console.log("\nConfirmation: All new vacancies are PUBLISHED and attached to the existing Degusto company_id:", company.id);

  const tagsByVacancy: Record<string, string[]> = {
    "Assistant Cook": ["kitchen", "cooking", "restaurant", "food preparation"],
    Cashier: ["cashier", "restaurant", "POS", "customer service"],
    "Waitress / Waiter": ["waiter", "waitress", "restaurant", "hospitality"],
    Dishwasher: ["dishwashing", "kitchen support", "cleaning"],
  };
  const softSkillsByVacancy: Record<string, string[]> = {
    "Assistant Cook": ["teamwork", "speed and efficiency", "attention to detail"],
    Cashier: ["communication", "accuracy", "friendliness"],
    "Waitress / Waiter": ["friendliness", "patience", "teamwork"],
    Dishwasher: ["discipline", "teamwork"],
  };

  console.log("\n--- Structured JSON (for reference) ---");
  const jsonPayload = {
    company_id: company.id,
    company_name: company.name,
    confirmation: "Vacancies attached to existing Degusto company_id",
    vacancies: VACANCIES.map((v) => ({
      normalizedTitle: v.normalizedTitle,
      targetRole: v.targetRole,
      title: v.title,
      seniorityLevel: v.requiredExperienceMonths >= 36 ? "Senior" : v.requiredExperienceMonths >= 12 ? "Mid" : "Entry",
      experienceMonths: v.requiredExperienceMonths,
      salaryMin: v.salaryMin,
      salaryMax: v.salaryMax,
      employmentType: v.workType,
      requiredSkills: v.requiredSkills.map((s) => s.name),
      softSkills: softSkillsByVacancy[v.title] ?? [],
      tags: tagsByVacancy[v.title] ?? [],
    })),
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
