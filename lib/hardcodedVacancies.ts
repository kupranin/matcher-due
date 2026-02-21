/**
 * 200 hardcoded vacancy cards for candidate swipe deck.
 * Used until database is available. Replaces the 6-item mock.
 */

import type { VacancyProfile } from "./matchCalculation";
import { GEORGIAN_CITIES } from "./georgianLocations";

export interface VacancyCard {
  id: string;
  title: string;
  company: string;
  location: string;
  workType: string;
  salary: string;
  photo: string;
  profile: VacancyProfile;
}

type SkillLevel = "Beginner" | "Intermediate" | "Advanced";

const CITIES = GEORGIAN_CITIES;

const COMPANIES = [
  "Coffee Lab", "Carrefour", "SPAR", "Nikora", "Wissol", "Gulf", "Socar",
  "Hotel Role", "Tech Support Co", "Logistics Plus", "Phoenix Pharma",
  "Silk Road Hotel", "Batumi Mall", "Tbilisi Mall", "East Point",
  "Goodwill", "Smart", "Gigant", "Populi", "Gurieli", "Kaufland",
  "McDonald's", "KFC", "Wendy's", "Pizza Hut", "Domino's",
  "Batumi Plaza", "Radisson", "Holiday Inn", "Courtyard", "Ibis",
  "UGT", "Bank of Georgia", "TBC Bank", "Liberty Bank",
  "PharmaPlus", "GPC", "PSP", "Aversi", "Galderma",
  "DHL", "Glovo", "Wolt", "Bolt", "Yandex",
  "Gita", "Tegeta", "Wissol Petroleum", "Rompetrol",
  "Adjara Group", "GEO Hospitals", "Imedi", "Rustavi 2",
  "Georgian Wine", "Kindzmarauli", "Telavi Wine", "Chateau Mukhrani",
  "Evex", "Curatio", "PSP Pharmacy", "GPC Medical",
  "Grand Hotel", "Betsy's Hotel", "Rooms Hotel", "Stamba",
  "Fabrika", "Factory Tbilisi", "Muse", "Linville",
  "Lilo Mall", "City Mall", "Galleria", "Tbilisi Central",
  "Château", "Café Litera", "Entree", "Shavi Lomi",
  "Magniti", "Crystal", "Fresco", "Europroduct",
  "Optima", "Elit Electronics", "Techno Market", "iTechnics",
  "Construction Pro", "Roads Dept", "Hydro Power", "Trans Electrica",
  "Clean Service", "Mega Clean", "Sparkle Co", "Fresh Office",
];

