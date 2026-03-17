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

    const candidateProfile = await prisma.candidateProfile.findUnique({
      where: { userId },
    });

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

