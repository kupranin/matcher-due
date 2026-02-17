import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

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