const JOB_TEMPLATES: {
  title: string;
  slug: string;
  salaryBase: number;
  salaryRange: number;
  photos: string[];
  skills: { name: string; level: SkillLevel; weight: number }[];
}[] = [
  {
    title: "Barista",
    slug: "barista",
    salaryBase: 1100,
    salaryRange: 400,
    photos: [
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&q=80",
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500&q=80",
      "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=500&q=80",
    ],
    skills: [
      { name: "Customer service", level: "Intermediate", weight: 5 },
      { name: "Coffee preparation", level: "Intermediate", weight: 5 },
      { name: "Cash handling", level: "Intermediate", weight: 3 },
    ],
  },
  {
    title: "Cashier",
    slug: "cashier",
    salaryBase: 900,
    salaryRange: 300,
    photos: [
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&q=80",
      "https://images.unsplash.com/photo-1585916420730-d7f95e942d43?w=500&q=80",
      "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=500&q=80",
    ],
    skills: [
      { name: "Cash handling", level: "Intermediate", weight: 5 },
      { name: "Attention to detail", level: "Intermediate", weight: 4 },
      { name: "Customer service", level: "Beginner", weight: 3 },
    ],
  },
  {
    title: "Waiter/Waitress",
    slug: "waiter",
    salaryBase: 1000,
    salaryRange: 350,
    photos: [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80",
      "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=500&q=80",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500&q=80",
    ],
    skills: [
      { name: "Customer service", level: "Intermediate", weight: 5 },
      { name: "Communication", level: "Intermediate", weight: 4 },
      { name: "Teamwork", level: "Intermediate", weight: 3 },
    ],
  },
  {
    title: "Sales Associate",
    slug: "sales-associate",
    salaryBase: 900,
    salaryRange: 300,
    photos: [
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&q=80",
      "https://images.unsplash.com/photo-1556742111-a301076d9d18?w=500&q=80",
      "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=500&q=80",
    ],
    skills: [
      { name: "Communication", level: "Intermediate", weight: 4 },
      { name: "Customer service", level: "Beginner", weight: 4 },
      { name: "Upselling", level: "Beginner", weight: 2 },
    ],
  },
  {
    title: "Call Center Agent",
    slug: "call-center-agent",
    salaryBase: 1100,
    salaryRange: 400,
    photos: [
      "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=500&q=80",
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&q=80",
      "https://images.unsplash.com/photo-1587563871167-1ee9e731abc?w=500&q=80",
    ],
    skills: [
      { name: "Communication", level: "Intermediate", weight: 5 },
      { name: "Typing", level: "Intermediate", weight: 4 },
      { name: "Patience", level: "Beginner", weight: 2 },
    ],
  },
  {
    title: "Warehouse Worker",
    slug: "warehouse-worker",
    salaryBase: 1000,
    salaryRange: 300,
    photos: [
      "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=500&q=80",
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&q=80",
      "https://images.unsplash.com/photo-1605812860427-4024433a70fd?w=500&q=80",
    ],
    skills: [
      { name: "Physical stamina", level: "Intermediate", weight: 4 },
      { name: "Teamwork", level: "Beginner", weight: 3 },
      { name: "Attention to detail", level: "Beginner", weight: 2 },
    ],
  },
  {
    title: "Receptionist",
    slug: "receptionist",
    salaryBase: 1200,
    salaryRange: 400,
    photos: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&q=80",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=500&q=80",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&q=80",
    ],
    skills: [
      { name: "Communication", level: "Intermediate", weight: 5 },
      { name: "Organization", level: "Intermediate", weight: 4 },
      { name: "MS Office", level: "Beginner", weight: 3 },
    ],
  },
  {
    title: "Delivery Courier",
    slug: "delivery-courier",
    salaryBase: 900,
    salaryRange: 300,
    photos: [
      "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=500&q=80",
      "https://images.unsplash.com/photo-1553413077-190dd305871c?w=500&q=80",
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&q=80",
    ],
    skills: [
      { name: "Time management", level: "Intermediate", weight: 5 },
      { name: "Navigation", level: "Intermediate", weight: 4 },
      { name: "Customer service", level: "Beginner", weight: 3 },
    ],
  },
  {
    title: "Kitchen Assistant",
    slug: "kitchen-assistant",
    salaryBase: 850,
    salaryRange: 250,
    photos: [
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500&q=80",
      "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=500&q=80",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&q=80",
    ],
    skills: [
      { name: "Teamwork", level: "Intermediate", weight: 5 },
      { name: "Cleanliness", level: "Intermediate", weight: 5 },
      { name: "Following instructions", level: "Beginner", weight: 4 },
    ],
  },
  {
    title: "Cleaner",
    slug: "cleaner",
    salaryBase: 750,
    salaryRange: 200,
    photos: [
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&q=80",
      "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=500&q=80",
      "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500&q=80",
    ],
    skills: [
      { name: "Attention to detail", level: "Intermediate", weight: 5 },
      { name: "Cleanliness", level: "Intermediate", weight: 5 },
      { name: "Reliability", level: "Intermediate", weight: 4 },
    ],
  },
  {
    title: "Security Guard",
    slug: "security-guard",
    salaryBase: 1100,
    salaryRange: 300,
    photos: [
      "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=500&q=80",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80",
      "https://images.unsplash.com/photo-1551884170-09fb70a3a2ed?w=500&q=80",
    ],
    skills: [
      { name: "Safety awareness", level: "Intermediate", weight: 5 },
      { name: "Communication", level: "Intermediate", weight: 4 },
      { name: "Observation", level: "Intermediate", weight: 4 },
    ],
  },
  {
    title: "Pharmacy Assistant",
    slug: "pharmacy-assistant",
    salaryBase: 1200,
    salaryRange: 400,
    photos: [
      "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=500&q=80",
      "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=500&q=80",
      "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=500&q=80",
    ],
    skills: [
      { name: "Attention to detail", level: "Intermediate", weight: 5 },
      { name: "Customer service", level: "Intermediate", weight: 5 },
      { name: "Organization", level: "Intermediate", weight: 4 },
    ],
  },
  {
    title: "Hotel Housekeeping",
    slug: "hotel-housekeeping",
    salaryBase: 850,
    salaryRange: 250,
    photos: [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=500&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&q=80",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500&q=80",
    ],
    skills: [
      { name: "Attention to detail", level: "Intermediate", weight: 5 },
      { name: "Cleanliness", level: "Intermediate", weight: 5 },
      { name: "Time management", level: "Beginner", weight: 4 },
    ],
  },
  {
    title: "Retail Merchandiser",
    slug: "retail-merchandiser",
    salaryBase: 950,
    salaryRange: 300,
    photos: [
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&q=80",
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&q=80",
      "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=500&q=80",
    ],
    skills: [
      { name: "Organization", level: "Intermediate", weight: 5 },
      { name: "Attention to detail", level: "Intermediate", weight: 4 },
      { name: "Teamwork", level: "Beginner", weight: 4 },
    ],
  },
  {
    title: "Junior Accountant",
    slug: "junior-accountant",
    salaryBase: 1500,
    salaryRange: 500,
    photos: [
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=500&q=80",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&q=80",
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&q=80",
    ],
    skills: [
      { name: "Excel basics", level: "Intermediate", weight: 5 },
      { name: "Attention to detail", level: "Intermediate", weight: 5 },
      { name: "Numeracy", level: "Intermediate", weight: 5 },
    ],
  },
  {
    title: "Office Assistant",
    slug: "office-assistant",
    salaryBase: 1100,
    salaryRange: 350,
    photos: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&q=80",
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&q=80",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=500&q=80",
    ],
    skills: [
      { name: "Organization", level: "Intermediate", weight: 5 },
      { name: "Communication", level: "Intermediate", weight: 4 },
      { name: "Computer basics", level: "Intermediate", weight: 4 },
    ],
  },
  {
    title: "Bartender",
    slug: "bartender",
    salaryBase: 1000,
    salaryRange: 400,
    photos: [
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=500&q=80",
      "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=500&q=80",
      "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=500&q=80",
    ],
    skills: [
      { name: "Customer service", level: "Intermediate", weight: 5 },
      { name: "Communication", level: "Intermediate", weight: 4 },
      { name: "Speed & accuracy", level: "Intermediate", weight: 4 },
    ],
  },
  {
    title: "Chef / Line Cook",
    slug: "line-cook",
    salaryBase: 950,
    salaryRange: 350,
    photos: [
      "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=500&q=80",
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500&q=80",
      "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=500&q=80",
    ],
    skills: [
      { name: "Teamwork", level: "Intermediate", weight: 5 },
      { name: "Cleanliness", level: "Intermediate", weight: 5 },
      { name: "Following instructions", level: "Intermediate", weight: 4 },
    ],
  },
  {
    title: "Data Entry Clerk",
    slug: "data-entry-clerk",
    salaryBase: 900,
    salaryRange: 300,
    photos: [
      "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=500&q=80",
      "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=500&q=80",
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=500&q=80",
    ],
    skills: [
      { name: "Typing", level: "Intermediate", weight: 5 },
      { name: "Attention to detail", level: "Intermediate", weight: 5 },
      { name: "Organization", level: "Beginner", weight: 4 },
    ],
  },
  {
    title: "Driver",
    slug: "driver",
    salaryBase: 1000,
    salaryRange: 400,
    photos: [
      "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=500&q=80",
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500&q=80",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80",
    ],
    skills: [
      { name: "Reliability", level: "Intermediate", weight: 5 },
      { name: "Time management", level: "Intermediate", weight: 5 },
      { name: "Navigation", level: "Intermediate", weight: 4 },
    ],
  },
  {
    title: "Hotel Front Desk Agent",
    slug: "hotel-front-desk",
    salaryBase: 1100,
    salaryRange: 400,
    photos: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&q=80",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=500&q=80",
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=500&q=80",
    ],
    skills: [
      { name: "Customer service", level: "Intermediate", weight: 5 },
      { name: "Communication", level: "Intermediate", weight: 5 },
      { name: "Organization", level: "Intermediate", weight: 4 },
    ],
  },
  {
    title: "Nanny / Childcare",
    slug: "nanny",
    salaryBase: 800,
    salaryRange: 400,
    photos: [
      "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=500&q=80",
      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=500&q=80",
      "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=500&q=80",
    ],
    skills: [
      { name: "Patience", level: "Intermediate", weight: 5 },
      { name: "Communication", level: "Intermediate", weight: 4 },
      { name: "Reliability", level: "Intermediate", weight: 5 },
    ],
  },
  {
    title: "Stock Associate",
    slug: "stock-associate",
    salaryBase: 850,
    salaryRange: 250,
    photos: [
      "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=500&q=80",
      "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=500&q=80",
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&q=80",
    ],
    skills: [
      { name: "Physical stamina", level: "Intermediate", weight: 4 },
      { name: "Attention to detail", level: "Intermediate", weight: 5 },
      { name: "Teamwork", level: "Beginner", weight: 4 },
    ],
  },
  {
    title: "Restaurant Host",
    slug: "restaurant-host",
    salaryBase: 900,
    salaryRange: 300,
    photos: [
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500&q=80",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80",
      "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=500&q=80",
    ],
    skills: [
      { name: "Customer service", level: "Intermediate", weight: 5 },
      { name: "Communication", level: "Intermediate", weight: 4 },
      { name: "Organization", level: "Beginner", weight: 4 },
    ],
  },
  {
    title: "Construction Laborer",
    slug: "construction-laborer",
    salaryBase: 1000,
    salaryRange: 400,
    photos: [
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&q=80",
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&q=80",
      "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=500&q=80",
    ],
    skills: [
      { name: "Physical stamina", level: "Intermediate", weight: 5 },
      { name: "Teamwork", level: "Intermediate", weight: 4 },
      { name: "Safety awareness", level: "Intermediate", weight: 5 },
    ],
  },
  {
    title: "Event Staff",
    slug: "event-staff",
    salaryBase: 800,
    salaryRange: 350,
    photos: [
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&q=80",
      "https://images.unsplash.com/photo-1511578314322-379afb476865?w=500&q=80",
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=500&q=80",
    ],
    skills: [
      { name: "Customer service", level: "Intermediate", weight: 5 },
      { name: "Teamwork", level: "Intermediate", weight: 5 },
      { name: "Flexibility", level: "Beginner", weight: 3 },
    ],
  },
  {
    title: "Laundry Worker",
    slug: "laundry-worker",
    salaryBase: 700,
    salaryRange: 200,
    photos: [
      "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=500&q=80",
      "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=500&q=80",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=500&q=80",
    ],
    skills: [
      { name: "Attention to detail", level: "Intermediate", weight: 5 },
      { name: "Reliability", level: "Intermediate", weight: 5 },
      { name: "Physical stamina", level: "Beginner", weight: 3 },
    ],
  },
  {
    title: "Handyman",
    slug: "handyman",
    salaryBase: 1000,
    salaryRange: 400,
    photos: [
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&q=80",
      "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=500&q=80",
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&q=80",
    ],
    skills: [
      { name: "Problem solving", level: "Intermediate", weight: 5 },
      { name: "Reliability", level: "Intermediate", weight: 5 },
      { name: "Following instructions", level: "Intermediate", weight: 4 },
    ],
  },
  {
    title: "Teaching Assistant",
    slug: "teaching-assistant",
    salaryBase: 900,
    salaryRange: 400,
    photos: [
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&q=80",
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=500&q=80",
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&q=80",
    ],
    skills: [
      { name: "Communication", level: "Intermediate", weight: 5 },
      { name: "Patience", level: "Intermediate", weight: 5 },
      { name: "Organization", level: "Intermediate", weight: 4 },
    ],
  },
  { title: "Gardener", slug: "gardener", salaryBase: 750, salaryRange: 250, photos: ["https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&q=80", "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=500&q=80", "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=500&q=80"], skills: [{ name: "Physical stamina", level: "Intermediate", weight: 5 }, { name: "Attention to detail", level: "Intermediate", weight: 4 }, { name: "Reliability", level: "Intermediate", weight: 4 }] },
  { title: "Painter", slug: "painter", salaryBase: 900, salaryRange: 350, photos: ["https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500&q=80", "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=500&q=80", "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=500&q=80"], skills: [{ name: "Attention to detail", level: "Intermediate", weight: 5 }, { name: "Following instructions", level: "Intermediate", weight: 4 }, { name: "Physical stamina", level: "Beginner", weight: 3 }] },
  { title: "Pet Groomer", slug: "pet-groomer", salaryBase: 800, salaryRange: 300, photos: ["https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=500&q=80", "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=500&q=80", "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=500&q=80"], skills: [{ name: "Patience", level: "Intermediate", weight: 5 }, { name: "Customer service", level: "Intermediate", weight: 4 }, { name: "Attention to detail", level: "Intermediate", weight: 4 }] },
  { title: "Tailor / Seamstress", slug: "tailor", salaryBase: 850, salaryRange: 350, photos: ["https://images.unsplash.com/photo-1558171813-4c088753af8f?w=500&q=80", "https://images.unsplash.com/photo-1558769132-cb1aea913ec9?w=500&q=80", "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=500&q=80"], skills: [{ name: "Attention to detail", level: "Intermediate", weight: 5 }, { name: "Following instructions", level: "Intermediate", weight: 4 }, { name: "Organization", level: "Beginner", weight: 3 }] },
  { title: "Hotel Bellhop", slug: "hotel-bellhop", salaryBase: 850, salaryRange: 300, photos: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&q=80", "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=500&q=80", "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500&q=80"], skills: [{ name: "Customer service", level: "Intermediate", weight: 5 }, { name: "Physical stamina", level: "Beginner", weight: 4 }, { name: "Teamwork", level: "Intermediate", weight: 4 }] },
  { title: "Bakery Assistant", slug: "bakery-assistant", salaryBase: 900, salaryRange: 300, photos: ["https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80", "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&q=80", "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&q=80"], skills: [{ name: "Cleanliness", level: "Intermediate", weight: 5 }, { name: "Following instructions", level: "Intermediate", weight: 5 }, { name: "Teamwork", level: "Beginner", weight: 4 }] },
  { title: "Grocery Clerk", slug: "grocery-clerk", salaryBase: 850, salaryRange: 250, photos: ["https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=500&q=80", "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&q=80", "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=500&q=80"], skills: [{ name: "Customer service", level: "Intermediate", weight: 5 }, { name: "Attention to detail", level: "Intermediate", weight: 4 }, { name: "Teamwork", level: "Beginner", weight: 4 }] },
  { title: "Fuel Station Attendant", slug: "fuel-station-attendant", salaryBase: 900, salaryRange: 300, photos: ["https://images.unsplash.com/photo-1625047509168-eb4c2b2c555d?w=500&q=80", "https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=500&q=80", "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80"], skills: [{ name: "Cash handling", level: "Intermediate", weight: 5 }, { name: "Customer service", level: "Intermediate", weight: 4 }, { name: "Reliability", level: "Intermediate", weight: 5 }] },
  { title: "Car Wash Attendant", slug: "car-wash-attendant", salaryBase: 750, salaryRange: 250, photos: ["https://images.unsplash.com/photo-1607860108855-64b4c54f2a5c?w=500&q=80", "https://images.unsplash.com/photo-1625047509168-eb4c2b2c555d?w=500&q=80", "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=500&q=80"], skills: [{ name: "Attention to detail", level: "Intermediate", weight: 5 }, { name: "Physical stamina", level: "Beginner", weight: 4 }, { name: "Reliability", level: "Intermediate", weight: 4 }] },
  { title: "Concierge", slug: "concierge", salaryBase: 1100, salaryRange: 400, photos: ["https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=500&q=80", "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=500&q=80", "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=500&q=80"], skills: [{ name: "Customer service", level: "Intermediate", weight: 5 }, { name: "Communication", level: "Intermediate", weight: 5 }, { name: "Organization", level: "Intermediate", weight: 4 }] },
  { title: "Tour Guide", slug: "tour-guide", salaryBase: 1000, salaryRange: 500, photos: ["https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=500&q=80", "https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=500&q=80", "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=500&q=80"], skills: [{ name: "Communication", level: "Intermediate", weight: 5 }, { name: "Customer service", level: "Intermediate", weight: 5 }, { name: "Organization", level: "Intermediate", weight: 4 }] },
  { title: "Cinema Usher", slug: "cinema-usher", salaryBase: 750, salaryRange: 250, photos: ["https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&q=80", "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&q=80", "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=500&q=80"], skills: [{ name: "Customer service", level: "Intermediate", weight: 5 }, { name: "Teamwork", level: "Beginner", weight: 4 }, { name: "Reliability", level: "Intermediate", weight: 4 }] },
  { title: "Gym Front Desk", slug: "gym-front-desk", salaryBase: 900, salaryRange: 300, photos: ["https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&q=80", "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=500&q=80", "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&q=80"], skills: [{ name: "Customer service", level: "Intermediate", weight: 5 }, { name: "Communication", level: "Intermediate", weight: 4 }, { name: "Organization", level: "Beginner", weight: 4 }] },
  { title: "Pool Lifeguard", slug: "lifeguard", salaryBase: 950, salaryRange: 350, photos: ["https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?w=500&q=80", "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=500&q=80", "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500&q=80"], skills: [{ name: "Safety awareness", level: "Intermediate", weight: 5 }, { name: "Observation", level: "Intermediate", weight: 5 }, { name: "Communication", level: "Beginner", weight: 4 }] },
  { title: "Elderly Care Assistant", slug: "elderly-care-assistant", salaryBase: 900, salaryRange: 400, photos: ["https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&q=80", "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=500&q=80", "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=500&q=80"], skills: [{ name: "Patience", level: "Intermediate", weight: 5 }, { name: "Communication", level: "Intermediate", weight: 5 }, { name: "Reliability", level: "Intermediate", weight: 5 }] },
  { title: "Medical Receptionist", slug: "medical-receptionist", salaryBase: 1000, salaryRange: 400, photos: ["https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=500&q=80", "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=500&q=80", "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=500&q=80"], skills: [{ name: "Communication", level: "Intermediate", weight: 5 }, { name: "Organization", level: "Intermediate", weight: 5 }, { name: "Customer service", level: "Intermediate", weight: 4 }] },
  { title: "Dental Receptionist", slug: "dental-receptionist", salaryBase: 950, salaryRange: 350, photos: ["https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=500&q=80", "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=500&q=80", "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=500&q=80"], skills: [{ name: "Customer service", level: "Intermediate", weight: 5 }, { name: "Organization", level: "Intermediate", weight: 5 }, { name: "Communication", level: "Intermediate", weight: 4 }] },
  { title: "Veterinary Assistant", slug: "veterinary-assistant", salaryBase: 850, salaryRange: 350, photos: ["https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=500&q=80", "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=500&q=80", "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=500&q=80"], skills: [{ name: "Patience", level: "Intermediate", weight: 5 }, { name: "Attention to detail", level: "Intermediate", weight: 5 }, { name: "Communication", level: "Beginner", weight: 4 }] },
  { title: "Farm Worker", slug: "farm-worker", salaryBase: 800, salaryRange: 350, photos: ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=500&q=80", "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=500&q=80", "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=500&q=80"], skills: [{ name: "Physical stamina", level: "Intermediate", weight: 5 }, { name: "Reliability", level: "Intermediate", weight: 5 }, { name: "Following instructions", level: "Intermediate", weight: 4 }] },
  { title: "Florist Assistant", slug: "florist-assistant", salaryBase: 800, salaryRange: 300, photos: ["https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=500&q=80", "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=500&q=80", "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=500&q=80"], skills: [{ name: "Attention to detail", level: "Intermediate", weight: 5 }, { name: "Customer service", level: "Intermediate", weight: 4 }, { name: "Organization", level: "Beginner", weight: 3 }] },
  { title: "Packer", slug: "packer", salaryBase: 850, salaryRange: 250, photos: ["https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&q=80", "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=500&q=80", "https://images.unsplash.com/photo-1605812860427-4024433a70fd?w=500&q=80"], skills: [{ name: "Attention to detail", level: "Intermediate", weight: 5 }, { name: "Speed & accuracy", level: "Intermediate", weight: 4 }, { name: "Teamwork", level: "Beginner", weight: 4 }] },
  { title: "Order Picker", slug: "order-picker", salaryBase: 900, salaryRange: 300, photos: ["https://images.unsplash.com/photo-1605812860427-4024433a70fd?w=500&q=80", "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=500&q=80", "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&q=80"], skills: [{ name: "Attention to detail", level: "Intermediate", weight: 5 }, { name: "Physical stamina", level: "Intermediate", weight: 4 }, { name: "Time management", level: "Beginner", weight: 4 }] },
  { title: "Moving Helper", slug: "moving-helper", salaryBase: 900, salaryRange: 350, photos: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&q=80", "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&q=80", "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&q=80"], skills: [{ name: "Physical stamina", level: "Intermediate", weight: 5 }, { name: "Teamwork", level: "Intermediate", weight: 5 }, { name: "Reliability", level: "Intermediate", weight: 4 }] },
  { title: "Janitor", slug: "janitor", salaryBase: 750, salaryRange: 250, photos: ["https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&q=80", "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=500&q=80", "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500&q=80"], skills: [{ name: "Cleanliness", level: "Intermediate", weight: 5 }, { name: "Reliability", level: "Intermediate", weight: 5 }, { name: "Physical stamina", level: "Beginner", weight: 3 }] },
  { title: "Window Cleaner", slug: "window-cleaner", salaryBase: 850, salaryRange: 300, photos: ["https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&q=80", "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=500&q=80", "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=500&q=80"], skills: [{ name: "Attention to detail", level: "Intermediate", weight: 5 }, { name: "Safety awareness", level: "Intermediate", weight: 5 }, { name: "Reliability", level: "Intermediate", weight: 4 }] },
  { title: "Electrician Assistant", slug: "electrician-assistant", salaryBase: 1000, salaryRange: 400, photos: ["https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&q=80", "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500&q=80", "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&q=80"], skills: [{ name: "Following instructions", level: "Intermediate", weight: 5 }, { name: "Safety awareness", level: "Intermediate", weight: 5 }, { name: "Attention to detail", level: "Intermediate", weight: 4 }] },
  { title: "Plumber Assistant", slug: "plumber-assistant", salaryBase: 950, salaryRange: 350, photos: ["https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=500&q=80", "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&q=80", "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=500&q=80"], skills: [{ name: "Problem solving", level: "Intermediate", weight: 4 }, { name: "Following instructions", level: "Intermediate", weight: 5 }, { name: "Physical stamina", level: "Beginner", weight: 4 }] },
  { title: "Tile Setter Assistant", slug: "tile-setter-assistant", salaryBase: 950, salaryRange: 350, photos: ["https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500&q=80", "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&q=80", "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&q=80"], skills: [{ name: "Attention to detail", level: "Intermediate", weight: 5 }, { name: "Following instructions", level: "Intermediate", weight: 5 }, { name: "Teamwork", level: "Beginner", weight: 3 }] },
  { title: "Mechanic Assistant", slug: "mechanic-assistant", salaryBase: 950, salaryRange: 350, photos: ["https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=500&q=80", "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=500&q=80", "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=500&q=80"], skills: [{ name: "Following instructions", level: "Intermediate", weight: 5 }, { name: "Attention to detail", level: "Intermediate", weight: 5 }, { name: "Problem solving", level: "Beginner", weight: 4 }] },
  { title: "Auto Detailer", slug: "auto-detailer", salaryBase: 850, salaryRange: 300, photos: ["https://images.unsplash.com/photo-1607860108855-64b4c54f2a5c?w=500&q=80", "https://images.unsplash.com/photo-1625047509168-eb4c2b2c555d?w=500&q=80", "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=500&q=80"], skills: [{ name: "Attention to detail", level: "Intermediate", weight: 5 }, { name: "Cleanliness", level: "Intermediate", weight: 5 }, { name: "Reliability", level: "Intermediate", weight: 4 }] },
  { title: "Hairdresser Assistant", slug: "hairdresser-assistant", salaryBase: 700, salaryRange: 400, photos: ["https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&q=80", "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=500&q=80", "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=500&q=80"], skills: [{ name: "Customer service", level: "Intermediate", weight: 5 }, { name: "Communication", level: "Intermediate", weight: 4 }, { name: "Following instructions", level: "Intermediate", weight: 4 }] },
  { title: "Nail Technician", slug: "nail-technician", salaryBase: 800, salaryRange: 400, photos: ["https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500&q=80", "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&q=80", "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&q=80"], skills: [{ name: "Attention to detail", level: "Intermediate", weight: 5 }, { name: "Customer service", level: "Intermediate", weight: 5 }, { name: "Cleanliness", level: "Intermediate", weight: 4 }] },
  { title: "Spa Receptionist", slug: "spa-receptionist", salaryBase: 950, salaryRange: 350, photos: ["https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=500&q=80", "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500&q=80", "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=500&q=80"], skills: [{ name: "Customer service", level: "Intermediate", weight: 5 }, { name: "Organization", level: "Intermediate", weight: 5 }, { name: "Communication", level: "Intermediate", weight: 4 }] },
  { title: "Inventory Clerk", slug: "inventory-clerk", salaryBase: 900, salaryRange: 300, photos: ["https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=500&q=80", "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=500&q=80", "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=500&q=80"], skills: [{ name: "Attention to detail", level: "Intermediate", weight: 5 }, { name: "Organization", level: "Intermediate", weight: 5 }, { name: "Computer basics", level: "Beginner", weight: 4 }] },
  { title: "Shipping Clerk", slug: "shipping-clerk", salaryBase: 900, salaryRange: 300, photos: ["https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=500&q=80", "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&q=80", "https://images.unsplash.com/photo-1605812860427-4024433a70fd?w=500&q=80"], skills: [{ name: "Organization", level: "Intermediate", weight: 5 }, { name: "Attention to detail", level: "Intermediate", weight: 5 }, { name: "Time management", level: "Intermediate", weight: 4 }] },
  { title: "Admin Clerk", slug: "admin-clerk", salaryBase: 950, salaryRange: 350, photos: ["https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&q=80", "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=500&q=80", "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&q=80"], skills: [{ name: "Organization", level: "Intermediate", weight: 5 }, { name: "Computer basics", level: "Intermediate", weight: 5 }, { name: "Communication", level: "Intermediate", weight: 4 }] },
  { title: "Museum Attendant", slug: "museum-attendant", salaryBase: 800, salaryRange: 300, photos: ["https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=500&q=80", "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=500&q=80", "https://images.unsplash.com/photo-1558591718-2d4c58d2c741?w=500&q=80"], skills: [{ name: "Customer service", level: "Intermediate", weight: 5 }, { name: "Observation", level: "Intermediate", weight: 4 }, { name: "Reliability", level: "Intermediate", weight: 5 }] },
  { title: "Parking Attendant", slug: "parking-attendant", salaryBase: 800, salaryRange: 250, photos: ["https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=500&q=80", "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80", "https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=500&q=80"], skills: [{ name: "Customer service", level: "Intermediate", weight: 5 }, { name: "Cash handling", level: "Intermediate", weight: 4 }, { name: "Reliability", level: "Intermediate", weight: 5 }] },
  { title: "Lab Assistant", slug: "lab-assistant", salaryBase: 1000, salaryRange: 400, photos: ["https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=500&q=80", "https://images.unsplash.com/photo-1582719478250-c89c6d9cba22?w=500&q=80", "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=500&q=80"], skills: [{ name: "Attention to detail", level: "Intermediate", weight: 5 }, { name: "Following instructions", level: "Intermediate", weight: 5 }, { name: "Organization", level: "Intermediate", weight: 4 }] },
  { title: "Loss Prevention Officer", slug: "loss-prevention-officer", salaryBase: 1000, salaryRange: 350, photos: ["https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=500&q=80", "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80", "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=500&q=80"], skills: [{ name: "Observation", level: "Intermediate", weight: 5 }, { name: "Communication", level: "Intermediate", weight: 4 }, { name: "Calm under pressure", level: "Intermediate", weight: 5 }] },
  { title: "Prep Cook", slug: "prep-cook", salaryBase: 850, salaryRange: 300, photos: ["https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500&q=80", "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=500&q=80", "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&q=80"], skills: [{ name: "Speed & accuracy", level: "Intermediate", weight: 5 }, { name: "Cleanliness", level: "Intermediate", weight: 5 }, { name: "Following instructions", level: "Intermediate", weight: 4 }] },
  { title: "Carpet Cleaner", slug: "carpet-cleaner", salaryBase: 800, salaryRange: 300, photos: ["https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=500&q=80", "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=500&q=80", "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&q=80"], skills: [{ name: "Attention to detail", level: "Intermediate", weight: 5 }, { name: "Physical stamina", level: "Intermediate", weight: 4 }, { name: "Reliability", level: "Intermediate", weight: 5 }] },
  { title: "Vineyard Worker", slug: "vineyard-worker", salaryBase: 850, salaryRange: 350, photos: ["https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=500&q=80", "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=500&q=80", "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=500&q=80"], skills: [{ name: "Physical stamina", level: "Intermediate", weight: 5 }, { name: "Attention to detail", level: "Intermediate", weight: 4 }, { name: "Following instructions", level: "Intermediate", weight: 4 }] },
  { title: "Printer / Bindery Worker", slug: "printer-bindery", salaryBase: 900, salaryRange: 300, photos: ["https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=500&q=80", "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=500&q=80", "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&q=80"], skills: [{ name: "Attention to detail", level: "Intermediate", weight: 5 }, { name: "Following instructions", level: "Intermediate", weight: 5 }, { name: "Organization", level: "Beginner", weight: 4 }] },
  { title: "Retail Supervisor", slug: "retail-supervisor", salaryBase: 1100, salaryRange: 400, photos: ["https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&q=80", "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=500&q=80", "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&q=80"], skills: [{ name: "Communication", level: "Intermediate", weight: 5 }, { name: "Teamwork", level: "Intermediate", weight: 5 }, { name: "Organization", level: "Intermediate", weight: 5 }] },
  { title: "Welder (entry)", slug: "welder-entry", salaryBase: 1100, salaryRange: 500, photos: ["https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500&q=80", "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&q=80", "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&q=80"], skills: [{ name: "Following instructions", level: "Intermediate", weight: 5 }, { name: "Safety awareness", level: "Intermediate", weight: 5 }, { name: "Attention to detail", level: "Intermediate", weight: 4 }] },
];

const WORK_TYPES = ["Full-time", "Part-time", "Remote", "Temporary"] as const;
const EDUCATION_LEVELS = ["None", "High School", "Bachelor"] as const;

function pick<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length];
}

