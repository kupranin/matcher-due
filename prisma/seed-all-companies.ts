/**
 * Seed vacancies for ALL companies in the database (Matcher.ge).
 * Company names must match exactly as in DB: Bazari Orbeliani, Nikora, Impex, DeGusto, Nail Bar,
 * kalata, Gulf, iTechnics, MiStore, Zoommer, Bolt, kursi.ge, Dazga, No Name, Navne, Gorgia, Dunkin Donuts.
 *
 * Run: npx tsx prisma/seed-all-companies.ts
 *
 * - Does NOT create companies. Finds each company by name (case-insensitive / flexible match).
 * - Vacancies: PUBLISHED, Tbilisi, Full-time. Companies with no vacancy definitions are skipped.
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient(
  process.env.DIRECT_URL ? { datasources: { db: { url: process.env.DIRECT_URL } } } : undefined
);

const TBILISI_ID = "tbilisi";

type VacancyInput = {
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

function companyMatches(name: string, matchList: string[]): boolean {
  const lower = name.toLowerCase().trim();
  return matchList.some((m) => lower === m || lower.includes(m));
}

// ——— Companies with no vacancy definitions (placeholder; will skip) ———
const EMPTY_VACANCIES: VacancyInput[] = [];

// ——— Bazari Orbeliani, Impex: no definitions yet ———

// ——— Nikora (retail / pharmacy) ———
const NIKORA_VACANCIES: VacancyInput[] = [
  {
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
    preferredSkills: [{ name: "Pharmacy basics", level: "Beginner", weight: 2 }],
  },
  {
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

// ——— DeGusto (restaurant) ———
const DEGUSTO_VACANCIES: VacancyInput[] = [
  {
    title: "Assistant Cook",
    salaryMin: 1200,
    salaryMax: 1600,
    workType: "Full-time",
    requiredExperienceMonths: 12,
    requiredEducationLevel: "High School",
    description:
      "Assist chefs in food preparation; prepare ingredients and basic dishes; maintain kitchen cleanliness and organization; support kitchen operations during busy hours. 0–1 year preferred.",
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
    preferredSkills: [{ name: "Restaurant cashier experience", level: "Beginner", weight: 2 }],
  },
  {
    title: "Waitress / Waiter",
    salaryMin: 1000,
    salaryMax: 1400,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description:
      "Greet and serve customers; take food and beverage orders; deliver meals to tables; maintain cleanliness of dining area; provide friendly service. Salary + tips. No experience required.",
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

// ——— Nail Bar (beauty salon) ———
const NAIL_BAR_VACANCIES: VacancyInput[] = [
  {
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
  },
];

// ——— Kalata (retail) ———
const KALATA_VACANCIES: VacancyInput[] = [
  {
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

// ——— Gulf (fuel / gas stations) ———
const GULF_VACANCIES: VacancyInput[] = [
  {
    title: "Cashier",
    salaryMin: 1000,
    salaryMax: 1300,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description: "Process payments; operate POS system; assist customers.",
    requiredSkills: [
      { name: "POS system", level: "Intermediate", weight: 5 },
      { name: "Customer service", level: "Intermediate", weight: 5 },
      { name: "Basic math", level: "Intermediate", weight: 5 },
      { name: "Communication", level: "Intermediate", weight: 4 },
      { name: "Responsibility", level: "Intermediate", weight: 4 },
    ],
  },
  {
    title: "Fuel Refiller",
    salaryMin: 900,
    salaryMax: 1200,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description: "Refuel vehicles; assist customers at pumps; maintain safety standards.",
    requiredSkills: [
      { name: "Safety awareness", level: "Intermediate", weight: 5 },
      { name: "Physical stamina", level: "Intermediate", weight: 5 },
      { name: "Discipline", level: "Intermediate", weight: 4 },
      { name: "Attentiveness", level: "Intermediate", weight: 4 },
    ],
  },
];

// ——— iTechnics (electronics retail) ———
const ITECHNICS_VACANCIES: VacancyInput[] = [
  {
    title: "Sales Consultant",
    salaryMin: 1200,
    salaryMax: 1800,
    workType: "Full-time",
    requiredExperienceMonths: 12,
    requiredEducationLevel: "High School",
    description: "Sell electronics; consult customers; demonstrate products.",
    requiredSkills: [
      { name: "Sales", level: "Intermediate", weight: 5 },
      { name: "Product presentation", level: "Intermediate", weight: 5 },
      { name: "Electronics knowledge", level: "Intermediate", weight: 5 },
      { name: "Communication", level: "Intermediate", weight: 5 },
      { name: "Persuasion", level: "Intermediate", weight: 4 },
    ],
  },
  {
    title: "Cashier",
    salaryMin: 1000,
    salaryMax: 1300,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description: "Process payments; issue receipts; manage cash register.",
    requiredSkills: [
      { name: "POS system", level: "Intermediate", weight: 5 },
      { name: "Customer service", level: "Intermediate", weight: 5 },
      { name: "Accuracy", level: "Intermediate", weight: 5 },
      { name: "Responsibility", level: "Intermediate", weight: 4 },
    ],
  },
];

// ——— MiStore (electronics – Xiaomi) ———
const MISTORE_VACANCIES: VacancyInput[] = [
  {
    title: "Sales Manager",
    salaryMin: 1800,
    salaryMax: 2500,
    workType: "Full-time",
    requiredExperienceMonths: 24,
    requiredEducationLevel: "Bachelor",
    description: "Manage sales team and targets; drive retail performance; analyze sales data.",
    requiredSkills: [
      { name: "Sales management", level: "Advanced", weight: 5 },
      { name: "Retail analytics", level: "Intermediate", weight: 5 },
      { name: "Leadership", level: "Intermediate", weight: 5 },
      { name: "Communication", level: "Intermediate", weight: 4 },
    ],
  },
  {
    title: "Store Manager",
    salaryMin: 2000,
    salaryMax: 2800,
    workType: "Full-time",
    requiredExperienceMonths: 36,
    requiredEducationLevel: "Bachelor",
    description: "Oversee store operations; manage staff; ensure targets and customer service.",
    requiredSkills: [
      { name: "Retail management", level: "Advanced", weight: 5 },
      { name: "Operations management", level: "Advanced", weight: 5 },
      { name: "Staff supervision", level: "Intermediate", weight: 5 },
      { name: "Leadership", level: "Intermediate", weight: 5 },
    ],
  },
  {
    title: "Cleaner",
    salaryMin: 800,
    salaryMax: 1000,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description: "Maintain store cleanliness; hygiene standards; basic cleaning tasks.",
    requiredSkills: [
      { name: "Cleaning", level: "Intermediate", weight: 5 },
      { name: "Hygiene maintenance", level: "Intermediate", weight: 5 },
      { name: "Reliability", level: "Intermediate", weight: 4 },
    ],
  },
];

// ——— Zoommer (electronics retail) ———
const ZOOMMER_VACANCIES: VacancyInput[] = [
  {
    title: "Administrative Assistant",
    salaryMin: 1200,
    salaryMax: 1600,
    workType: "Full-time",
    requiredExperienceMonths: 12,
    requiredEducationLevel: "High School",
    description: "Administrative support; documentation; scheduling; office coordination.",
    requiredSkills: [
      { name: "MS Office", level: "Intermediate", weight: 5 },
      { name: "Documentation management", level: "Intermediate", weight: 5 },
      { name: "Communication", level: "Intermediate", weight: 5 },
      { name: "Organization", level: "Intermediate", weight: 4 },
    ],
  },
  {
    title: "Store Manager",
    salaryMin: 2000,
    salaryMax: 2800,
    workType: "Full-time",
    requiredExperienceMonths: 36,
    requiredEducationLevel: "Bachelor",
    description: "Manage store operations; lead team; reporting and sales targets.",
    requiredSkills: [
      { name: "Retail operations", level: "Advanced", weight: 5 },
      { name: "Leadership", level: "Intermediate", weight: 5 },
      { name: "Reporting", level: "Intermediate", weight: 5 },
      { name: "Team coordination", level: "Intermediate", weight: 5 },
    ],
  },
  {
    title: "Cashier",
    salaryMin: 1000,
    salaryMax: 1300,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description: "Process payments; operate POS; issue receipts; customer service.",
    requiredSkills: [
      { name: "POS systems", level: "Intermediate", weight: 5 },
      { name: "Customer service", level: "Intermediate", weight: 5 },
      { name: "Basic math", level: "Intermediate", weight: 4 },
    ],
  },
  {
    title: "Sales Consultant",
    salaryMin: 1200,
    salaryMax: 1800,
    workType: "Full-time",
    requiredExperienceMonths: 12,
    requiredEducationLevel: "High School",
    description: "Sell electronics; consult customers; demonstrate products.",
    requiredSkills: [
      { name: "Sales", level: "Intermediate", weight: 5 },
      { name: "Product presentation", level: "Intermediate", weight: 5 },
      { name: "Electronics knowledge", level: "Intermediate", weight: 5 },
      { name: "Customer service", level: "Intermediate", weight: 5 },
    ],
  },
];

// ——— Bolt (mobility / tech) ———
const BOLT_VACANCIES: VacancyInput[] = [
  {
    title: "Support Operator",
    salaryMin: 1500,
    salaryMax: 2000,
    workType: "Full-time",
    requiredExperienceMonths: 12,
    requiredEducationLevel: "High School",
    description:
      "Assist customers via chat/email; resolve service issues; provide information about rides or deliveries.",
    requiredSkills: [
      { name: "Customer support", level: "Intermediate", weight: 5 },
      { name: "Problem solving", level: "Intermediate", weight: 5 },
      { name: "Communication", level: "Intermediate", weight: 5 },
      { name: "Patience", level: "Intermediate", weight: 4 },
      { name: "Empathy", level: "Intermediate", weight: 4 },
    ],
  },
];

// ——— Kursi.ge (fintech) ———
const KURSIGE_VACANCIES: VacancyInput[] = [
  {
    title: "Support Operator",
    salaryMin: 1500,
    salaryMax: 2000,
    workType: "Full-time",
    requiredExperienceMonths: 12,
    requiredEducationLevel: "High School",
    description: "Customer support; assist users with fintech platform; resolve queries.",
    requiredSkills: [
      { name: "Customer support", level: "Intermediate", weight: 5 },
      { name: "Fintech platform usage", level: "Intermediate", weight: 5 },
      { name: "Communication", level: "Intermediate", weight: 5 },
    ],
  },
  {
    title: "Transactions Operator",
    salaryMin: 1700,
    salaryMax: 2300,
    workType: "Full-time",
    requiredExperienceMonths: 24,
    requiredEducationLevel: "Bachelor",
    description: "Process financial transactions; ensure accuracy; banking operations.",
    requiredSkills: [
      { name: "Financial transactions", level: "Advanced", weight: 5 },
      { name: "Accuracy", level: "Intermediate", weight: 5 },
      { name: "Banking operations", level: "Intermediate", weight: 5 },
      { name: "Attention to detail", level: "Intermediate", weight: 5 },
    ],
  },
  {
    title: "Administrative Assistant",
    salaryMin: 1300,
    salaryMax: 1700,
    workType: "Full-time",
    requiredExperienceMonths: 12,
    requiredEducationLevel: "High School",
    description: "Office administration; documentation; organization.",
    requiredSkills: [
      { name: "MS Office", level: "Intermediate", weight: 5 },
      { name: "Organization", level: "Intermediate", weight: 5 },
      { name: "Documentation", level: "Intermediate", weight: 5 },
    ],
  },
];

// ——— Dazga (furniture / interior) ———
const DAZGA_VACANCIES: VacancyInput[] = [
  {
    title: "Sales Manager",
    salaryMin: 1800,
    salaryMax: 2400,
    workType: "Full-time",
    requiredExperienceMonths: 24,
    requiredEducationLevel: "Bachelor",
    description: "Manage sales; negotiate with clients; CRM and pipeline.",
    requiredSkills: [
      { name: "Sales management", level: "Advanced", weight: 5 },
      { name: "Negotiation", level: "Intermediate", weight: 5 },
      { name: "CRM", level: "Intermediate", weight: 5 },
      { name: "Communication", level: "Intermediate", weight: 4 },
    ],
  },
  {
    title: "Warehouse Worker",
    salaryMin: 1000,
    salaryMax: 1300,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description: "Inventory management; receive and ship goods; warehouse operations.",
    requiredSkills: [
      { name: "Inventory management", level: "Intermediate", weight: 5 },
      { name: "Logistics basics", level: "Intermediate", weight: 5 },
      { name: "Physical stamina", level: "Intermediate", weight: 4 },
    ],
  },
];

// ——— No Name (retail fashion) ———
const NO_NAME_VACANCIES: VacancyInput[] = [
  {
    title: "Sales Consultant",
    salaryMin: 1100,
    salaryMax: 1600,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description: "Retail sales; customer service; product presentation.",
    requiredSkills: [
      { name: "Retail sales", level: "Intermediate", weight: 5 },
      { name: "Customer service", level: "Intermediate", weight: 5 },
      { name: "Communication", level: "Intermediate", weight: 4 },
    ],
  },
  {
    title: "Cashier",
    salaryMin: 1000,
    salaryMax: 1300,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description: "Process payments; operate POS; basic accounting support.",
    requiredSkills: [
      { name: "POS systems", level: "Intermediate", weight: 5 },
      { name: "Basic accounting", level: "Intermediate", weight: 4 },
      { name: "Customer service", level: "Intermediate", weight: 5 },
    ],
  },
];

// ——— Navne (retail) ———
const NAVNE_VACANCIES: VacancyInput[] = [
  {
    title: "Sales Consultant",
    salaryMin: 1100,
    salaryMax: 1600,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description: "Retail sales; product presentation; customer service.",
    requiredSkills: [
      { name: "Retail sales", level: "Intermediate", weight: 5 },
      { name: "Product presentation", level: "Intermediate", weight: 5 },
      { name: "Customer service", level: "Intermediate", weight: 5 },
    ],
  },
  {
    title: "Cashier",
    salaryMin: 1000,
    salaryMax: 1300,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description: "Process payments; operate POS; issue receipts.",
    requiredSkills: [
      { name: "POS system", level: "Intermediate", weight: 5 },
      { name: "Payments", level: "Intermediate", weight: 5 },
      { name: "Customer service", level: "Intermediate", weight: 4 },
    ],
  },
  {
    title: "Assistant to Store Manager",
    salaryMin: 1400,
    salaryMax: 1800,
    workType: "Full-time",
    requiredExperienceMonths: 12,
    requiredEducationLevel: "High School",
    description: "Support store manager; retail operations; coordination.",
    requiredSkills: [
      { name: "Retail operations", level: "Intermediate", weight: 5 },
      { name: "Coordination", level: "Intermediate", weight: 5 },
      { name: "Organization", level: "Intermediate", weight: 4 },
    ],
  },
  {
    title: "Videomonitoring Operator",
    salaryMin: 1200,
    salaryMax: 1600,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description: "Monitor CCTV; ensure store security; report incidents.",
    requiredSkills: [
      { name: "CCTV monitoring", level: "Intermediate", weight: 5 },
      { name: "Attention to detail", level: "Intermediate", weight: 5 },
      { name: "Reliability", level: "Intermediate", weight: 4 },
    ],
  },
  {
    title: "Store Manager",
    salaryMin: 2000,
    salaryMax: 2700,
    workType: "Full-time",
    requiredExperienceMonths: 36,
    requiredEducationLevel: "Bachelor",
    description: "Manage store; lead team; operations and sales targets.",
    requiredSkills: [
      { name: "Store management", level: "Advanced", weight: 5 },
      { name: "Team leadership", level: "Intermediate", weight: 5 },
      { name: "Retail operations", level: "Intermediate", weight: 5 },
    ],
  },
];

// ——— Gorgia (home improvement / construction materials / appliances) ———
const GORGIA_VACANCIES: VacancyInput[] = [
  {
    title: "Merchandiser",
    salaryMin: 1200,
    salaryMax: 1600,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "High School",
    description:
      "Organize product displays; ensure correct product placement; monitor shelf stock; coordinate with sales team.",
    requiredSkills: [
      { name: "Merchandising", level: "Intermediate", weight: 5 },
      { name: "Product organization", level: "Intermediate", weight: 5 },
      { name: "Retail operations", level: "Intermediate", weight: 4 },
      { name: "Attention to detail", level: "Intermediate", weight: 5 },
      { name: "Organization", level: "Intermediate", weight: 5 },
    ],
  },
  {
    title: "Brand Manager",
    salaryMin: 2200,
    salaryMax: 3000,
    workType: "Full-time",
    requiredExperienceMonths: 36,
    requiredEducationLevel: "Bachelor",
    description:
      "Manage product brands in store; coordinate marketing campaigns; analyze sales performance; cooperate with suppliers.",
    requiredSkills: [
      { name: "Brand management", level: "Advanced", weight: 5 },
      { name: "Marketing", level: "Intermediate", weight: 5 },
      { name: "Retail analytics", level: "Intermediate", weight: 5 },
      { name: "Leadership", level: "Intermediate", weight: 5 },
      { name: "Strategic thinking", level: "Intermediate", weight: 4 },
    ],
  },
  {
    title: "Sales Consultant",
    salaryMin: 1200,
    salaryMax: 1800,
    workType: "Full-time",
    requiredExperienceMonths: 12,
    requiredEducationLevel: "High School",
    description:
      "Consult customers on products; assist with appliance and construction product selection; demonstrate product features.",
    requiredSkills: [
      { name: "Sales", level: "Intermediate", weight: 5 },
      { name: "Product knowledge", level: "Intermediate", weight: 5 },
      { name: "Customer service", level: "Intermediate", weight: 5 },
      { name: "Persuasion", level: "Intermediate", weight: 4 },
      { name: "Communication", level: "Intermediate", weight: 5 },
    ],
  },
  {
    title: "Promoter",
    salaryMin: 1000,
    salaryMax: 1400,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description:
      "Promote specific brands; demonstrate products to customers; assist marketing campaigns in store.",
    requiredSkills: [
      { name: "Product presentation", level: "Intermediate", weight: 5 },
      { name: "Sales basics", level: "Intermediate", weight: 4 },
      { name: "Communication", level: "Intermediate", weight: 5 },
      { name: "Friendliness", level: "Intermediate", weight: 4 },
    ],
  },
  {
    title: "Service Worker",
    salaryMin: 1000,
    salaryMax: 1400,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description:
      "Assist customers with loading products; maintain store order; support store operations.",
    requiredSkills: [
      { name: "Physical stamina", level: "Intermediate", weight: 5 },
      { name: "Teamwork", level: "Intermediate", weight: 5 },
      { name: "Reliability", level: "Intermediate", weight: 5 },
      { name: "Helpfulness", level: "Intermediate", weight: 4 },
    ],
  },
  {
    title: "Warehouse Worker",
    salaryMin: 1100,
    salaryMax: 1500,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description:
      "Organize inventory; load and unload products; prepare goods for store floor.",
    requiredSkills: [
      { name: "Warehouse operations", level: "Intermediate", weight: 5 },
      { name: "Logistics basics", level: "Intermediate", weight: 4 },
      { name: "Responsibility", level: "Intermediate", weight: 5 },
      { name: "Discipline", level: "Intermediate", weight: 4 },
    ],
  },
  {
    title: "Cashier",
    salaryMin: 1000,
    salaryMax: 1300,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description: "Process payments; operate POS system; issue receipts.",
    requiredSkills: [
      { name: "POS system", level: "Intermediate", weight: 5 },
      { name: "Basic math", level: "Intermediate", weight: 5 },
      { name: "Customer service", level: "Intermediate", weight: 5 },
      { name: "Accuracy", level: "Intermediate", weight: 5 },
      { name: "Responsibility", level: "Intermediate", weight: 4 },
    ],
  },
  {
    title: "Store Administrator",
    salaryMin: 1600,
    salaryMax: 2200,
    workType: "Full-time",
    requiredExperienceMonths: 24,
    requiredEducationLevel: "Bachelor",
    description:
      "Supervise store operations; coordinate employees; monitor inventory and sales.",
    requiredSkills: [
      { name: "Retail operations", level: "Intermediate", weight: 5 },
      { name: "Reporting", level: "Intermediate", weight: 5 },
      { name: "Team coordination", level: "Intermediate", weight: 5 },
      { name: "Leadership", level: "Intermediate", weight: 5 },
      { name: "Organization", level: "Intermediate", weight: 5 },
    ],
  },
];

// ——— Dunkin Donuts (coffee shop / quick service restaurant) ———
const DUNKIN_DONUTS_VACANCIES: VacancyInput[] = [
  {
    title: "Barista",
    salaryMin: 1100,
    salaryMax: 1500,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description:
      "Prepare coffee and beverages; operate coffee machines; serve customers; maintain cleanliness of bar area; assist with food preparation. Training provided.",
    requiredSkills: [
      { name: "Coffee preparation basics", level: "Intermediate", weight: 5 },
      { name: "Customer service", level: "Intermediate", weight: 5 },
      { name: "Multitasking", level: "Intermediate", weight: 5 },
      { name: "Friendliness", level: "Intermediate", weight: 4 },
      { name: "Communication", level: "Intermediate", weight: 5 },
      { name: "Speed and efficiency", level: "Intermediate", weight: 4 },
    ],
    preferredSkills: [
      { name: "Barista experience", level: "Beginner", weight: 3 },
      { name: "Coffee machine operation", level: "Beginner", weight: 3 },
    ],
  },
  {
    title: "Cashier",
    salaryMin: 1000,
    salaryMax: 1300,
    workType: "Full-time",
    requiredExperienceMonths: 12,
    requiredEducationLevel: "None",
    description:
      "Process customer payments; operate POS system; take customer orders; assist with packaging orders. 0–1 year preferred.",
    requiredSkills: [
      { name: "POS system operation", level: "Intermediate", weight: 5 },
      { name: "Basic math", level: "Intermediate", weight: 5 },
      { name: "Customer service", level: "Intermediate", weight: 5 },
      { name: "Communication", level: "Intermediate", weight: 5 },
      { name: "Accuracy", level: "Intermediate", weight: 5 },
      { name: "Responsibility", level: "Intermediate", weight: 4 },
    ],
  },
  {
    title: "Cleaner",
    salaryMin: 800,
    salaryMax: 1000,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description:
      "Maintain cleanliness of restaurant and seating areas; clean kitchen and service spaces; ensure hygiene standards.",
    requiredSkills: [
      { name: "Cleaning", level: "Intermediate", weight: 5 },
      { name: "Hygiene awareness", level: "Intermediate", weight: 5 },
      { name: "Discipline", level: "Intermediate", weight: 4 },
      { name: "Reliability", level: "Intermediate", weight: 5 },
    ],
  },
];

/**
 * All companies (order matches typical DB listing).
 * nameMatch: patterns to find company by name (case-insensitive).
 * vacancies: EMPTY_VACANCIES = no definitions yet (script will skip seeding for that company).
 */
