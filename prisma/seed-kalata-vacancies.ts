/**
 * Add vacancies for existing company "Kalata".
 * Run: npx tsx prisma/seed-kalata-vacancies.ts
 *
 * IMPORTANT: Does NOT create a company. Finds Company where name = "Kalata" and attaches vacancies.
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient(
  process.env.DIRECT_URL ? { datasources: { db: { url: process.env.DIRECT_URL } } } : undefined
);

const COMPANY_NAME = "Kalata";
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
    normalizedTitle: "cashier",
    targetRole: "Cashier",
    title: "Cashier",
    salaryMin: 1000,
    salaryMax: 1300,
    workType: "Full-time",
    requiredExperienceMonths: 12,
    requiredEducationLevel: "None",
    description:
      "Process customer payments; operate POS system; issue receipts and invoices; assist customers with purchases; maintain accuracy of cash register. 0–1 year preferred.",
    requiredSkills: [
      { name: "Basic math", level: "Intermediate", weight: 5 },
      { name: "POS system operation", level: "Intermediate", weight: 5 },
      { name: "Customer service", level: "Intermediate", weight: 5 },
      { name: "Attention to detail", level: "Intermediate", weight: 5 },
      { name: "Communication", level: "Intermediate", weight: 4 },
      { name: "Friendliness", level: "Intermediate", weight: 4 },
      { name: "Responsibility", level: "Intermediate", weight: 4 },
    ],
    preferredSkills: [
      { name: "Retail cashier experience", level: "Beginner", weight: 3 },
      { name: "Basic inventory awareness", level: "Beginner", weight: 2 },
    ],
  },
  {
    normalizedTitle: "store_administrator",
    targetRole: "Store Administrator",
    title: "Store Administrator",
    salaryMin: 1400,
    salaryMax: 1900,
    workType: "Full-time",
    requiredExperienceMonths: 24,
    requiredEducationLevel: "Bachelor",
    description:
      "Supervise store operations; coordinate store employees; monitor sales and inventory; prepare daily reports; ensure high customer service standards. 1–3 years preferred, Bachelor preferred.",
    requiredSkills: [
      { name: "Retail operations", level: "Intermediate", weight: 5 },
      { name: "Leadership", level: "Intermediate", weight: 5 },
      { name: "Reporting", level: "Intermediate", weight: 5 },
      { name: "Inventory management", level: "Intermediate", weight: 5 },
      { name: "Organization", level: "Intermediate", weight: 4 },
      { name: "Communication", level: "Intermediate", weight: 5 },
      { name: "Decision making", level: "Intermediate", weight: 4 },
    ],
    preferredSkills: [
      { name: "POS systems", level: "Intermediate", weight: 3 },
      { name: "Store management experience", level: "Beginner", weight: 3 },
    ],
  },
  {
    normalizedTitle: "warehouse_worker",
    targetRole: "Warehouse Worker",
    title: "Warehouse Worker",
    salaryMin: 900,
    salaryMax: 1200,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description:
      "Receive and sort goods; organize inventory in warehouse; prepare products for store delivery; maintain warehouse cleanliness. No experience required.",
    requiredSkills: [
      { name: "Physical stamina", level: "Intermediate", weight: 5 },
      { name: "Teamwork", level: "Intermediate", weight: 5 },
      { name: "Reliability", level: "Intermediate", weight: 5 },
      { name: "Responsibility", level: "Intermediate", weight: 4 },
      { name: "Discipline", level: "Intermediate", weight: 4 },
      { name: "Attention to detail", level: "Intermediate", weight: 4 },
    ],
    preferredSkills: [
      { name: "Warehouse experience", level: "Beginner", weight: 2 },
      { name: "Logistics basics", level: "Beginner", weight: 2 },
    ],
  },
];

async function main() {
  console.log("Connecting to database...");
  await prisma.$connect();

  let company = await prisma.company.findFirst({
    where: { name: { equals: COMPANY_NAME, mode: "insensitive" } },
    select: { id: true, name: true },
  });

  if (!company) {
    const all = await prisma.company.findMany({ select: { id: true, name: true } });
    company = all.find((c) => c.name.toLowerCase().includes("kalata")) ?? null;
  }

  if (!company) {
    throw new Error(
      `Company "${COMPANY_NAME}" not found. Create the company first (e.g. via employer registration), then run this script again.`
    );
  }

  console.log(`Found company: ${company.name} (id: ${company.id})\n`);

  const created: Array<{ id: string; title: string; skillsCount: number }> = [];

  for (const v of VACANCIES) {
    const existing = await prisma.vacancy.findFirst({
      where: { companyId: company!.id, title: v.title },
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
        companyId: company!.id,
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
  console.log("\nConfirmation: All new vacancies are PUBLISHED and attached to the existing Kalata company_id:", company.id);

  const tagsByVacancy: Record<string, string[]> = {
    Cashier: ["cashier", "retail", "POS", "customer service"],
    "Store Administrator": ["retail", "store management", "supervisor", "operations"],
    "Warehouse Worker": ["warehouse", "logistics", "inventory", "operations"],
  };
  const softSkillsByVacancy: Record<string, string[]> = {
    Cashier: ["communication", "friendliness", "responsibility"],
    "Store Administrator": ["organization", "communication", "decision making"],
    "Warehouse Worker": ["responsibility", "discipline", "attention to detail"],
  };

  console.log("\n--- Structured JSON (for reference) ---");
  const jsonPayload = {
    company_id: company.id,
    company_name: company.name,
    confirmation: "Vacancies attached to existing Kalata company_id",
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
  .finally(() => prisma.$disconnect());
