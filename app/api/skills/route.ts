import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/skills — return all skill names (from job role templates + user-added global skills).
 * Used for autocomplete when candidate or employer adds a skill.
 */
export async function GET() {
  try {
    const [templateSkills, globalSkills] = await Promise.all([
      prisma.roleSkillTemplate.findMany({ select: { skillName: true }, distinct: ["skillName"] }),
      prisma.globalSkill.findMany({ select: { name: true } }),
    ]);
    const names = new Set<string>();
    templateSkills.forEach((s) => names.add(s.skillName));
    globalSkills.forEach((s) => names.add(s.name));
    const sorted = Array.from(names).sort();
    return Response.json(sorted);
  } catch {
    return Response.json([], { status: 200 });
  }
}

/**
 * POST /api/skills — add a user-submitted skill name to the global list.
 * Body: { name: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    if (!name || name.length > 120) {
      return Response.json({ error: "Invalid name" }, { status: 400 });
    }
    await prisma.globalSkill.upsert({
      where: { name },
      create: { name },
      update: {},
    });
    return Response.json({ name }, { status: 201 });
  } catch (e) {
    console.error("POST /api/skills", e);
    return Response.json({ error: "Failed to add skill" }, { status: 500 });
  }
}