const ALL_COMPANIES_CONFIG: Array<{ nameMatch: string[]; label: string; vacancies: VacancyInput[] }> = [
  { nameMatch: ["bazari orbeliani", "bazari"], label: "Bazari Orbeliani", vacancies: EMPTY_VACANCIES },
  { nameMatch: ["nikora"], label: "Nikora", vacancies: NIKORA_VACANCIES },
  { nameMatch: ["impex"], label: "Impex", vacancies: EMPTY_VACANCIES },
  { nameMatch: ["degusto", "de gusto"], label: "DeGusto", vacancies: DEGUSTO_VACANCIES },
  { nameMatch: ["nail bar", "saloon nail bar"], label: "Nail Bar", vacancies: NAIL_BAR_VACANCIES },
  { nameMatch: ["kalata"], label: "kalata", vacancies: KALATA_VACANCIES },
  { nameMatch: ["gulf"], label: "Gulf", vacancies: GULF_VACANCIES },
  { nameMatch: ["itechnics", "i technics"], label: "iTechnics", vacancies: ITECHNICS_VACANCIES },
  { nameMatch: ["mistore", "mi store"], label: "MiStore", vacancies: MISTORE_VACANCIES },
  { nameMatch: ["zoommer"], label: "Zoommer", vacancies: ZOOMMER_VACANCIES },
  { nameMatch: ["bolt"], label: "Bolt", vacancies: BOLT_VACANCIES },
  { nameMatch: ["kursi.ge", "kursi"], label: "kursi.ge", vacancies: KURSIGE_VACANCIES },
  { nameMatch: ["dazga"], label: "Dazga", vacancies: DAZGA_VACANCIES },
  { nameMatch: ["no name", "noname", "no-name"], label: "No Name", vacancies: NO_NAME_VACANCIES },
  { nameMatch: ["navne"], label: "Navne", vacancies: NAVNE_VACANCIES },
  { nameMatch: ["gorgia"], label: "Gorgia", vacancies: GORGIA_VACANCIES },
  { nameMatch: ["dunkin donuts", "dunkin", "dd"], label: "Dunkin Donuts", vacancies: DUNKIN_DONUTS_VACANCIES },
];

