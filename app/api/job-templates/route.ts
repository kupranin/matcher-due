import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

function slugify(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "job";
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") ?? "en";
  const validLocale = locale === "ka" ? "ka" : "en";

  try {
    const roles = await prisma.jobRoleTemplate.findMany({
      where: { locale: validLocale },
      include: {
        skills: {
          orderBy: { weight: "desc" },
        },
      },
    });

    const data = roles.map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      category: r.category,
      description: r.description,
      skills: r.skills.map((s) => ({ skillName: s.skillName, weight: s.weight })),
    }));

    if (data.length > 0) return Response.json(data);
  } catch {
    // DB unavailable: return empty; client uses fallback
  }

  return Response.json([]);
}

/**
 * POST /api/job-templates — create a new job role (user-added).
 * Body: { title: string, locale?: string, category?: string, description?: string, skills?: { skillName: string, weight: number }[] }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    if (!title || title.length > 200) {
      return Response.json({ error: "Invalid title" }, { status: 400 });
    }
    const locale = body?.locale === "ka" ? "ka" : "en";
    const category = typeof body?.category === "string" ? body.category.trim().slice(0, 120) : "User-added";
    const description = typeof body?.description === "string" ? body.description.trim().slice(0, 2000) : "";
    const rawSkills = Array.isArray(body?.skills) ? body.skills : [];
    const skills = rawSkills
      .filter((s: unknown) => s && typeof (s as { skillName?: string }).skillName === "string")
      .map((s: { skillName: string; weight?: number }) => ({
        skillName: (s.skillName as string).trim().slice(0, 120),
        weight: typeof (s as { weight?: number }).weight === "number" ? Math.max(1, Math.min(5, (s as { weight: number }).weight)) : 3,
      }))
      .filter((s: { skillName: string; weight: number }) => s.skillName.length > 0)
      .slice(0, 20);

    const baseSlug = slugify(title);
    let slug = baseSlug;
    let n = 0;
    while (true) {
      const existing = await prisma.jobRoleTemplate.findUnique({
        where: { slug_locale: { slug, locale } },
      });
      if (!existing) break;
      n += 1;
      slug = `${baseSlug}-${n}`;
    }

    const role = await prisma.jobRoleTemplate.create({
      data: {
        slug,
        locale,
        title,
        category,
        description,
        skills: {
          create: skills.map((s: { skillName: string; weight: number }) => ({ skillName: s.skillName, weight: s.weight })),
        },
      },
      include: {
        skills: { orderBy: { weight: "desc" } },
      },
    });

    return Response.json(
      {
        id: role.id,
        slug: role.slug,
        title: role.title,
        category: role.category,
        description: role.description,
        skills: role.skills.map((s) => ({ skillName: s.skillName, weight: s.weight })),
      },
      { status: 201 }
    );
  } catch (e) {
    console.error("POST /api/job-templates", e);
    return Response.json({ error: "Failed to create job role" }, { status: 500 });
  }
}
