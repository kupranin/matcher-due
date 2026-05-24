/**
 * Seed bilingual JobRoleTemplate + RoleSkillTemplate starter data.
 * Run: npm run db:seed:roles
 *
 * Idempotent: upserts each role by (slug, locale), then replaces skills for that role.
 */

import * as fs from "fs";
import * as path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const skillEnToKa = (
  JSON.parse(fs.readFileSync(path.join(process.cwd(), "messages", "ka.json"), "utf-8")) as {
    skillNames: Record<string, string>;
  }
).skillNames;

type Locale = "en" | "ka";

type RoleLocaleCopy = {
  title: string;
  category: string;
  description: string;
};

type StarterRole = {
  slug: string;
  en: RoleLocaleCopy;
  ka: RoleLocaleCopy;
  skills: Array<{ skillName: string; weight: number }>;
};

/** English skill names; Georgian labels come from messages/ka.json skillNames. */
function skillNameForLocale(skillNameEn: string, locale: Locale): string {
  if (locale === "en") return skillNameEn;
  return skillEnToKa[skillNameEn] ?? skillNameEn;
}

async function upsertRoleWithSkills(
  role: StarterRole,
  locale: Locale
): Promise<void> {
  const copy = locale === "en" ? role.en : role.ka;

  const row = await prisma.jobRoleTemplate.upsert({
    where: { slug_locale: { slug: role.slug, locale } },
    update: {
      title: copy.title,
      category: copy.category,
      description: copy.description,
    },
    create: {
      slug: role.slug,
      locale,
      title: copy.title,
      category: copy.category,
      description: copy.description,
    },
  });

  await prisma.roleSkillTemplate.deleteMany({ where: { roleId: row.id } });

  if (role.skills.length > 0) {
    await prisma.roleSkillTemplate.createMany({
      data: role.skills.map((s) => ({
        roleId: row.id,
        skillName: skillNameForLocale(s.skillName, locale),
        weight: s.weight,
      })),
    });
  }
}

