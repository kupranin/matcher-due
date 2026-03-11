/**
 * Seed additional companies and vacancies.
 *
 * EXISTING (find by name, add vacancies only):
 * - 7) Madart, 8) Zedazeni, 9) Shuaguli
 * - 10) Hotel Marriott, 11) Hotel Kopala, 12) AppleDent
 *
 * NEW (create company + user if not exist, then add vacancies):
 * - 13) Cafe Stamba, 14) Cafe Entrée, 15) Restaurant Machakhela, 16) Cafe Prospero's Books, 17) Restaurant Lolita
 *
 * Run: npx tsx prisma/seed-additional-companies.ts
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth";

const prisma = new PrismaClient(
  process.env.DIRECT_URL ? { datasources: { db: { url: process.env.DIRECT_URL } } } : undefined
);

const TBILISI_ID = "tbilisi";
const DEFAULT_PASSWORD = "12345678";

type VacancyDef = {
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

// ——— 10) Hotel Marriott ———
const MARRIOTT_VACANCIES: VacancyDef[] = [
  {
    title: "Receptionist",
    salaryMin: 1300,
    salaryMax: 1800,
    workType: "Full-time",
    requiredExperienceMonths: 12,
    requiredEducationLevel: "High School",
    description: "Guest check-in/out; hotel booking systems; customer service; communication.",
    requiredSkills: [
      { name: "Hotel booking systems", level: "Intermediate", weight: 5 },
      { name: "Customer service", level: "Intermediate", weight: 5 },
      { name: "Communication", level: "Intermediate", weight: 5 },
      { name: "Politeness", level: "Intermediate", weight: 4 },
      { name: "Organization", level: "Intermediate", weight: 4 },
    ],
  },
  {
    title: "Cleaner",
    salaryMin: 900,
    salaryMax: 1100,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description: "Maintain cleanliness; follow hygiene and cleaning standards.",
    requiredSkills: [
      { name: "Hygiene maintenance", level: "Intermediate", weight: 5 },
      { name: "Cleaning standards", level: "Intermediate", weight: 5 },
      { name: "Reliability", level: "Intermediate", weight: 5 },
      { name: "Discipline", level: "Intermediate", weight: 4 },
    ],
  },
  {
    title: "Bell Boy",
    salaryMin: 1000,
    salaryMax: 1300,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description: "Guest assistance; luggage handling; escort guests.",
    requiredSkills: [
      { name: "Guest assistance", level: "Intermediate", weight: 5 },
      { name: "Luggage handling", level: "Intermediate", weight: 5 },
      { name: "Friendliness", level: "Intermediate", weight: 5 },
      { name: "Helpfulness", level: "Intermediate", weight: 4 },
    ],
  },
];

// ——— 11) Hotel Kopala ———
const KOPALA_VACANCIES: VacancyDef[] = [
  {
    title: "Receptionist",
    salaryMin: 1300,
    salaryMax: 1800,
    workType: "Full-time",
    requiredExperienceMonths: 12,
    requiredEducationLevel: "High School",
    description: "Guest check-in/out; booking systems; customer service; communication.",
    requiredSkills: [
      { name: "Booking systems", level: "Intermediate", weight: 5 },
      { name: "Customer service", level: "Intermediate", weight: 5 },
      { name: "Communication", level: "Intermediate", weight: 5 },
    ],
  },
  {
    title: "Waiter",
    salaryMin: 1100,
    salaryMax: 1500,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description: "Restaurant service; take orders; serve guests. Salary + tips.",
    requiredSkills: [
      { name: "Restaurant service", level: "Intermediate", weight: 5 },
      { name: "Order taking", level: "Intermediate", weight: 5 },
      { name: "Customer service", level: "Intermediate", weight: 5 },
    ],
  },
  {
    title: "Housekeeping Staff",
    salaryMin: 900,
    salaryMax: 1100,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description: "Room cleaning; hotel hygiene standards; linen and supplies.",
    requiredSkills: [
      { name: "Room cleaning", level: "Intermediate", weight: 5 },
      { name: "Hotel hygiene standards", level: "Intermediate", weight: 5 },
      { name: "Attention to detail", level: "Intermediate", weight: 4 },
    ],
  },
  {
    title: "Kitchen Assistant",
    salaryMin: 1000,
    salaryMax: 1400,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description: "Food preparation support; kitchen hygiene; assist chefs.",
    requiredSkills: [
      { name: "Food preparation", level: "Intermediate", weight: 5 },
      { name: "Kitchen hygiene", level: "Intermediate", weight: 5 },
      { name: "Teamwork", level: "Intermediate", weight: 4 },
    ],
  },
  {
    title: "Security Guard",
    salaryMin: 1100,
    salaryMax: 1500,
    workType: "Full-time",
    requiredExperienceMonths: 12,
    requiredEducationLevel: "None",
    description: "Security monitoring; incident response; guest and property safety.",
    requiredSkills: [
      { name: "Security monitoring", level: "Intermediate", weight: 5 },
      { name: "Incident response", level: "Intermediate", weight: 5 },
      { name: "Reliability", level: "Intermediate", weight: 5 },
    ],
  },
];

// ——— 7) Madart (Bakery / pastry shop) ———
const MADART_VACANCIES: VacancyDef[] = [
  {
    title: "Assistant to Baker",
    salaryMin: 1000,
    salaryMax: 1400,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description: "Support bakers; food preparation; baking basics; kitchen hygiene.",
    requiredSkills: [
      { name: "Food preparation", level: "Intermediate", weight: 5 },
      { name: "Baking basics", level: "Intermediate", weight: 5 },
      { name: "Kitchen hygiene", level: "Intermediate", weight: 5 },
      { name: "Teamwork", level: "Intermediate", weight: 4 },
      { name: "Attention to detail", level: "Intermediate", weight: 4 },
    ],
  },
  {
    title: "Cashier",
    salaryMin: 1000,
    salaryMax: 1300,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description: "Process payments; operate POS; customer service.",
    requiredSkills: [
      { name: "POS system", level: "Intermediate", weight: 5 },
      { name: "Customer service", level: "Intermediate", weight: 5 },
      { name: "Basic math", level: "Intermediate", weight: 5 },
      { name: "Accuracy", level: "Intermediate", weight: 4 },
      { name: "Communication", level: "Intermediate", weight: 4 },
    ],
  },
  {
    title: "Sales Consultant",
    salaryMin: 1100,
    salaryMax: 1600,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description: "Retail sales; product presentation; customer consultation.",
    requiredSkills: [
      { name: "Retail sales", level: "Intermediate", weight: 5 },
      { name: "Product presentation", level: "Intermediate", weight: 5 },
      { name: "Customer consultation", level: "Intermediate", weight: 5 },
      { name: "Persuasion", level: "Intermediate", weight: 4 },
      { name: "Friendliness", level: "Intermediate", weight: 4 },
    ],
  },
  {
    title: "Merchandiser",
    salaryMin: 1200,
    salaryMax: 1600,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description: "Product placement; shelf organization; retail merchandising.",
    requiredSkills: [
      { name: "Product placement", level: "Intermediate", weight: 5 },
      { name: "Shelf organization", level: "Intermediate", weight: 5 },
      { name: "Retail merchandising", level: "Intermediate", weight: 5 },
      { name: "Organization", level: "Intermediate", weight: 4 },
      { name: "Attention to detail", level: "Intermediate", weight: 4 },
    ],
  },
];

// ——— 8) Zedazeni (Beverage production / distribution) ———
const ZEDAZENI_VACANCIES: VacancyDef[] = [
  {
    title: "Merchandiser",
    salaryMin: 1300,
    salaryMax: 1700,
    workType: "Full-time",
    requiredExperienceMonths: 12,
    requiredEducationLevel: "High School",
    description:
      "Organize product placement in retail stores; monitor stock levels; ensure correct branding visibility; report product performance.",
    requiredSkills: [
      { name: "Merchandising", level: "Intermediate", weight: 5 },
      { name: "Product display", level: "Intermediate", weight: 5 },
      { name: "Retail coordination", level: "Intermediate", weight: 5 },
      { name: "Organization", level: "Intermediate", weight: 4 },
      { name: "Attention to detail", level: "Intermediate", weight: 4 },
    ],
  },
];

// ——— 9) Shuaguli (Restaurant / hospitality) ———
const SHUAGULI_VACANCIES: VacancyDef[] = [
  {
    title: "Waitress",
    salaryMin: 1000,
    salaryMax: 1400,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description: "Customer service; order taking; restaurant service. Salary + tips.",
    requiredSkills: [
      { name: "Customer service", level: "Intermediate", weight: 5 },
      { name: "Order taking", level: "Intermediate", weight: 5 },
      { name: "Restaurant service", level: "Intermediate", weight: 5 },
      { name: "Communication", level: "Intermediate", weight: 4 },
      { name: "Friendliness", level: "Intermediate", weight: 4 },
      { name: "Multitasking", level: "Intermediate", weight: 4 },
    ],
  },
  {
    title: "Meeter (Host/Hostess)",
    salaryMin: 1100,
    salaryMax: 1500,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description: "Greeting customers; table management; reservations coordination.",
    requiredSkills: [
      { name: "Greeting customers", level: "Intermediate", weight: 5 },
      { name: "Table management", level: "Intermediate", weight: 5 },
      { name: "Reservations coordination", level: "Intermediate", weight: 5 },
      { name: "Communication", level: "Intermediate", weight: 5 },
      { name: "Hospitality", level: "Intermediate", weight: 4 },
    ],
  },
  {
    title: "Cleaner",
    salaryMin: 800,
    salaryMax: 1000,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description: "Hygiene maintenance; cleaning; maintain restaurant cleanliness.",
    requiredSkills: [
      { name: "Hygiene maintenance", level: "Intermediate", weight: 5 },
      { name: "Cleaning", level: "Intermediate", weight: 5 },
      { name: "Discipline", level: "Intermediate", weight: 4 },
      { name: "Reliability", level: "Intermediate", weight: 5 },
    ],
  },
];

// ——— 12) AppleDent ———
const APPLEDENT_VACANCIES: VacancyDef[] = [
  {
    title: "Receptionist",
    salaryMin: 1200,
    salaryMax: 1600,
    workType: "Full-time",
    requiredExperienceMonths: 12,
    requiredEducationLevel: "High School",
    description: "Appointment scheduling; customer service; phone communication.",
    requiredSkills: [
      { name: "Appointment scheduling", level: "Intermediate", weight: 5 },
      { name: "Customer service", level: "Intermediate", weight: 5 },
      { name: "Phone communication", level: "Intermediate", weight: 5 },
    ],
  },
  {
    title: "Dental Assistant",
    salaryMin: 1400,
    salaryMax: 1900,
    workType: "Full-time",
    requiredExperienceMonths: 12,
    requiredEducationLevel: "High School",
    description: "Dental equipment preparation; patient assistance; support during procedures.",
    requiredSkills: [
      { name: "Dental equipment preparation", level: "Intermediate", weight: 5 },
      { name: "Patient assistance", level: "Intermediate", weight: 5 },
      { name: "Hygiene standards", level: "Intermediate", weight: 5 },
    ],
  },
  {
    title: "Clinic Administrator",
    salaryMin: 1700,
    salaryMax: 2300,
    workType: "Full-time",
    requiredExperienceMonths: 24,
    requiredEducationLevel: "Bachelor",
    description: "Clinic operations; documentation management; coordination.",
    requiredSkills: [
      { name: "Clinic operations", level: "Advanced", weight: 5 },
      { name: "Documentation management", level: "Intermediate", weight: 5 },
      { name: "Organization", level: "Intermediate", weight: 5 },
    ],
  },
  {
    title: "Customer Service Specialist",
    salaryMin: 1400,
    salaryMax: 1800,
    workType: "Full-time",
    requiredExperienceMonths: 12,
    requiredEducationLevel: "High School",
    description: "Patient communication; problem solving; inquiries and follow-up.",
    requiredSkills: [
      { name: "Patient communication", level: "Intermediate", weight: 5 },
      { name: "Problem solving", level: "Intermediate", weight: 5 },
      { name: "Customer service", level: "Intermediate", weight: 5 },
    ],
  },
  {
    title: "Cleaner",
    salaryMin: 800,
    salaryMax: 1000,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description: "Maintain clinic cleanliness; hygiene and sanitation standards.",
    requiredSkills: [
      { name: "Hygiene", level: "Intermediate", weight: 5 },
      { name: "Sanitation", level: "Intermediate", weight: 5 },
      { name: "Reliability", level: "Intermediate", weight: 4 },
    ],
  },
  {
    title: "Appointment Coordinator",
    salaryMin: 1300,
    salaryMax: 1700,
    workType: "Full-time",
    requiredExperienceMonths: 12,
    requiredEducationLevel: "High School",
    description: "Scheduling systems; coordinate appointments; organization.",
    requiredSkills: [
      { name: "Scheduling systems", level: "Intermediate", weight: 5 },
      { name: "Organization", level: "Intermediate", weight: 5 },
      { name: "Communication", level: "Intermediate", weight: 5 },
    ],
  },
];

// ——— 13) Cafe Stamba (create if not exist) ———
const STAMBA_VACANCIES: VacancyDef[] = [
  { title: "Barista", salaryMin: 1100, salaryMax: 1500, workType: "Full-time", requiredExperienceMonths: 0, requiredEducationLevel: "None", description: "Prepare coffee and beverages; serve customers; maintain bar area.", requiredSkills: [{ name: "Coffee preparation", level: "Intermediate", weight: 5 }, { name: "Customer service", level: "Intermediate", weight: 5 }] },
  { title: "Waiter", salaryMin: 1000, salaryMax: 1400, workType: "Full-time", requiredExperienceMonths: 0, requiredEducationLevel: "None", description: "Serve customers; take orders; deliver orders. Salary + tips.", requiredSkills: [{ name: "Customer service", level: "Intermediate", weight: 5 }, { name: "Order taking", level: "Intermediate", weight: 5 }] },
  { title: "Cashier", salaryMin: 1000, salaryMax: 1300, workType: "Full-time", requiredExperienceMonths: 0, requiredEducationLevel: "None", description: "Process payments; operate POS; issue receipts.", requiredSkills: [{ name: "POS system", level: "Intermediate", weight: 5 }, { name: "Customer service", level: "Intermediate", weight: 5 }] },
  { title: "Kitchen Assistant", salaryMin: 1000, salaryMax: 1400, workType: "Full-time", requiredExperienceMonths: 0, requiredEducationLevel: "None", description: "Food preparation support; kitchen hygiene; assist cooks.", requiredSkills: [{ name: "Food preparation", level: "Intermediate", weight: 5 }, { name: "Kitchen hygiene", level: "Intermediate", weight: 5 }] },
];

// ——— 14) Cafe Entrée (create if not exist) ———
const ENTREE_VACANCIES: VacancyDef[] = [
  { title: "Barista", salaryMin: 1100, salaryMax: 1500, workType: "Full-time", requiredExperienceMonths: 0, requiredEducationLevel: "None", description: "Prepare coffee and beverages; serve customers.", requiredSkills: [{ name: "Coffee preparation", level: "Intermediate", weight: 5 }, { name: "Customer service", level: "Intermediate", weight: 5 }] },
  { title: "Cashier", salaryMin: 1000, salaryMax: 1300, workType: "Full-time", requiredExperienceMonths: 0, requiredEducationLevel: "None", description: "Process payments; operate POS; customer service.", requiredSkills: [{ name: "POS system", level: "Intermediate", weight: 5 }, { name: "Customer service", level: "Intermediate", weight: 5 }] },
  { title: "Sales Consultant", salaryMin: 1100, salaryMax: 1500, workType: "Full-time", requiredExperienceMonths: 0, requiredEducationLevel: "None", description: "Product presentation; customer service; sales.", requiredSkills: [{ name: "Sales", level: "Intermediate", weight: 5 }, { name: "Customer service", level: "Intermediate", weight: 5 }] },
  { title: "Cleaner", salaryMin: 800, salaryMax: 1000, workType: "Full-time", requiredExperienceMonths: 0, requiredEducationLevel: "None", description: "Maintain cleanliness; hygiene standards.", requiredSkills: [{ name: "Cleaning", level: "Intermediate", weight: 5 }, { name: "Hygiene", level: "Intermediate", weight: 5 }] },
];

// ——— 15) Restaurant Machakhela (create if not exist) ———
const MACHAKHELA_VACANCIES: VacancyDef[] = [
  { title: "Waiter", salaryMin: 1000, salaryMax: 1400, workType: "Full-time", requiredExperienceMonths: 0, requiredEducationLevel: "None", description: "Serve guests; take orders; deliver meals. Salary + tips.", requiredSkills: [{ name: "Customer service", level: "Intermediate", weight: 5 }, { name: "Order taking", level: "Intermediate", weight: 5 }] },
  { title: "Cashier", salaryMin: 1000, salaryMax: 1300, workType: "Full-time", requiredExperienceMonths: 0, requiredEducationLevel: "None", description: "Process payments; operate POS; issue receipts.", requiredSkills: [{ name: "POS system", level: "Intermediate", weight: 5 }, { name: "Customer service", level: "Intermediate", weight: 5 }] },
  { title: "Assistant Cook", salaryMin: 1200, salaryMax: 1600, workType: "Full-time", requiredExperienceMonths: 12, requiredEducationLevel: "None", description: "Assist chefs; food preparation; kitchen hygiene.", requiredSkills: [{ name: "Food preparation", level: "Intermediate", weight: 5 }, { name: "Kitchen hygiene", level: "Intermediate", weight: 5 }] },
  { title: "Cleaner", salaryMin: 800, salaryMax: 1000, workType: "Full-time", requiredExperienceMonths: 0, requiredEducationLevel: "None", description: "Maintain restaurant cleanliness; hygiene.", requiredSkills: [{ name: "Cleaning", level: "Intermediate", weight: 5 }, { name: "Hygiene", level: "Intermediate", weight: 5 }] },
];

// ——— 16) Cafe Prospero's Books (create if not exist) ———
const PROSPEROS_VACANCIES: VacancyDef[] = [
  { title: "Barista", salaryMin: 1100, salaryMax: 1500, workType: "Full-time", requiredExperienceMonths: 0, requiredEducationLevel: "None", description: "Prepare coffee and beverages; serve customers.", requiredSkills: [{ name: "Coffee preparation", level: "Intermediate", weight: 5 }, { name: "Customer service", level: "Intermediate", weight: 5 }] },
  { title: "Waiter", salaryMin: 1000, salaryMax: 1400, workType: "Full-time", requiredExperienceMonths: 0, requiredEducationLevel: "None", description: "Serve customers; take orders. Salary + tips.", requiredSkills: [{ name: "Customer service", level: "Intermediate", weight: 5 }, { name: "Order taking", level: "Intermediate", weight: 5 }] },
  { title: "Cashier", salaryMin: 1000, salaryMax: 1300, workType: "Full-time", requiredExperienceMonths: 0, requiredEducationLevel: "None", description: "Process payments; operate POS.", requiredSkills: [{ name: "POS system", level: "Intermediate", weight: 5 }, { name: "Customer service", level: "Intermediate", weight: 5 }] },
  { title: "Kitchen Assistant", salaryMin: 1000, salaryMax: 1400, workType: "Full-time", requiredExperienceMonths: 0, requiredEducationLevel: "None", description: "Food preparation support; kitchen hygiene.", requiredSkills: [{ name: "Food preparation", level: "Intermediate", weight: 5 }, { name: "Kitchen hygiene", level: "Intermediate", weight: 5 }] },
];

// ——— 17) Restaurant Lolita (create if not exist) ———
const LOLITA_VACANCIES: VacancyDef[] = [
  { title: "Waiter", salaryMin: 1000, salaryMax: 1400, workType: "Full-time", requiredExperienceMonths: 0, requiredEducationLevel: "None", description: "Serve guests; take orders; deliver meals. Salary + tips.", requiredSkills: [{ name: "Customer service", level: "Intermediate", weight: 5 }, { name: "Order taking", level: "Intermediate", weight: 5 }] },
  { title: "Barista", salaryMin: 1100, salaryMax: 1500, workType: "Full-time", requiredExperienceMonths: 0, requiredEducationLevel: "None", description: "Prepare coffee and beverages; serve customers.", requiredSkills: [{ name: "Coffee preparation", level: "Intermediate", weight: 5 }, { name: "Customer service", level: "Intermediate", weight: 5 }] },
  { title: "Hostess", salaryMin: 1100, salaryMax: 1500, workType: "Full-time", requiredExperienceMonths: 0, requiredEducationLevel: "None", description: "Greet guests; seating; reservations; front-of-house.", requiredSkills: [{ name: "Customer service", level: "Intermediate", weight: 5 }, { name: "Communication", level: "Intermediate", weight: 5 }] },
  { title: "Dishwasher", salaryMin: 800, salaryMax: 1000, workType: "Full-time", requiredExperienceMonths: 0, requiredEducationLevel: "None", description: "Wash dishes; maintain kitchen hygiene.", requiredSkills: [{ name: "Reliability", level: "Intermediate", weight: 5 }, { name: "Hygiene", level: "Intermediate", weight: 5 }] },
];

// ——— Spar Georgia (Supermarket retail) ———
const SPAR_GEORGIA_VACANCIES: VacancyDef[] = [
  { title: "Cashier", salaryMin: 1000, salaryMax: 1300, workType: "Full-time", requiredExperienceMonths: 0, requiredEducationLevel: "None", description: "Process payments; operate POS; customer service.", requiredSkills: [{ name: "POS system", level: "Intermediate", weight: 5 }, { name: "Customer service", level: "Intermediate", weight: 5 }, { name: "Payment processing", level: "Intermediate", weight: 5 }] },
  { title: "Store Assistant", salaryMin: 1000, salaryMax: 1300, workType: "Full-time", requiredExperienceMonths: 0, requiredEducationLevel: "None", description: "Shelf organization; store operations; teamwork.", requiredSkills: [{ name: "Shelf organization", level: "Intermediate", weight: 5 }, { name: "Store operations", level: "Intermediate", weight: 5 }, { name: "Teamwork", level: "Intermediate", weight: 5 }] },
  { title: "Merchandiser", salaryMin: 1200, salaryMax: 1600, workType: "Full-time", requiredExperienceMonths: 0, requiredEducationLevel: "None", description: "Product placement; retail merchandising; display maintenance.", requiredSkills: [{ name: "Product placement", level: "Intermediate", weight: 5 }, { name: "Retail merchandising", level: "Intermediate", weight: 5 }] },
  { title: "Warehouse Worker", salaryMin: 1000, salaryMax: 1400, workType: "Full-time", requiredExperienceMonths: 0, requiredEducationLevel: "None", description: "Inventory handling; logistics basics; receive and dispatch goods.", requiredSkills: [{ name: "Inventory handling", level: "Intermediate", weight: 5 }, { name: "Logistics basics", level: "Intermediate", weight: 5 }] },
];

// ——— Agrohub (Grocery retail) ———
const AGROHUB_VACANCIES: VacancyDef[] = [
  { title: "Cashier", salaryMin: 1000, salaryMax: 1300, workType: "Full-time", requiredExperienceMonths: 0, requiredEducationLevel: "None", description: "Process payments; operate POS.", requiredSkills: [{ name: "POS system", level: "Intermediate", weight: 5 }, { name: "Payments", level: "Intermediate", weight: 5 }] },
  { title: "Sales Consultant", salaryMin: 1100, salaryMax: 1600, workType: "Full-time", requiredExperienceMonths: 0, requiredEducationLevel: "None", description: "Retail sales; customer consultation; product advice.", requiredSkills: [{ name: "Retail sales", level: "Intermediate", weight: 5 }, { name: "Customer consultation", level: "Intermediate", weight: 5 }] },
  { title: "Merchandiser", salaryMin: 1200, salaryMax: 1600, workType: "Full-time", requiredExperienceMonths: 0, requiredEducationLevel: "None", description: "Product display; inventory control; shelf management.", requiredSkills: [{ name: "Product display", level: "Intermediate", weight: 5 }, { name: "Inventory control", level: "Intermediate", weight: 5 }] },
  { title: "Warehouse Worker", salaryMin: 1000, salaryMax: 1400, workType: "Full-time", requiredExperienceMonths: 0, requiredEducationLevel: "None", description: "Warehouse operations; logistics; stock handling.", requiredSkills: [{ name: "Warehouse operations", level: "Intermediate", weight: 5 }, { name: "Logistics", level: "Intermediate", weight: 5 }] },
];

// ——— LC Waikiki (Fashion retail) ———
const LC_WAIKIKI_VACANCIES: VacancyDef[] = [
  { title: "Sales Consultant", salaryMin: 1100, salaryMax: 1600, workType: "Full-time", requiredExperienceMonths: 0, requiredEducationLevel: "None", description: "Retail sales; customer service; product presentation.", requiredSkills: [{ name: "Retail sales", level: "Intermediate", weight: 5 }, { name: "Customer service", level: "Intermediate", weight: 5 }] },
  { title: "Cashier", salaryMin: 1000, salaryMax: 1300, workType: "Full-time", requiredExperienceMonths: 0, requiredEducationLevel: "None", description: "Process payments; operate POS.", requiredSkills: [{ name: "POS systems", level: "Intermediate", weight: 5 }, { name: "Payments", level: "Intermediate", weight: 5 }] },
  { title: "Store Administrator", salaryMin: 1600, salaryMax: 2200, workType: "Full-time", requiredExperienceMonths: 24, requiredEducationLevel: "High School", description: "Retail management; reporting; store operations.", requiredSkills: [{ name: "Retail management", level: "Intermediate", weight: 5 }, { name: "Reporting", level: "Intermediate", weight: 5 }] },
  { title: "Merchandiser", salaryMin: 1200, salaryMax: 1600, workType: "Full-time", requiredExperienceMonths: 0, requiredEducationLevel: "None", description: "Product display; store organization; visual merchandising.", requiredSkills: [{ name: "Product display", level: "Intermediate", weight: 5 }, { name: "Store organization", level: "Intermediate", weight: 5 }] },
];

// ——— Zara Georgia (Fashion retail) ———
const ZARA_GEORGIA_VACANCIES: VacancyDef[] = [
  { title: "Sales Consultant", salaryMin: 1200, salaryMax: 1700, workType: "Full-time", requiredExperienceMonths: 0, requiredEducationLevel: "None", description: "Sales; customer service; product knowledge.", requiredSkills: [{ name: "Sales", level: "Intermediate", weight: 5 }, { name: "Customer service", level: "Intermediate", weight: 5 }] },
  { title: "Cashier", salaryMin: 1000, salaryMax: 1300, workType: "Full-time", requiredExperienceMonths: 0, requiredEducationLevel: "None", description: "Process payments; operate POS.", requiredSkills: [{ name: "POS system", level: "Intermediate", weight: 5 }, { name: "Payments", level: "Intermediate", weight: 5 }] },
  { title: "Store Assistant", salaryMin: 1000, salaryMax: 1300, workType: "Full-time", requiredExperienceMonths: 0, requiredEducationLevel: "None", description: "Retail operations; product arrangement; floor support.", requiredSkills: [{ name: "Retail operations", level: "Intermediate", weight: 5 }, { name: "Product arrangement", level: "Intermediate", weight: 5 }] },
  { title: "Stockroom Worker", salaryMin: 1100, salaryMax: 1400, workType: "Full-time", requiredExperienceMonths: 0, requiredEducationLevel: "None", description: "Inventory handling; logistics; stockroom organization.", requiredSkills: [{ name: "Inventory handling", level: "Intermediate", weight: 5 }, { name: "Logistics", level: "Intermediate", weight: 5 }] },
];

// ——— Aray Tomorrow (Electronics retail) ———
const ARAY_TOMORROW_VACANCIES: VacancyDef[] = [
  { title: "Sales Consultant", salaryMin: 1200, salaryMax: 1800, workType: "Full-time", requiredExperienceMonths: 12, requiredEducationLevel: "High School", description: "Electronics sales; product presentation; customer advice.", requiredSkills: [{ name: "Electronics sales", level: "Intermediate", weight: 5 }, { name: "Product presentation", level: "Intermediate", weight: 5 }] },
  { title: "Cashier", salaryMin: 1000, salaryMax: 1300, workType: "Full-time", requiredExperienceMonths: 0, requiredEducationLevel: "None", description: "Process payments; operate POS.", requiredSkills: [{ name: "POS systems", level: "Intermediate", weight: 5 }, { name: "Payment handling", level: "Intermediate", weight: 5 }] },
  { title: "Warehouse Worker", salaryMin: 1100, salaryMax: 1500, workType: "Full-time", requiredExperienceMonths: 0, requiredEducationLevel: "None", description: "Inventory handling; logistics; goods receipt and dispatch.", requiredSkills: [{ name: "Inventory handling", level: "Intermediate", weight: 5 }, { name: "Logistics", level: "Intermediate", weight: 5 }] },
  { title: "Merchandiser", salaryMin: 1200, salaryMax: 1600, workType: "Full-time", requiredExperienceMonths: 0, requiredEducationLevel: "None", description: "Product display; retail merchandising; store presentation.", requiredSkills: [{ name: "Product display", level: "Intermediate", weight: 5 }, { name: "Retail merchandising", level: "Intermediate", weight: 5 }] },
];

// ——— Tsiskvili Restaurant ———
const TSISKVILI_RESTAURANT_VACANCIES: VacancyDef[] = [
  { title: "Waiter", salaryMin: 1000, salaryMax: 1400, workType: "Full-time", requiredExperienceMonths: 0, requiredEducationLevel: "None", description: "Table service; order taking; serve guests. Salary + tips.", requiredSkills: [{ name: "Table service", level: "Intermediate", weight: 5 }, { name: "Order taking", level: "Intermediate", weight: 5 }] },
  { title: "Hostess", salaryMin: 1100, salaryMax: 1500, workType: "Full-time", requiredExperienceMonths: 0, requiredEducationLevel: "None", description: "Customer greeting; reservations; seating.", requiredSkills: [{ name: "Customer greeting", level: "Intermediate", weight: 5 }, { name: "Reservations", level: "Intermediate", weight: 5 }] },
  { title: "Cashier", salaryMin: 1000, salaryMax: 1300, workType: "Full-time", requiredExperienceMonths: 0, requiredEducationLevel: "None", description: "Process payments; operate POS.", requiredSkills: [{ name: "POS system", level: "Intermediate", weight: 5 }, { name: "Payment handling", level: "Intermediate", weight: 5 }] },
  { title: "Kitchen Assistant", salaryMin: 1100, salaryMax: 1500, workType: "Full-time", requiredExperienceMonths: 0, requiredEducationLevel: "None", description: "Food preparation; kitchen hygiene; support chefs.", requiredSkills: [{ name: "Food preparation", level: "Intermediate", weight: 5 }, { name: "Kitchen hygiene", level: "Intermediate", weight: 5 }] },
];

// ——— Khinkali House ———
const KHINKALI_HOUSE_VACANCIES: VacancyDef[] = [
  { title: "Waiter", salaryMin: 1000, salaryMax: 1400, workType: "Full-time", requiredExperienceMonths: 0, requiredEducationLevel: "None", description: "Restaurant service; order taking; serve guests. Salary + tips.", requiredSkills: [{ name: "Restaurant service", level: "Intermediate", weight: 5 }, { name: "Order taking", level: "Intermediate", weight: 5 }] },
  { title: "Assistant Cook", salaryMin: 1200, salaryMax: 1600, workType: "Full-time", requiredExperienceMonths: 12, requiredEducationLevel: "None", description: "Food preparation; kitchen support; assist chefs.", requiredSkills: [{ name: "Food preparation", level: "Intermediate", weight: 5 }, { name: "Kitchen support", level: "Intermediate", weight: 5 }] },
  { title: "Cleaner", salaryMin: 800, salaryMax: 1000, workType: "Full-time", requiredExperienceMonths: 0, requiredEducationLevel: "None", description: "Cleaning; hygiene; maintain restaurant cleanliness.", requiredSkills: [{ name: "Cleaning", level: "Intermediate", weight: 5 }, { name: "Hygiene", level: "Intermediate", weight: 5 }] },
  { title: "Cashier", salaryMin: 1000, salaryMax: 1300, workType: "Full-time", requiredExperienceMonths: 0, requiredEducationLevel: "None", description: "Process payments; operate POS.", requiredSkills: [{ name: "POS system", level: "Intermediate", weight: 5 }] },
];

// ——— Coffeesta (Coffee shop) ———
const COFFEESTA_VACANCIES: VacancyDef[] = [
  { title: "Barista", salaryMin: 1100, salaryMax: 1500, workType: "Full-time", requiredExperienceMonths: 0, requiredEducationLevel: "None", description: "Coffee preparation; customer service; operate coffee machines.", requiredSkills: [{ name: "Coffee preparation", level: "Intermediate", weight: 5 }, { name: "Customer service", level: "Intermediate", weight: 5 }] },
  { title: "Cashier", salaryMin: 1000, salaryMax: 1300, workType: "Full-time", requiredExperienceMonths: 0, requiredEducationLevel: "None", description: "Process payments; operate POS.", requiredSkills: [{ name: "POS system", level: "Intermediate", weight: 5 }] },
  { title: "Cleaner", salaryMin: 800, salaryMax: 1000, workType: "Full-time", requiredExperienceMonths: 0, requiredEducationLevel: "None", description: "Cleaning; maintain café cleanliness.", requiredSkills: [{ name: "Cleaning", level: "Intermediate", weight: 5 }] },
  { title: "Kitchen Assistant", salaryMin: 1000, salaryMax: 1400, workType: "Full-time", requiredExperienceMonths: 0, requiredEducationLevel: "None", description: "Food preparation; support kitchen.", requiredSkills: [{ name: "Food preparation", level: "Intermediate", weight: 5 }] },
];

// ——— Wendy's Georgia (Fast food) ———
const WENDYS_GEORGIA_VACANCIES: VacancyDef[] = [
  { title: "Cashier", salaryMin: 1000, salaryMax: 1300, workType: "Full-time", requiredExperienceMonths: 0, requiredEducationLevel: "None", description: "Process payments; operate POS; customer service.", requiredSkills: [{ name: "POS system", level: "Intermediate", weight: 5 }, { name: "Customer service", level: "Intermediate", weight: 5 }] },
  { title: "Kitchen Assistant", salaryMin: 1100, salaryMax: 1500, workType: "Full-time", requiredExperienceMonths: 0, requiredEducationLevel: "None", description: "Food preparation; kitchen hygiene.", requiredSkills: [{ name: "Food preparation", level: "Intermediate", weight: 5 }, { name: "Kitchen hygiene", level: "Intermediate", weight: 5 }] },
  { title: "Cleaner", salaryMin: 800, salaryMax: 1000, workType: "Full-time", requiredExperienceMonths: 0, requiredEducationLevel: "None", description: "Cleaning; maintain cleanliness.", requiredSkills: [{ name: "Cleaning", level: "Intermediate", weight: 5 }] },
  { title: "Service Worker", salaryMin: 1000, salaryMax: 1300, workType: "Full-time", requiredExperienceMonths: 0, requiredEducationLevel: "None", description: "Customer assistance; order delivery; dining area.", requiredSkills: [{ name: "Customer assistance", level: "Intermediate", weight: 5 }] },
];

// ——— Georgian Post (Logistics / postal services) ———
const GEORGIAN_POST_VACANCIES: VacancyDef[] = [
  { title: "Courier Assistant", salaryMin: 1100, salaryMax: 1500, workType: "Full-time", requiredExperienceMonths: 0, requiredEducationLevel: "None", description: "Delivery support; route navigation; assist couriers.", requiredSkills: [{ name: "Delivery support", level: "Intermediate", weight: 5 }, { name: "Route navigation", level: "Intermediate", weight: 5 }] },
  { title: "Warehouse Worker", salaryMin: 1000, salaryMax: 1400, workType: "Full-time", requiredExperienceMonths: 0, requiredEducationLevel: "None", description: "Inventory handling; logistics; sort and dispatch.", requiredSkills: [{ name: "Inventory handling", level: "Intermediate", weight: 5 }, { name: "Logistics", level: "Intermediate", weight: 5 }] },
  { title: "Support Operator", salaryMin: 1300, salaryMax: 1800, workType: "Full-time", requiredExperienceMonths: 12, requiredEducationLevel: "High School", description: "Customer support; communication; resolve inquiries.", requiredSkills: [{ name: "Customer support", level: "Intermediate", weight: 5 }, { name: "Communication", level: "Intermediate", weight: 5 }] },
  { title: "Logistics Assistant", salaryMin: 1400, salaryMax: 1800, workType: "Full-time", requiredExperienceMonths: 12, requiredEducationLevel: "High School", description: "Logistics coordination; documentation; tracking.", requiredSkills: [{ name: "Logistics coordination", level: "Intermediate", weight: 5 }, { name: "Documentation", level: "Intermediate", weight: 5 }] },
];

// All companies: find by name; if not found, create User + Company, then add vacancies.
const NEW_COMPANIES_CONFIG: Array<{
  nameMatch: string[];
  label: string;
  industry: string;
  email: string;
  vacancies: VacancyDef[];
}> = [
  { nameMatch: ["madart"], label: "Madart", industry: "Bakery / pastry shop", email: "hr@madart.ge", vacancies: MADART_VACANCIES },
  { nameMatch: ["zedazeni"], label: "Zedazeni", industry: "Beverage production / distribution", email: "hr@zedazeni.ge", vacancies: ZEDAZENI_VACANCIES },
  { nameMatch: ["shuaguli"], label: "Shuaguli", industry: "Restaurant / hospitality", email: "hr@shuaguli.ge", vacancies: SHUAGULI_VACANCIES },
  { nameMatch: ["marriott", "hotel marriott"], label: "Hotel Marriott", industry: "Hospitality / Hotel", email: "hr@hotelmarriott.ge", vacancies: MARRIOTT_VACANCIES },
  { nameMatch: ["kopala", "hotel kopala"], label: "Hotel Kopala", industry: "Hospitality / Hotel", email: "hr@hotelkopala.ge", vacancies: KOPALA_VACANCIES },
  { nameMatch: ["appledent", "apple dent"], label: "AppleDent", industry: "Dental clinic", email: "hr@appledent.ge", vacancies: APPLEDENT_VACANCIES },
  { nameMatch: ["stamba", "cafe stamba"], label: "Cafe Stamba", industry: "Cafe / restaurant", email: "hr@cafestamba.ge", vacancies: STAMBA_VACANCIES },
  { nameMatch: ["entrée", "entree", "cafe entrée"], label: "Cafe Entrée", industry: "Bakery / cafe", email: "hr@cafeentree.ge", vacancies: ENTREE_VACANCIES },
  { nameMatch: ["machakhela", "restaurant machakhela"], label: "Restaurant Machakhela", industry: "Restaurant", email: "hr@machakhela.ge", vacancies: MACHAKHELA_VACANCIES },
  { nameMatch: ["prospero", "prospero's", "prosperos books"], label: "Cafe Prospero's Books", industry: "Cafe / bookstore cafe", email: "hr@prosperosbooks.ge", vacancies: PROSPEROS_VACANCIES },
  { nameMatch: ["lolita", "restaurant lolita"], label: "Restaurant Lolita", industry: "Restaurant", email: "hr@restaurantlolita.ge", vacancies: LOLITA_VACANCIES },
  { nameMatch: ["spar georgia", "spar"], label: "Spar Georgia", industry: "Supermarket retail", email: "hr@spargeorgia.ge", vacancies: SPAR_GEORGIA_VACANCIES },
  { nameMatch: ["agrohub"], label: "Agrohub", industry: "Grocery retail", email: "hr@agrohub.ge", vacancies: AGROHUB_VACANCIES },
  { nameMatch: ["lc waikiki", "waikiki"], label: "LC Waikiki", industry: "Fashion retail", email: "hr@lcwaikiki.ge", vacancies: LC_WAIKIKI_VACANCIES },
  { nameMatch: ["zara georgia", "zara"], label: "Zara Georgia", industry: "Fashion retail", email: "hr@zarageorgia.ge", vacancies: ZARA_GEORGIA_VACANCIES },
  { nameMatch: ["aray tomorrow", "aray"], label: "Aray Tomorrow", industry: "Electronics retail", email: "hr@araytomorrow.ge", vacancies: ARAY_TOMORROW_VACANCIES },
  { nameMatch: ["tsiskvili", "tsiskvili restaurant"], label: "Tsiskvili Restaurant", industry: "Restaurant", email: "hr@tsiskvili.ge", vacancies: TSISKVILI_RESTAURANT_VACANCIES },
  { nameMatch: ["khinkali house", "khinkali"], label: "Khinkali House", industry: "Restaurant", email: "hr@khinkalihouse.ge", vacancies: KHINKALI_HOUSE_VACANCIES },
  { nameMatch: ["coffeesta"], label: "Coffeesta", industry: "Coffee shop", email: "hr@coffeesta.ge", vacancies: COFFEESTA_VACANCIES },
  { nameMatch: ["wendy's georgia", "wendys georgia", "wendys"], label: "Wendy's Georgia", industry: "Fast food", email: "hr@wendys.ge", vacancies: WENDYS_GEORGIA_VACANCIES },
  { nameMatch: ["georgian post", "georgianpost"], label: "Georgian Post", industry: "Logistics / postal services", email: "hr@georgianpost.ge", vacancies: GEORGIAN_POST_VACANCIES },
];

async function ensureVacancy(companyId: string, v: VacancyDef): Promise<{ id: string; title: string; created: boolean }> {
  const existing = await prisma.vacancy.findFirst({
    where: { companyId, title: v.title },
    select: { id: true },
  });

  if (existing) {
    await prisma.vacancy.update({
      where: { id: existing.id },
      data: { salaryMin: v.salaryMin, salaryMax: v.salaryMax },
    });
    return { id: existing.id, title: v.title, created: false };
  }

  const vacancy = await prisma.vacancy.create({
    data: {
      companyId,
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

  const allSkills = [
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

  return { id: vacancy.id, title: vacancy.title, created: true };
}

async function findOrCreateCompany(
  allCompanies: { id: string; name: string }[],
  cfg: (typeof NEW_COMPANIES_CONFIG)[0]
): Promise<{ id: string; name: string; created: boolean } | null> {
  const found = allCompanies.find((c) => companyMatches(c.name, cfg.nameMatch));
  if (found) return { ...found, created: false };

  const slug = cfg.label.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const companyId = `SEED-${slug.toUpperCase().replace(/-/g, "_")}`;
  const contactPhone = "+995555000000";

  const existingUser = await prisma.user.findUnique({ where: { email: cfg.email }, select: { id: true } });
  let userId: string;
  if (existingUser) {
    userId = existingUser.id;
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashPassword(DEFAULT_PASSWORD) },
    });
  } else {
    const user = await prisma.user.create({
      data: {
        email: cfg.email,
        passwordHash: hashPassword(DEFAULT_PASSWORD),
        role: "EMPLOYER",
      },
    });
    userId = user.id;
  }

  const company = await prisma.company.create({
    data: {
      userId,
      name: cfg.label,
      companyId,
      contactEmail: cfg.email,
      contactPhone,
      industry: cfg.industry,
    },
  });

  return { id: company.id, name: company.name, created: true };
}

async function main() {
  console.log("Connecting to database...\n");
  await prisma.$connect();

  const allCompanies = await prisma.company.findMany({ select: { id: true, name: true } });

  let totalVacancies = 0;

  console.log("——— Companies (find or create, then vacancies) ———\n");
  for (const cfg of NEW_COMPANIES_CONFIG) {
    const company = await findOrCreateCompany(allCompanies, cfg);
    if (!company) continue;
    if (company.created) {
      console.log(`  Created company: ${company.name} (id: ${company.id}). Login: ${cfg.email} / ${DEFAULT_PASSWORD}`);
      allCompanies.push({ id: company.id, name: company.name });
    } else {
      console.log(`  ${company.name} (id: ${company.id}):`);
    }
    for (const v of cfg.vacancies) {
      const out = await ensureVacancy(company.id, v);
      totalVacancies++;
      console.log(`    ${out.created ? "Created" : "Updated"}: ${out.title}`);
    }
    console.log("");
  }

  console.log("--- Done ---");
  console.log(`Total vacancies created/updated: ${totalVacancies}`);
  console.log("All vacancies: PUBLISHED, Tbilisi. New company accounts: password", DEFAULT_PASSWORD);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
