/**
 * Database of stock images for vacancy cards.
 * Used when employer posts a vacancy: pick from stock or add custom URL.
 */

/** Default/generic vacancy images when job has no specific photos */
export const GENERIC_VACANCY_PHOTOS = [
  "https://images.unsplash.com/photo-1521737711867-e3b97395f902?w=800&q=80",
  "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80",
  "https://images.unsplash.com/photo-1542744094-24638eff58bb?w=800&q=80",
  "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&q=80",
];

/** Stock photo URLs by job template slug (from job role templates). */
export const STOCK_PHOTOS_BY_SLUG: Record<string, string[]> = {
  barista: [
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&q=80",
    "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500&q=80",
    "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=500&q=80",
  ],
  cashier: [
    "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&q=80",
    "https://images.unsplash.com/photo-1585916420730-d7f95e942d43?w=500&q=80",
    "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=500&q=80",
  ],
  waiter: [
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80",
    "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=500&q=80",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500&q=80",
  ],
  "sales-associate": [
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&q=80",
    "https://images.unsplash.com/photo-1556742111-a301076d9d18?w=500&q=80",
    "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=500&q=80",
  ],
  "call-center-agent": [
    "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=500&q=80",
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&q=80",
    "https://images.unsplash.com/photo-1587563871167-1ee9e731abc?w=500&q=80",
  ],
  "warehouse-worker": [
    "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=500&q=80",
    "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&q=80",
    "https://images.unsplash.com/photo-1605812860427-4024433a70fd?w=500&q=80",
  ],
  receptionist: [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&q=80",
    "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=500&q=80",
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&q=80",
  ],
  "delivery-courier": [
    "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=500&q=80",
    "https://images.unsplash.com/photo-1553413077-190dd305871c?w=500&q=80",
    "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&q=80",
  ],
  "kitchen-assistant": [
    "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500&q=80",
    "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=500&q=80",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&q=80",
  ],
  cleaner: [
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&q=80",
    "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=500&q=80",
    "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500&q=80",
  ],
  "security-guard": [
    "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=500&q=80",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80",
    "https://images.unsplash.com/photo-1551884170-09fb70a3a2ed?w=500&q=80",
  ],
  "pharmacy-assistant": [
    "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=500&q=80",
    "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=500&q=80",
    "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=500&q=80",
  ],
  "hotel-housekeeping": [
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=500&q=80",
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&q=80",
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500&q=80",
  ],
  "office-assistant": [
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&q=80",
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&q=80",
    "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=500&q=80",
  ],
  bartender: [
    "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=500&q=80",
    "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=500&q=80",
    "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=500&q=80",
  ],
  "line-cook": [
    "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=500&q=80",
    "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500&q=80",
    "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=500&q=80",
  ],
  driver: [
    "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=500&q=80",
    "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500&q=80",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80",
  ],
  "data-entry-clerk": [
    "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=500&q=80",
    "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=500&q=80",
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=500&q=80",
  ],
  "junior-accountant": [
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=500&q=80",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&q=80",
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&q=80",
  ],
  "construction-laborer": [
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&q=80",
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&q=80",
    "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=500&q=80",
  ],
  "welder-entry": [
    "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500&q=80",
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&q=80",
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&q=80",
  ],
};

/**
 * Normalize job title to slug for lookup (e.g. "Barista" -> "barista", "Waiter/Waitress" -> "waiter").
 */
function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s*\/\s*.*$/, "") // "Waiter/Waitress" -> "waiter"
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

/**
 * Map DB/csv job slugs (from JobRoleTemplate) to a canonical slug that has stock photos.
 * Covers roles from entry_level_jobs_300.csv so vacancy photos match the selected role.
 */
