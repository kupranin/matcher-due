/**
 * Seed script — run with: npm run db:seed
 * Populates the database with sample data for development.
 *
 * Seeded users (password for both: password123):
 *   Candidate: nino@example.com
 *   Employer:  hr@coffeelab.ge
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";

// Use direct DB URL for seeding to avoid pooler timeouts (Supabase)
const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
const prisma = new PrismaClient(
  dbUrl ? { datasources: { db: { url: dbUrl } } } : undefined
);

const SEED_PASSWORD = "password123";
const passwordHash = hashSync(SEED_PASSWORD, 10);

async function main() {
  console.log("Connecting to database...");
  await prisma.$connect();
  console.log("Seeding database...");

  // Create candidate user + profile
  console.log("  Creating candidate user nino@example.com...");
  const candidateUser = await prisma.user.upsert({
    where: { email: "nino@example.com" },
    update: { passwordHash },
    create: {
      email: "nino@example.com",
      passwordHash,
      role: "CANDIDATE",
    },
  });

  console.log("  Creating candidate profile...");
  const candidateProfile = await prisma.candidateProfile.upsert({
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

  await prisma.candidateSkill.createMany({
    data: [
      { candidateProfileId: candidateProfile.id, name: "Customer service", level: "Intermediate" },
      { candidateProfileId: candidateProfile.id, name: "Coffee preparation", level: "Intermediate" },
      { candidateProfileId: candidateProfile.id, name: "Cash handling", level: "Advanced" },
    ],
    skipDuplicates: true,
  });

  // Create employer user + company
  console.log("  Creating employer user hr@coffeelab.ge...");
  const employerUser = await prisma.user.upsert({
    where: { email: "hr@coffeelab.ge" },
    update: { passwordHash },
    create: {
      email: "hr@coffeelab.ge",
      passwordHash,
      role: "EMPLOYER",
    },
  });

  console.log("  Creating company...");
  const company = await prisma.company.upsert({
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

  console.log("  Creating subscription...");
  // Create subscription
  const validUntil = new Date();
  validUntil.setFullYear(validUntil.getFullYear() + 1);
  await prisma.subscription.upsert({
    where: { id: "seed-sub-1" },
    update: {},
    create: {
      id: "seed-sub-1",
      companyId: company.id,
      packageType: "5",
      pricePaid: 170,
      validUntil,
      vacanciesUsed: 2,
      vacanciesTotal: 5,
    },
  });

  console.log("  Creating vacancy...");
  // Create vacancy
  const vacancy = await prisma.vacancy.create({
    data: {
      companyId: company.id,
      title: "Barista",
      locationCityId: "tbilisi",
      salaryMin: 1200,
      salaryMax: 1500,
      workType: "Full-time",
      isRemote: false,
      requiredExperienceMonths: 6,
      requiredEducationLevel: "High School",
      description: "We are looking for a Barista to prepare coffee and serve customers.",
      status: "PUBLISHED",
    },
  });

  await prisma.vacancySkill.createMany({
    data: [
      { vacancyId: vacancy.id, name: "Customer service", level: "Intermediate", weight: 5 },
      { vacancyId: vacancy.id, name: "Coffee preparation", level: "Intermediate", weight: 5 },
      { vacancyId: vacancy.id, name: "Cash handling", level: "Intermediate", weight: 3 },
    ],
    skipDuplicates: true,
  });

  // Create another vacancy (Cashier)
  const vacancy2 = await prisma.vacancy.create({
    data: {
      companyId: company.id,
      title: "Cashier",
      locationCityId: "tbilisi",
      salaryMin: 900,
      salaryMax: 1100,
      workType: "Part-time",
      isRemote: false,
      requiredExperienceMonths: 0,
      requiredEducationLevel: "High School",
      description: "We need a Cashier for point-of-sale and customer service.",
      status: "PUBLISHED",
    },
  });

  await prisma.vacancySkill.createMany({
    data: [
      { vacancyId: vacancy2.id, name: "Cash handling", level: "Intermediate", weight: 5 },
      { vacancyId: vacancy2.id, name: "Attention to detail", level: "Intermediate", weight: 4 },
      { vacancyId: vacancy2.id, name: "Customer service", level: "Beginner", weight: 3 },
    ],
    skipDuplicates: true,
  });

  // Create more candidate profiles for employer swipe deck
  const candidates = [
    {
      fullName: "Giorgi M.",
      jobTitle: "Cashier",
      locationCityId: "tbilisi",
      salaryMin: 900,
      experienceMonths: 6,
      skills: [
        { name: "Cash handling", level: "Intermediate" },
        { name: "Attention to detail", level: "Intermediate" },
        { name: "Customer service", level: "Intermediate" },
      ],
    },
    {
      fullName: "Mariam T.",
      jobTitle: "Receptionist",
      locationCityId: "batumi",
      salaryMin: 1000,
      experienceMonths: 8,
      skills: [
        { name: "Communication", level: "Advanced" },
        { name: "Organization", level: "Intermediate" },
        { name: "MS Office", level: "Intermediate" },
      ],
    },
  ];

  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i];
    const email = `candidate${i + 2}@example.com`;
    const u = await prisma.user.upsert({
      where: { email },
      update: { passwordHash },
      create: {
        email,
        passwordHash,
        role: "CANDIDATE",
      },
    });
    const cp = await prisma.candidateProfile.upsert({
      where: { userId: u.id },
      update: {},
      create: {
        userId: u.id,
        fullName: c.fullName,
        locationCityId: c.locationCityId,
        salaryMin: c.salaryMin,
        experienceMonths: c.experienceMonths,
        educationLevel: "High School",
        workTypes: ["Full-time", "Part-time"],
        jobTitle: c.jobTitle,
      },
    });
    await prisma.candidateSkill.createMany({
      data: c.skills.map((s) => ({ candidateProfileId: cp.id, ...s })),
      skipDuplicates: true,
    });
  }

  // ——— Job Role Templates (EN + KA) ———
  const JOB_TEMPLATES: Array<{
    slug: string;
    en: { title: string; category: string; description: string };
    ka: { title: string; category: string; description: string };
    skills: string[];
  }> = [
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
      skills: ["Customer service", "Coffee preparation", "Speed & accuracy", "Cash handling", "Cleanliness"],
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
      skills: ["Cash handling", "Attention to detail", "Customer service", "Speed & accuracy", "POS systems"],
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
      skills: ["Customer service", "Communication", "Time management", "Teamwork", "Upselling"],
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
      skills: ["Communication", "Upselling", "Customer service", "Product knowledge", "Problem solving"],
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
          "გვჭირდება სატელეფონო ოპერატორები მომხმარებელთა მხარდაჭერისთვის. საჭიროა კომუნიკაცია და მომთმენი.",
      },
      skills: ["Communication", "Active listening", "Typing", "Problem solving", "Patience"],
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
      skills: ["Physical stamina", "Attention to detail", "Teamwork", "Time management", "Safety awareness"],
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
      skills: ["Communication", "Organization", "Customer service", "Computer basics", "Multitasking"],
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
      skills: ["Time management", "Navigation", "Customer service", "Reliability", "Problem solving"],
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
      skills: ["Teamwork", "Cleanliness", "Speed & accuracy", "Following instructions", "Safety awareness"],
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
      skills: ["Attention to detail", "Reliability", "Cleanliness", "Time management", "Physical stamina"],
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
      skills: ["Safety awareness", "Communication", "Observation", "Reliability", "Calm under pressure"],
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
      skills: ["Attention to detail", "Customer service", "Communication", "Organization", "Reliability"],
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
      skills: ["Attention to detail", "Cleanliness", "Time management", "Reliability", "Physical stamina"],
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
      skills: ["Organization", "Attention to detail", "Time management", "Teamwork", "Product placement"],
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
      skills: ["Excel basics", "Attention to detail", "Organization", "Numeracy", "Time management"],
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
      skills: ["Organization", "Communication", "Computer basics", "Time management", "Reliability"],
    },
  ];

  // Georgian skill name equivalents for KA templates
  const SKILL_KA: Record<string, string> = {
    "Customer service": "მომხმარებელთა მომსახურება",
    "Coffee preparation": "ყავის მომზადება",
    "Speed & accuracy": "სიჩქარე და სიზუსტე",
    "Cash handling": "ნაღდი ფულის მუშაობა",
    Cleanliness: "სისუფთავე",
    "Attention to detail": "ზრუნვა დეტალებზე",
    "POS systems": "პოს სისტემები",
    Communication: "კომუნიკაცია",
    "Time management": "დროის მართვა",
    Teamwork: "გუნდური მუშაობა",
    Upselling: "დამატებითი გაყიდვა",
    "Product knowledge": "პროდუქტის ცოდნა",
    "Problem solving": "პრობლემის გადაჭრა",
    "Active listening": "აქტიური მოსმენა",
    Typing: "ბეჭდვა",
    Patience: "მომთმენი",
    "Physical stamina": "ფიზიკური გამძლეობა",
    "Safety awareness": "უსაფრთხოების ცნობიერება",
    Organization: "ორგანიზებულობა",
    "Computer basics": "კომპიუტერის საფუძვლები",
    Multitasking: "მრავალამოცანიანობა",
    Navigation: "ნავიგაცია",
    Reliability: "საიმედოობა",
    "Following instructions": "ინსტრუქციების შესრულება",
    Observation: "დაკვირვება",
    "Calm under pressure": "მშვიდობა სტრესის დროს",
    "Excel basics": "Excel საფუძვლები",
    Numeracy: "რიცხვითი უნარები",
    "Product placement": "პროდუქტის განთავსება",
  };

  for (const tmpl of JOB_TEMPLATES) {
    for (const locale of ["en", "ka"] as const) {
      const t = locale === "en" ? tmpl.en : tmpl.ka;
      const role = await prisma.jobRoleTemplate.upsert({
        where: { slug_locale: { slug: tmpl.slug, locale } },
        update: {},
        create: {
          slug: tmpl.slug,
          locale,
          title: t.title,
          category: t.category,
          description: t.description,
        },
      });
      const skillWeight = 3;
      for (let i = 0; i < tmpl.skills.length; i++) {
        const skillEn = tmpl.skills[i];
        const skillKa = SKILL_KA[skillEn] ?? skillEn;
        const skillName = locale === "en" ? skillEn : skillKa;
        await prisma.roleSkillTemplate.upsert({
          where: { id: `${tmpl.slug}-${locale}-${i}` },
          update: { skillName, weight: 5 - Math.floor(i / 2) || skillWeight },
          create: {
            id: `${tmpl.slug}-${locale}-${i}`,
            roleId: role.id,
            skillName,
            weight: 5 - Math.floor(i / 2) || skillWeight,
          },
        });
      }
    }
  }

  console.log("Seed complete.");
  console.log("You can log in with: nino@example.com (candidate) or hr@coffeelab.ge (employer), password: password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