/** First 2 vacancies kept for mutual match demo (ids 1, 2 → emp-1, emp-2) */
const SEED_VACANCIES: VacancyCard[] = [
  {
    id: "1",
    title: "Barista",
    company: "Coffee Lab",
    location: "Tbilisi",
    workType: "Full-time",
    salary: "1,200–1,500 GEL",
    photo: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&q=80",
    profile: {
      locationCityId: "tbilisi",
      isRemote: false,
      salaryMax: 1500,
      requiredExperienceMonths: 6,
      requiredEducationLevel: "High School",
      workType: "Full-time",
      skills: [
        { name: "Customer service", level: "Intermediate", weight: 5 },
        { name: "Coffee preparation", level: "Intermediate", weight: 5 },
        { name: "Cash handling", level: "Intermediate", weight: 3 },
      ],
    },
  },
  {
    id: "2",
    title: "Cashier",
    company: "Carrefour",
    location: "Tbilisi",
    workType: "Part-time",
    salary: "900–1,100 GEL",
    photo: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&q=80",
    profile: {
      locationCityId: "tbilisi",
      isRemote: false,
      salaryMax: 1100,
      requiredExperienceMonths: 0,
      requiredEducationLevel: "High School",
      workType: "Part-time",
      skills: [
        { name: "Cash handling", level: "Intermediate", weight: 5 },
        { name: "Attention to detail", level: "Intermediate", weight: 4 },
        { name: "Customer service", level: "Beginner", weight: 3 },
      ],
    },
  },
];

