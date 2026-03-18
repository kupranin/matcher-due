import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * POST /api/discards — record a candidate "pass" (left swipe).
 * DELETE /api/discards — undo a candidate "pass".
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const vacancyId = typeof body?.vacancyId === "string" ? body.vacancyId.trim() : "";
    const candidateProfileId =
      typeof body?.candidateProfileId === "string" ? body.candidateProfileId.trim() : "";

    if (!vacancyId || !candidateProfileId) {
      return NextResponse.json({ error: "vacancyId and candidateProfileId required" }, { status: 400 });
    }

    const discard = await prisma.discard.upsert({
      where: { vacancyId_candidateProfileId: { vacancyId, candidateProfileId } },
      update: {},
      create: { vacancyId, candidateProfileId },
      select: { id: true, createdAt: true },
    });

    return NextResponse.json({
      ok: true,
      discardId: discard.id,
      createdAt: discard.createdAt.toISOString(),
    });
  } catch (e) {
    console.error("Discard upsert error:", e);
    return NextResponse.json({ error: "Failed to save discard" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const vacancyId = typeof body?.vacancyId === "string" ? body.vacancyId.trim() : "";
    const candidateProfileId =
      typeof body?.candidateProfileId === "string" ? body.candidateProfileId.trim() : "";

    if (!vacancyId || !candidateProfileId) {
      return NextResponse.json({ error: "vacancyId and candidateProfileId required" }, { status: 400 });
    }

    await prisma.discard.deleteMany({
      where: { vacancyId, candidateProfileId },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Discard delete error:", e);
    return NextResponse.json({ error: "Failed to undo discard" }, { status: 500 });
  }
}

