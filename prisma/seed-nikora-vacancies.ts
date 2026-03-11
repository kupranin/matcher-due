/**
 * Add vacancies for existing company "Nikora".
 * Run: npx tsx prisma/seed-nikora-vacancies.ts
 *
 * IMPORTANT: Does NOT create a company. Finds Company where name = "Nikora" and attaches vacancies.
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient(
  process.env.DIRECT_URL ? { datasources: { db: { url: process.env.DIRECT_URL } } } : undefined
);

const NIKORA_NAME = "Nikora";
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
    normalizedTitle: "administrative_assistant",
    targetRole: "Administrative Assistant",
    title: "Administrative Assistant",
    salaryMin: 1200,
    salaryMax: 1600,
    workType: "Full-time",
    requiredExperienceMonths: 24,
    requiredEducationLevel: "Bachelor",
    description:
      "Assist management with scheduling and documentation; coordinate internal communication; prepare reports and office documentation; support operational administrative tasks. Georgian required, English basic.",
    requiredSkills: [
      { name: "MS Office", level: "Intermediate", weight: 5 },
      { name: "Document management", level: "Intermediate", weight: 4 },
      { name: "Communication", level: "Intermediate", weight: 5 },
      { name: "Organization", level: "Intermediate", weight: 5 },
      { name: "Attention to detail", level: "Intermediate", weight: 4 },
      { name: "Responsibility", level: "Intermediate", weight: 4 },
      { name: "Time management", level: "Intermediate", weight: 4 },
    ],
    preferredSkills: [
      { name: "Excel", level: "Intermediate", weight: 3 },
      { name: "Retail administration", level: "Beginner", weight: 2 },
    ],
  },
  {
    normalizedTitle: "cleaner",
    targetRole: "Cleaner",
    title: "Cleaner",
    salaryMin: 800,
    salaryMax: 1000,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description:
      "Maintain cleanliness of retail spaces; follow sanitation standards; support store hygiene procedures. No experience required.",
    requiredSkills: [
      { name: "Reliability", level: "Intermediate", weight: 5 },
      { name: "Attention to detail", level: "Intermediate", weight: 4 },
      { name: "Basic hygiene practices", level: "Beginner", weight: 4 },
      { name: "Punctuality", level: "Intermediate", weight: 4 },
      { name: "Discipline", level: "Intermediate", weight: 4 },
    ],
  },
  {
    normalizedTitle: "driver",
    targetRole: "Driver",
    title: "Driver",
    salaryMin: 1300,
    salaryMax: 1800,
    workType: "Full-time",
    requiredExperienceMonths: 12,
    requiredEducationLevel: "None",
    description:
      "Transport goods between warehouse and stores; ensure safe and timely deliveries; maintain vehicle condition. Valid driving license and 1+ year driving experience required.",
    requiredSkills: [
      { name: "Valid driving license", level: "Advanced", weight: 5 },
      { name: "Safe driving", level: "Intermediate", weight: 5 },
      { name: "Navigation", level: "Intermediate", weight: 4 },
      { name: "Responsibility", level: "Intermediate", weight: 4 },
      { name: "Reliability", level: "Intermediate", weight: 5 },
    ],
    preferredSkills: [
      { name: "Logistics experience", level: "Beginner", weight: 2 },
      { name: "Warehouse transport", level: "Beginner", weight: 2 },
    ],
  },
  {
    normalizedTitle: "pharmacist_assistant",
    targetRole: "Pharmacist Assistant",
    title: "Pharmacist Assistant",
    salaryMin: 1200,
    salaryMax: 1600,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "High School",
    description:
      "Support pharmacists with customer service, organization, and basic pharmacy tasks. Attention to detail and reliability required.",
    requiredSkills: [
      { name: "Attention to detail", level: "Intermediate", weight: 5 },
      { name: "Customer service", level: "Intermediate", weight: 5 },
      { name: "Communication", level: "Intermediate", weight: 4 },
      { name: "Organization", level: "Intermediate", weight: 4 },
      { name: "Reliability", level: "Intermediate", weight: 5 },
    ],
    preferredSkills: [
      { name: "Pharmacy basics", level: "Beginner", weight: 2 },
    ],
  },
  {
    normalizedTitle: "warehouse_worker",
    targetRole: "Warehouse Worker",
    title: "Warehouse Worker",
    salaryMin: 1000,
    salaryMax: 1400,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description:
      "Organize goods in warehouse; load and unload deliveries; maintain inventory order. No experience required.",
    requiredSkills: [
      { name: "Physical stamina", level: "Intermediate", weight: 5 },
      { name: "Teamwork", level: "Intermediate", weight: 5 },
      { name: "Reliability", level: "Intermediate", weight: 5 },
      { name: "Discipline", level: "Intermediate", weight: 4 },
      { name: "Responsibility", level: "Intermediate", weight: 4 },
    ],
    preferredSkills: [
      { name: "Forklift experience", level: "Beginner", weight: 2 },
      { name: "Warehouse systems", level: "Beginner", weight: 2 },
    ],
  },
  {
    normalizedTitle: "shop_administrator",
    targetRole: "Shop Administrator",
    title: "Shop Administrator",
    salaryMin: 1400,
    salaryMax: 2000,
    workType: "Full-time",
    requiredExperienceMonths: 12,
    requiredEducationLevel: "Bachelor",
    description:
      "Supervise store operations; coordinate store staff; manage daily sales reporting; ensure customer service quality. 1–3 years experience, Bachelor preferred.",
    requiredSkills: [
      { name: "Leadership", level: "Intermediate", weight: 5 },
      { name: "Retail operations", level: "Intermediate", weight: 5 },
      { name: "Reporting", level: "Intermediate", weight: 4 },
      { name: "Communication", level: "Intermediate", weight: 5 },
      { name: "Decision making", level: "Intermediate", weight: 4 },
      { name: "Organization", level: "Intermediate", weight: 5 },
    ],
    preferredSkills: [
      { name: "POS systems", level: "Intermediate", weight: 3 },
      { name: "Store management", level: "Beginner", weight: 2 },
    ],
  },
];

async function main() {
  console.log("Connecting to database...");
  await prisma.$connect();

  const company = await prisma.company.findFirst({
    where: { name: NIKORA_NAME },
    select: { id: true, name: true },
  });

  if (!company) {
    throw new Error(
      `Company "${NIKORA_NAME}" not found. Do NOT create a new company. Ensure the company exists in the database (e.g. create it via employer registration or another seed) and run this script again.`
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
  console.log("\nConfirmation: All new vacancies are PUBLISHED and attached to the existing Nikora company_id:", company.id);

  console.log("\n--- Structured JSON (for reference) ---");
  const tagsByVacancy: Record<string, string[]> = {
    "Administrative Assistant": ["administration", "office", "assistant", "documentation", "operations"],
    "Pharmacist Assistant": ["pharmacy", "retail", "healthcare", "support"],
    Cleaner: ["cleaning", "hygiene", "retail", "support"],
    Driver: ["driver", "logistics", "delivery", "transport"],
    "Warehouse Worker": ["warehouse", "logistics", "inventory", "operations"],
    "Shop Administrator": ["retail", "management", "supervisor", "store"],
  };
  const softSkillsByVacancy: Record<string, string[]> = {
    "Administrative Assistant": ["attention to detail", "responsibility", "time management"],
    "Pharmacist Assistant": ["attention to detail", "reliability", "communication"],
    Cleaner: ["punctuality", "discipline"],
    Driver: ["responsibility", "reliability"],
    "Warehouse Worker": ["discipline", "responsibility"],
    "Shop Administrator": ["communication", "decision making", "organization"],
  };
  const jsonPayload = {
    company_id: company.id,
    company_name: company.name,
    confirmation: "Vacancies attached to existing Nikora company_id",
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