/** 24 starter entry-level roles (EN + KA). */
const STARTER_ROLES: StarterRole[] = [
  {
    slug: "barista",
    en: {
      title: "Barista",
      category: "Hospitality",
      description:
        "We are looking for a Barista to prepare coffee and serve customers. Experience in customer service is a plus.",
    },
    ka: {
      title: "ბარისტა",
      category: "სასტუმრო მომსახურება",
      description:
        "ჩვენ ვეძებთ ბარისტას ყავის მომზადებისა და მომხმარებლების მომსახურებისთვის. მომხმარებელთა მომსახურების გამოცდილება სასურველია.",
    },
    skills: [
      { skillName: "Customer service", weight: 5 },
      { skillName: "Coffee preparation", weight: 5 },
      { skillName: "Speed & accuracy", weight: 4 },
      { skillName: "Cash handling", weight: 4 },
      { skillName: "Cleanliness", weight: 4 },
    ],
  },
  {
    slug: "cashier",
    en: {
      title: "Cashier",
      category: "Retail",
      description:
        "We need a Cashier for point-of-sale and customer service. Attention to detail and reliability required.",
    },
    ka: {
      title: "მოლარე",
      category: "საცალო ვაჭრობა",
      description:
        "გვჭირდება მოლარე კასსა და მომხმარებელთა მომსახურებისთვის. საჭიროა ზრუნვა დეტალებზე და საიმედოობა.",
    },
    skills: [
      { skillName: "Cash handling", weight: 5 },
      { skillName: "Attention to detail", weight: 5 },
      { skillName: "Customer service", weight: 4 },
      { skillName: "Speed & accuracy", weight: 4 },
      { skillName: "POS systems", weight: 4 },
    ],
  },
  {
    slug: "waiter",
    en: {
      title: "Waiter/Waitress",
      category: "Hospitality",
      description:
        "We are hiring Waiters/Waitresses for table service. Good communication and teamwork skills needed.",
    },
    ka: {
      title: "მიმტანი",
      category: "სასტუმრო მომსახურება",
      description:
        "ვიყენებთ მიმტანებს სტუმრების მომსახურებისთვის. საჭიროა კომუნიკაციისა და გუნდური მუშაობის უნარები.",
    },
    skills: [
      { skillName: "Customer service", weight: 5 },
      { skillName: "Communication", weight: 4 },
      { skillName: "Time management", weight: 4 },
      { skillName: "Teamwork", weight: 4 },
      { skillName: "Upselling", weight: 3 },
    ],
  },
  {
    slug: "sales-associate",
    en: {
      title: "Sales Associate",
      category: "Retail",
      description:
        "We seek a Sales Associate to assist customers and drive sales. Product knowledge and enthusiasm welcome.",
    },
    ka: {
      title: "გამყიდველი",
      category: "საცალო ვაჭრობა",
      description:
        "ვეძებთ გამყიდველს მომხმარებლების დასახმარებლად და გაყიდვების გასაზრდელად. პროდუქტის ცოდნა სასურველია.",
    },
    skills: [
      { skillName: "Communication", weight: 5 },
      { skillName: "Upselling", weight: 4 },
      { skillName: "Customer service", weight: 4 },
      { skillName: "Product knowledge", weight: 4 },
      { skillName: "Problem solving", weight: 3 },
    ],
  },
  {
    slug: "call-center-agent",
    en: {
      title: "Call Center Agent",
      category: "Customer Service",
      description:
        "We need Call Center Agents for customer support. Strong communication and patience are essential.",
    },
    ka: {
      title: "სატელეფონო ოპერატორი",
      category: "მომხმარებელთა მომსახურება",
      description:
        "გვჭირდება სატელეფონო ოპერატორები მომხმარებელთა მხარდაჭერისთვის. საჭიროა კომუნიკაცია და მოთმინება.",
    },
    skills: [
      { skillName: "Communication", weight: 5 },
      { skillName: "Active listening", weight: 4 },
      { skillName: "Typing", weight: 4 },
      { skillName: "Problem solving", weight: 4 },
      { skillName: "Patience", weight: 4 },
    ],
  },
  {
    slug: "warehouse-worker",
    en: {
      title: "Warehouse Worker",
      category: "Logistics",
      description:
        "We are hiring Warehouse Workers for packing and logistics. Physical stamina and safety awareness required.",
    },
    ka: {
      title: "საწყობის მუშა",
      category: "ლოგისტიკა",
      description:
        "ვიყენებთ საწყობის მუშებს შეფუთვისა და ლოგისტიკისთვის. საჭიროა ფიზიკური გამძლეობა და უსაფრთხოებაზე ზრუნვა.",
    },
    skills: [
      { skillName: "Physical stamina", weight: 5 },
      { skillName: "Attention to detail", weight: 4 },
      { skillName: "Teamwork", weight: 4 },
      { skillName: "Time management", weight: 4 },
      { skillName: "Safety awareness", weight: 5 },
    ],
  },
  {
    slug: "receptionist",
    en: {
      title: "Receptionist",
      category: "Admin",
      description:
        "We need a Receptionist for front desk and admin duties. Organization and computer skills required.",
    },
    ka: {
      title: "ადმინისტრატორი",
      category: "ადმინისტრაცია",
      description:
        "გვჭირდება ადმინისტრატორი მიღებისა და ადმინისტრაციული საქმეებისთვის. საჭიროა ორგანიზებულობა და კომპიუტერული უნარები.",
    },
    skills: [
      { skillName: "Communication", weight: 5 },
      { skillName: "Organization", weight: 5 },
      { skillName: "Customer service", weight: 4 },
      { skillName: "Computer basics", weight: 4 },
      { skillName: "Multitasking", weight: 4 },
    ],
  },
  {
    slug: "delivery-courier",
    en: {
      title: "Delivery Courier",
      category: "Logistics",
      description:
        "We are looking for Delivery Couriers. Reliable, good with navigation and time management.",
    },
    ka: {
      title: "კურიერი",
      category: "ლოგისტიკა",
      description:
        "ვეძებთ კურიერებს. საიმედო, ნავიგაციასა და დროის მართვაში ძლიერი.",
    },
    skills: [
      { skillName: "Time management", weight: 5 },
      { skillName: "Navigation", weight: 4 },
      { skillName: "Customer service", weight: 4 },
      { skillName: "Reliability", weight: 5 },
      { skillName: "Problem solving", weight: 3 },
    ],
  },
  {
    slug: "kitchen-assistant",
    en: {
      title: "Kitchen Assistant",
      category: "Hospitality",
      description:
        "We need Kitchen Assistants to support food prep and cleanliness. Teamwork and following instructions essential.",
    },
    ka: {
      title: "სამზარეულოს დამხმარე",
      category: "სასტუმრო მომსახურება",
      description:
        "გვჭირდება სამზარეულოს დამხმარეები საკვების მომზადებისა და სისუფთავისთვის. საჭიროა გუნდური მუშაობა.",
    },
    skills: [
      { skillName: "Teamwork", weight: 5 },
      { skillName: "Cleanliness", weight: 5 },
      { skillName: "Speed & accuracy", weight: 4 },
      { skillName: "Following instructions", weight: 4 },
      { skillName: "Safety awareness", weight: 4 },
    ],
  },
  {
    slug: "cleaner",
    en: {
      title: "Cleaner",
      category: "Maintenance",
      description:
        "We are hiring Cleaners for maintaining our premises. Reliability and attention to detail required.",
    },
    ka: {
      title: "დამლაგებელი",
      category: "მომსახურება",
      description:
        "ვიყენებთ დამლაგებლებს ჩვენი ობიექტების სისუფთავისთვის. საჭიროა საიმედოობა და ზრუნვა დეტალებზე.",
    },
    skills: [
      { skillName: "Attention to detail", weight: 5 },
      { skillName: "Reliability", weight: 5 },
      { skillName: "Cleanliness", weight: 5 },
      { skillName: "Time management", weight: 4 },
      { skillName: "Physical stamina", weight: 3 },
    ],
  },
  {
    slug: "security-guard",
    en: {
      title: "Security Guard",
      category: "Security",
      description:
        "We seek Security Guards for site safety. Calm under pressure and good observation skills needed.",
    },
    ka: {
      title: "დაცვის თანამშრომელი",
      category: "უსაფრთხოება",
      description:
        "ვეძებთ დაცვის თანამშრომლებს ობიექტის უსაფრთხოებისთვის. საჭიროა მშვიდობა სტრესის დროს და დაკვირვება.",
    },
    skills: [
      { skillName: "Safety awareness", weight: 5 },
      { skillName: "Communication", weight: 4 },
      { skillName: "Observation", weight: 4 },
      { skillName: "Reliability", weight: 5 },
      { skillName: "Calm under pressure", weight: 5 },
    ],
  },
  {
    slug: "pharmacy-assistant",
    en: {
      title: "Pharmacy Assistant",
      category: "Healthcare",
      description:
        "We need a Pharmacy Assistant for customer service and organization. Attention to detail essential.",
    },
    ka: {
      title: "აფთიაქის დამხმარე",
      category: "ჯანდაცვა",
      description:
        "გვჭირდება აფთიაქის დამხმარე მომხმარებელთა მომსახურებისა და ორგანიზებას. საჭიროა ზრუნვა დეტალებზე.",
    },
    skills: [
      { skillName: "Attention to detail", weight: 5 },
      { skillName: "Customer service", weight: 5 },
      { skillName: "Communication", weight: 4 },
      { skillName: "Organization", weight: 4 },
      { skillName: "Reliability", weight: 4 },
    ],
  },
  {
    slug: "hotel-housekeeping",
    en: {
      title: "Hotel Housekeeping",
      category: "Hospitality",
      description:
        "We are hiring Hotel Housekeeping staff. Cleanliness and time management skills required.",
    },
    ka: {
      title: "სასტუმროს დამლაგებელი",
      category: "სასტუმრო მომსახურება",
      description:
        "ვიყენებთ სასტუმროს დამლაგებლებს. საჭიროა სისუფთავისა და დროის მართვის უნარები.",
    },
    skills: [
      { skillName: "Attention to detail", weight: 5 },
      { skillName: "Cleanliness", weight: 5 },
      { skillName: "Time management", weight: 4 },
      { skillName: "Reliability", weight: 4 },
      { skillName: "Physical stamina", weight: 3 },
    ],
  },
  {
    slug: "retail-merchandiser",
    en: {
      title: "Retail Merchandiser",
      category: "Retail",
      description:
        "We need Retail Merchandisers for product placement and displays. Organization and teamwork required.",
    },
    ka: {
      title: "საცალო მერჩანდაიზერი",
      category: "საცალო ვაჭრობა",
      description:
        "გვჭირდება საცალო მერჩანდაიზერები პროდუქტის განთავსებისთვის. საჭიროა ორგანიზებულობა და გუნდური მუშაობა.",
    },
    skills: [
      { skillName: "Organization", weight: 5 },
      { skillName: "Attention to detail", weight: 4 },
      { skillName: "Time management", weight: 4 },
      { skillName: "Teamwork", weight: 4 },
      { skillName: "Product placement", weight: 4 },
    ],
  },
  {
    slug: "junior-accountant",
    en: {
      title: "Junior Accountant",
      category: "Finance",
      description:
        "We seek a Junior Accountant. Excel basics and numeracy required. Attention to detail essential.",
    },
    ka: {
      title: "ქვემდეგრადული ბუღალტერი",
      category: "ფინანსები",
      description:
        "ვეძებთ ქვემდეგრადულ ბუღალტერს. საჭიროა Excel-ის საფუძვლები და მათემატიკური უნარები.",
    },
    skills: [
      { skillName: "Excel basics", weight: 5 },
      { skillName: "Attention to detail", weight: 5 },
      { skillName: "Organization", weight: 4 },
      { skillName: "Numeracy", weight: 5 },
      { skillName: "Time management", weight: 4 },
    ],
  },
  {
    slug: "office-assistant",
    en: {
      title: "Office Assistant",
      category: "Admin",
      description:
        "We are hiring an Office Assistant for admin support. Organization and computer skills needed.",
    },
    ka: {
      title: "ოფისის ასისტენტი",
      category: "ადმინისტრაცია",
      description:
        "ვიყენებთ ოფისის ასისტენტს ადმინისტრაციული მხარდაჭერისთვის. საჭიროა ორგანიზებულობა და კომპიუტერული უნარები.",
    },
    skills: [
      { skillName: "Organization", weight: 5 },
      { skillName: "Communication", weight: 4 },
      { skillName: "Computer basics", weight: 4 },
      { skillName: "Time management", weight: 4 },
      { skillName: "Reliability", weight: 4 },
    ],
  },
  {
    slug: "bartender",
    en: {
      title: "Bartender",
      category: "Hospitality",
      description:
        "We need a Bartender to prepare drinks and serve customers. Customer service and speed are essential.",
    },
    ka: {
      title: "ბარმენი",
      category: "სასტუმრო მომსახურება",
      description:
        "გვჭირდება ბარმენი სასმელების მომზადებისა და მომხმარებლების მომსახურებისთვის.",
    },
    skills: [
      { skillName: "Customer service", weight: 5 },
      { skillName: "Communication", weight: 4 },
      { skillName: "Speed & accuracy", weight: 4 },
      { skillName: "Teamwork", weight: 3 },
    ],
  },
  {
    slug: "line-cook",
    en: {
      title: "Chef / Line Cook",
      category: "Hospitality",
      description: "We are hiring Line Cooks for our kitchen. Teamwork and cleanliness required.",
    },
    ka: {
      title: "მზარეული / სამზარეულოს მუშა",
      category: "სასტუმრო მომსახურება",
      description: "ვიყენებთ მზარეულებს სამზარეულოში. საჭიროა გუნდური მუშაობა და სისუფთავე.",
    },
    skills: [
      { skillName: "Teamwork", weight: 5 },
      { skillName: "Cleanliness", weight: 5 },
      { skillName: "Following instructions", weight: 4 },
      { skillName: "Safety awareness", weight: 4 },
    ],
  },
  {
    slug: "data-entry-clerk",
    en: {
      title: "Data Entry Clerk",
      category: "Admin",
      description:
        "We need Data Entry Clerks for typing and data management. Attention to detail essential.",
    },
    ka: {
      title: "მონაცემთა შემომავალი",
      category: "ადმინისტრაცია",
      description: "გვჭირდება მონაცემთა შემომავალი. საჭიროა ზრუნვა დეტალებზე და სიჩქარე.",
    },
    skills: [
      { skillName: "Typing", weight: 5 },
      { skillName: "Attention to detail", weight: 5 },
      { skillName: "Organization", weight: 4 },
      { skillName: "Computer basics", weight: 4 },
    ],
  },
  {
    slug: "driver",
    en: {
      title: "Driver",
      category: "Logistics",
      description:
        "We are looking for reliable Drivers. Good navigation and time management skills needed.",
    },
    ka: {
      title: "მძღოლი",
      category: "ლოგისტიკა",
      description: "ვეძებთ საიმედო მძღოლებს. საჭიროა ნავიგაცია და დროის მართვა.",
    },
    skills: [
      { skillName: "Reliability", weight: 5 },
      { skillName: "Time management", weight: 5 },
      { skillName: "Navigation", weight: 4 },
      { skillName: "Safety awareness", weight: 5 },
    ],
  },
  {
    slug: "hotel-front-desk",
    en: {
      title: "Hotel Front Desk Agent",
      category: "Hospitality",
      description:
        "We need Hotel Front Desk staff for guest check-in and support. Customer service skills required.",
    },
    ka: {
      title: "სასტუმროს მიღების თანამშრომელი",
      category: "სასტუმრო მომსახურება",
      description: "გვჭირდება სასტუმროს მიღების თანამშრომლები. საჭიროა მომხმარებელთა მომსახურება.",
    },
    skills: [
      { skillName: "Customer service", weight: 5 },
      { skillName: "Communication", weight: 5 },
      { skillName: "Organization", weight: 4 },
      { skillName: "Computer basics", weight: 4 },
    ],
  },
  {
    slug: "nanny",
    en: {
      title: "Nanny / Childcare",
      category: "Care",
      description: "We seek a reliable Nanny for childcare. Patience and reliability essential.",
    },
    ka: {
      title: "ნიანა / ბავშვების მოვლა",
      category: "მოვლა",
      description: "ვეძებთ საიმედო ნიანას. საჭიროა მოთმინება და საიმედოობა.",
    },
    skills: [
      { skillName: "Patience", weight: 5 },
      { skillName: "Communication", weight: 4 },
      { skillName: "Reliability", weight: 5 },
      { skillName: "Organization", weight: 3 },
    ],
  },
  {
    slug: "stock-associate",
    en: {
      title: "Stock Associate",
      category: "Retail",
      description:
        "We need Stock Associates for inventory and shelf restocking. Physical stamina and attention to detail required.",
    },
    ka: {
      title: "საწყობის ასისტენტი",
      category: "საცალო ვაჭრობა",
      description: "გვჭირდება საწყობის ასისტენტები. საჭიროა ფიზიკური გამძლეობა და ზრუნვა დეტალებზე.",
    },
    skills: [
      { skillName: "Physical stamina", weight: 4 },
      { skillName: "Attention to detail", weight: 5 },
      { skillName: "Teamwork", weight: 4 },
      { skillName: "Organization", weight: 4 },
    ],
  },
  {
    slug: "restaurant-host",
    en: {
      title: "Restaurant Host",
      category: "Hospitality",
      description:
        "We are hiring Restaurant Hosts to greet guests and manage seating. Customer service and organization required.",
    },
    ka: {
      title: "რესტორანის მასპინძელი",
      category: "სასტუმრო მომსახურება",
      description:
        "ვიყენებთ რესტორანის მასპინძლებს. საჭიროა მომხმარებელთა მომსახურება და ორგანიზებულობა.",
    },
    skills: [
      { skillName: "Customer service", weight: 5 },
      { skillName: "Communication", weight: 4 },
      { skillName: "Organization", weight: 4 },
      { skillName: "Teamwork", weight: 3 },
    ],
  },
  {
    slug: "construction-laborer",
    en: {
      title: "Construction Laborer",
      category: "Construction",
      description: "We need Construction Laborers. Physical stamina and safety awareness required.",
    },
    ka: {
      title: "სამშენებლო მუშა",
      category: "მშენებლობა",
      description: "გვჭირდება სამშენებლო მუშები. საჭიროა ფიზიკური გამძლეობა და უსაფრთხოებაზე ზრუნვა.",
    },
    skills: [
      { skillName: "Physical stamina", weight: 5 },
      { skillName: "Teamwork", weight: 4 },
      { skillName: "Safety awareness", weight: 5 },
      { skillName: "Following instructions", weight: 4 },
    ],
  },
  {
    slug: "event-staff",
    en: {
      title: "Event Staff",
      category: "Hospitality",
      description:
        "We hire Event Staff for conferences and events. Customer service and flexibility required.",
    },
    ka: {
      title: "ივენთის თანამშრომელი",
      category: "სასტუმრო მომსახურება",
      description:
        "ვიყენებთ ივენთის თანამშრომლებს. საჭიროა მომხმარებელთა მომსახურება და მოქნილობა.",
    },
    skills: [
      { skillName: "Customer service", weight: 5 },
      { skillName: "Teamwork", weight: 5 },
      { skillName: "Flexibility", weight: 3 },
      { skillName: "Communication", weight: 4 },
    ],
  },
  {
    slug: "packer",
    en: {
      title: "Packer",
      category: "Logistics",
      description: "We need Packers. Attention to detail and speed required.",
    },
    ka: {
      title: "შეფუთვის მუშა",
      category: "ლოგისტიკა",
      description: "გვჭირდება შეფუთვის მუშები. საჭიროა ზრუნვა დეტალებზე და სიჩქარე.",
    },
    skills: [
      { skillName: "Attention to detail", weight: 5 },
      { skillName: "Speed & accuracy", weight: 4 },
      { skillName: "Teamwork", weight: 4 },
    ],
  },
];

async function main() {
  console.log(`Seeding ${STARTER_ROLES.length} job role templates (en + ka)...`);

  for (const role of STARTER_ROLES) {
    await upsertRoleWithSkills(role, "en");
    await upsertRoleWithSkills(role, "ka");
    console.log(`  ✓ ${role.slug}`);
  }

  const enCount = await prisma.jobRoleTemplate.count({ where: { locale: "en" } });
  const kaCount = await prisma.jobRoleTemplate.count({ where: { locale: "ka" } });
  const skillCount = await prisma.roleSkillTemplate.count();

  console.log(
    `Done. Templates: ${enCount} en, ${kaCount} ka (${STARTER_ROLES.length} slugs each). Skills: ${skillCount} total rows.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
