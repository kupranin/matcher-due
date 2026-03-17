import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId")?.trim() || null;

    if (!userId) {
      return NextResponse.json(
        { error: "userId query param required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true },
    });

    // Use raw SQL to avoid selecting non-existent date_of_birth column
    const rawProfiles = await prisma.$queryRaw<
      Array<{
        id: string;
        user_id: string;
        full_name: string;
        location_city_id: string;
        salary_min: number;
      }>
    >`SELECT "id", "user_id", "full_name", "location_city_id", "salary_min"
      FROM "CandidateProfile"
      WHERE "user_id" = ${userId}
      LIMIT 1`;

    const candidateProfile = rawProfiles[0] ?? null;

    console.log("[/api/debug-candidate] user", user);
    console.log("[/api/debug-candidate] candidateProfile", candidateProfile);

    let matches: any[] = [];
    let chats: any[] = [];

    if (candidateProfile) {
      matches = await prisma.match.findMany({
        where: {
          candidateProfileId: candidateProfile.id,
          employerLiked: true,
          candidateLiked: true,
        },
        include: {
          vacancy: { include: { company: { select: { name: true } } } },
        },
        orderBy: [{ matchedAt: "desc" }, { createdAt: "desc" }],
      });

      const matchIds = matches.map((m) => m.id);
      if (matchIds.length > 0) {
        chats = await prisma.chatMessage.findMany({
          where: { matchId: { in: matchIds } },
          orderBy: { createdAt: "asc" },
        });
      }
    }

    console.log(
      "[/api/debug-candidate] matches count",
      Array.isArray(matches) ? matches.length : 0
    );

    return NextResponse.json({
      user,
      candidateProfile,
      matches,
      chats,
    });
  } catch (e) {
    console.error("[/api/debug-candidate] error", e);
    return NextResponse.json(
      { error: "Failed to debug candidate state" },
      { status: 500 }
    );
  }
}