function generateVacancies(): VacancyCard[] {
  const out: VacancyCard[] = [...SEED_VACANCIES];
  let id = 3;

  for (let i = 0; i < 198; i++) {
    const tmpl = pick(JOB_TEMPLATES, i);
    const city = pick(CITIES, i * 7 + 13);
    const company = pick(COMPANIES, i * 11 + 17);
    const workType = pick(WORK_TYPES, i * 3 + 5);
    const expMonths = [0, 0, 0, 3, 6, 12][i % 6];
    const eduLevel = pick(EDUCATION_LEVELS, i);
    const salaryOffset = ((i % 5) - 2) * 50;
    const salaryMax = Math.max(600, tmpl.salaryBase + tmpl.salaryRange / 2 + salaryOffset);
    const salaryMin = Math.max(500, salaryMax - tmpl.salaryRange);
    const isRemote = workType === "Remote";

    const profile: VacancyProfile = {
      locationCityId: city.id,
      isRemote,
      salaryMax,
      requiredExperienceMonths: expMonths,
      requiredEducationLevel: eduLevel,
      workType,
      skills: tmpl.skills,
    };

    out.push({
      id: String(id++),
      title: tmpl.title,
      company,
      location: city.nameEn,
      workType,
      salary: `${salaryMin.toLocaleString()}–${salaryMax.toLocaleString()} GEL`,
      photo: pick(tmpl.photos, i),
      profile,
    });
  }

  return out;
}

export const HARDCODED_VACANCIES: VacancyCard[] = generateVacancies();
