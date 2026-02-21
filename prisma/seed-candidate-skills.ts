/**
 * Add relevant skills to each candidate in candidate_skills.
 * Matches each candidate's job_title to JobRoleTemplate (en) and copies
 * that role's skills (from role_skill_templates) as CandidateSkill with level from weight.
 *
 * Run: npx tsx prisma/seed-candidate-skills.ts
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

/** Use Transaction pooler (port 6543) to avoid Session mode "max clients" limit. */
function toTransactionPoolerUrl(url: string): string {
  if (url.includes(":6543/") || url.includes("pgbouncer=true")) return url;
  const out = url.replace(/:5432\//, ":6543/");
  return out.includes("?") ? `${out}&pgbouncer=true` : `${out}?pgbouncer=true`;
}

function dbUrlWithPoolLimit(url: string, limit = 1): string {
  const hasParams = url.includes("?");
  return `${url}${hasParams ? "&" : "?"}connection_limit=${limit}`;
}

const rawUrl =
  process.env.DIRECT_URL_TRANSACTION ||
  process.env.DATABASE_URL_TRANSACTION ||
  process.env.DIRECT_URL ||
  process.env.DATABASE_URL;
const url = rawUrl
  ? dbUrlWithPoolLimit(toTransactionPoolerUrl(rawUrl))
  : undefined;
const prisma = new PrismaClient(
  url ? { datasources: { db: { url } } } : undefined
);

/** Default skills when job title has no matching template. */
const DEFAULT_SKILLS = [
  { name: "Communication", level: "Intermediate" as const },
  { name: "Teamwork", level: "Intermediate" as const },
  { name: "Attention to detail", level: "Intermediate" as const },
];

function weightToLevel(weight: number): "Beginner" | "Intermediate" | "Advanced" {
  if (weight >= 4) return "Advanced";
  if (weight >= 3) return "Intermediate";
  return "Beginner";
}

function normalizeTitle(title: string): string {
  return title.trim().toLowerCase();
}

function slugify(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "job";
}

async function main() {
  const templates = await prisma.jobRoleTemplate.findMany({
    where: { locale: "en" },
    include: {
      skills: { orderBy: { weight: "desc" } },
    },
  });

  const titleToSkills = new Map<string, Array<{ name: string; level: "Beginner" | "Intermediate" | "Advanced" }>>();
  const slugToSkills = new Map<string, Array<{ name: string; level: "Beginner" | "Intermediate" | "Advanced" }>>();
  for (const t of templates) {
    const skills = t.skills.map((s) => ({
      name: s.skillName,
      level: weightToLevel(s.weight),
    }));
    titleToSkills.set(normalizeTitle(t.title), skills);
    slugToSkills.set(t.slug, skills);
  }
  console.log(`Loaded ${templates.length} job templates (en) with skills.`);

  const profiles = await prisma.candidateProfile.findMany({
    select: { id: true, jobTitle: true, fullName: true },
  });
  console.log(`Found ${profiles.length} candidate profile(s).`);

  let withSkills = 0;
  let withDefaults = 0;
  let totalSkills = 0;

  console.log("Adding skills to candidates…");
  for (const profile of profiles) {
    const jobTitle = (profile.jobTitle || "").trim();
    const key = normalizeTitle(jobTitle);
    let skills = key ? titleToSkills.get(key) ?? null : null;
    if (!skills || skills.length === 0) {
      const slug = slugify(jobTitle);
      skills = slug ? slugToSkills.get(slug) ?? null : null;
    }
    if (!skills || skills.length === 0) {
      for (const [templateTitle, s] of titleToSkills) {
        if (templateTitle && key && (key.includes(templateTitle) || templateTitle.includes(key))) {
          skills = s;
          break;
        }
      }
    }
    if (!skills || skills.length === 0) {
      skills = DEFAULT_SKILLS;
      withDefaults++;
    } else {
      withSkills++;
    }

    for (const { name, level } of skills) {
      try {
        await prisma.candidateSkill.upsert({
          where: {
            candidateProfileId_name: {
              candidateProfileId: profile.id,
              name,
            },
          },
          update: { level },
          create: {
            candidateProfileId: profile.id,
            name,
            level,
          },
        });
        totalSkills++;
      } catch (e) {
        console.warn(`  Skip skill "${name}" for ${profile.fullName}:`, (e as Error).message);
      }
    }

    const done = withSkills + withDefaults;
    if (done > 0 && done % 50 === 0) {
      console.log(`  … ${done}/${profiles.length} profiles, ${totalSkills} skills`);
    }
  }

  console.log(`Done. ${withSkills} candidates matched to job templates, ${withDefaults} used default skills.`);
  console.log(`Total candidate_skills rows: ${totalSkills}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