const SLUG_TO_PHOTO_SLUG: Record<string, string> = {
  "retail-cashier": "cashier",
  "store-associate": "sales-associate",
  "customer-service-representative": "call-center-agent",
  "call-center-agent": "call-center-agent",
  "chat-support-agent": "call-center-agent",
  receptionist: "receptionist",
  "office-assistant": "office-assistant",
  "administrative-assistant": "office-assistant",
  "data-entry-clerk": "data-entry-clerk",
  "warehouse-associate": "warehouse-worker",
  "order-picker": "warehouse-worker",
  packer: "warehouse-worker",
  "inventory-associate": "warehouse-worker",
  "delivery-driver": "driver",
  courier: "delivery-courier",
  "food-delivery-rider": "driver",
  barista: "barista",
  "waiter-waitress": "waiter",
  waitress: "waiter",
  waiter: "waiter",
  "host-hostess": "waiter",
  "kitchen-assistant": "kitchen-assistant",
  dishwasher: "kitchen-assistant",
  "room-attendant": "hotel-housekeeping",
  "hotel-porter": "hotel-housekeeping",
  housekeeper: "hotel-housekeeping",
  cleaner: "cleaner",
  "security-guard": "security-guard",
  "junior-marketing-assistant": "office-assistant",
  "social-media-assistant": "office-assistant",
  "content-assistant": "office-assistant",
  "marketing-coordinator-junior": "office-assistant",
  "accounts-payable-clerk": "junior-accountant",
  "accounts-receivable-clerk": "junior-accountant",
  "payroll-assistant": "junior-accountant",
  "junior-accountant-assistant": "junior-accountant",
  "bank-teller-entry-level": "junior-accountant",
  "operations-assistant": "office-assistant",
  "procurement-assistant": "office-assistant",
  "junior-qa-tester": "office-assistant",
  "it-support-technician-junior": "office-assistant",
  "help-desk-analyst-entry-level": "call-center-agent",
  "junior-data-analyst": "office-assistant",
  "data-labeling-specialist": "office-assistant",
  "pharmacy-assistant": "pharmacy-assistant",
  "clinic-receptionist": "receptionist",
  "teacher-assistant": "receptionist",
  "production-assistant": "construction-laborer",
  "assembly-line-worker": "construction-laborer",
  "quality-control-inspector-entry-level": "construction-laborer",
  "grocery-store-clerk": "sales-associate",
  "restaurant-runner": "waiter",
  "office-runner-messenger": "office-assistant",
  "customer-care-specialist-entry-level": "call-center-agent",
  "shipping-coordinator-junior": "warehouse-worker",
  "parcel-courier": "delivery-courier",
  "billing-assistant": "junior-accountant",
  "reporting-assistant": "office-assistant",
  "facilities-assistant": "cleaner",
  "packaging-operator-entry-level": "warehouse-worker",
  "medical-records-clerk": "receptionist",
  "after-school-program-assistant": "receptionist",
  "retail-merchandiser": "sales-associate",
  "banquet-server": "waiter",
  "document-controller-junior": "office-assistant",
  "technical-support-representative-junior": "call-center-agent",
  "receiving-clerk": "warehouse-worker",
  "restaurant-delivery-driver": "driver",
  "email-marketing-assistant": "office-assistant",
  "claims-assistant": "junior-accountant",
  "crm-data-assistant": "office-assistant",
  "maintenance-assistant": "cleaner",
  "factory-worker": "construction-laborer",
  "lab-assistant-entry-level": "pharmacy-assistant",
  "library-assistant": "receptionist",
  "brand-ambassador": "sales-associate",
  "catering-assistant": "kitchen-assistant",
  "legal-assistant-entry-level": "office-assistant",
  "community-moderator": "call-center-agent",
  "stockroom-assistant": "warehouse-worker",
  "last-mile-delivery-associate": "driver",
  "junior-seo-assistant": "office-assistant",
  "underwriting-assistant": "junior-accountant",
  "data-quality-assistant": "office-assistant",
  "junior-reporting-specialist": "office-assistant",
  "car-wash-attendant": "cleaner",
  "quality-control-assistant": "construction-laborer",
  "dental-receptionist": "receptionist",
  "learning-support-assistant": "receptionist",
  "inside-sales-representative-junior": "sales-associate",
  "concierge-assistant": "waiter",
  "junior-project-coordinator": "office-assistant",
  "trust-safety-associate": "call-center-agent",
  "warehouse-clerk": "warehouse-worker",
  "driver-helper": "driver",
  "copywriting-assistant": "office-assistant",
  "kyc-analyst-junior": "junior-accountant",
  "research-assistant-business": "office-assistant",
  "retail-loss-prevention-associate": "security-guard",
  "packaging-worker": "warehouse-worker",
  "production-worker": "construction-laborer",
  "patient-coordinator-junior": "receptionist",
  "camp-counselor-entry-level": "receptionist",
  "sales-development-representative-junior": "sales-associate",
  "spa-receptionist": "receptionist",
  "project-assistant": "office-assistant",
  "reservation-agent": "call-center-agent",
  "stock-controller-junior": "warehouse-worker",
  "returns-processing-associate": "warehouse-worker",
  "bike-courier": "delivery-courier",
  "influencer-marketing-assistant": "office-assistant",
  "claims-processor": "junior-accountant",
};

/**
 * Find a matching photo slug when exact slug is missing. Check if slug contains
 * any of our known keys (e.g. "retail-cashier" -> "cashier", "barista-wanted" -> "barista").
 * Prefer longest matching key so "barista" wins over shorter substrings.
 */
function findPhotoSlugByMatch(slug: string): string | null {
  const normalized = slug.toLowerCase().trim();
  if (STOCK_PHOTOS_BY_SLUG[normalized]) return normalized;
  const keys = Object.keys(STOCK_PHOTOS_BY_SLUG);
  for (const key of keys) {
    if (normalized === key || normalized.endsWith("-" + key) || normalized.startsWith(key + "-")) return key;
  }
  const byLength = [...keys].sort((a, b) => b.length - a.length);
  for (const key of byLength) {
    if (normalized.includes(key)) return key;
  }
  return null;
}

/**
 * Get stock photo URLs for a job. Pass job slug (e.g. from template) or job title.
 * Returns job-specific photos if found, otherwise generic vacancy photos.
 */
export function getStockPhotosForJob(slugOrTitle: string | null | undefined): string[] {
  if (!slugOrTitle || typeof slugOrTitle !== "string") return GENERIC_VACANCY_PHOTOS;
  const looksLikeTitle = /\s/.test(slugOrTitle) || (slugOrTitle.length >= 20 && !slugOrTitle.includes("-"));
  const slug = looksLikeTitle ? titleToSlug(slugOrTitle) : slugOrTitle;
  const normalized = slug.toLowerCase().trim();

  const exact = STOCK_PHOTOS_BY_SLUG[normalized];
  if (exact) return exact;

  const fromTitle = titleToSlug(slugOrTitle);
  if (STOCK_PHOTOS_BY_SLUG[fromTitle]) return STOCK_PHOTOS_BY_SLUG[fromTitle];

  const aliased = SLUG_TO_PHOTO_SLUG[normalized];
  if (aliased && STOCK_PHOTOS_BY_SLUG[aliased]) return STOCK_PHOTOS_BY_SLUG[aliased];

  const matched = findPhotoSlugByMatch(normalized);
  if (matched) return STOCK_PHOTOS_BY_SLUG[matched];

  return GENERIC_VACANCY_PHOTOS;
}