async function seedVacanciesForCompany(
  company: { id: string; name: string },
  vacancies: VacancyInput[]
): Promise<number> {
  let created = 0;
  for (const v of vacancies) {
    const existing = await prisma.vacancy.findFirst({
      where: { companyId: company.id, title: v.title },
      select: { id: true },
    });

    if (existing) {
      await prisma.vacancy.update({
        where: { id: existing.id },
        data: { salaryMin: v.salaryMin, salaryMax: v.salaryMax },
      });
      console.log(`    Updated: ${v.title} → ${v.salaryMin}–${v.salaryMax} GEL`);
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

    created++;
    console.log(`    Created: ${v.title} (${allSkills.length} skills)`);
  }
  return created;
}

async function main() {
  console.log("Connecting to database...\n");
  await prisma.$connect();

  const allCompanies = await prisma.company.findMany({ select: { id: true, name: true } });

  console.log(`Companies in DB: ${allCompanies.length}`);
  console.log(`Seed config: ${ALL_COMPANIES_CONFIG.length} company definitions\n`);

  let totalCreated = 0;
  const processed: string[] = [];
  const notFound: string[] = [];
  const noDefinitions: string[] = [];

  for (const config of ALL_COMPANIES_CONFIG) {
    const company = allCompanies.find((c) => companyMatches(c.name, config.nameMatch));
    if (!company) {
      notFound.push(config.label);
      continue;
    }

    if (config.vacancies.length === 0) {
      noDefinitions.push(company.name);
      console.log(`  ${company.name} (id: ${company.id}): no vacancy definitions, skipping`);
      console.log("");
      continue;
    }

    console.log(`  ${company.name} (id: ${company.id}):`);
    const created = await seedVacanciesForCompany(company, config.vacancies);
    totalCreated += created;
    processed.push(company.name);
    if (created === 0 && config.vacancies.length > 0) {
      console.log(`    (all ${config.vacancies.length} vacancies already existed, salaries updated if needed)`);
    }
    console.log("");
  }

  console.log("--- Done ---");
  console.log(`Vacancies created this run: ${totalCreated}`);
  console.log(`Companies seeded: ${processed.join(", ") || "(none)"}`);
  if (noDefinitions.length) {
    console.log(`Companies with no vacancy definitions (skipped): ${noDefinitions.join(", ")}`);
  }
  if (notFound.length) {
    console.log(`Companies in config but not found in DB: ${notFound.join(", ")}`);
  }
  console.log("All seeded vacancies are PUBLISHED, Tbilisi, Full-time.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
