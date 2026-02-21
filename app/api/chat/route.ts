import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/** GET /api/chat?matchId= — list messages for a match. */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const matchId = searchParams.get("matchId");
    if (!matchId) return NextResponse.json({ error: "matchId required" }, { status: 400 });
    const list = await prisma.chatMessage.findMany({
      where: { matchId },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(
      list.map((m) => ({
        id: m.id,
        matchId: m.matchId,
        sender: m.sender,
        text: m.text,
        createdAt: m.createdAt.getTime(),
      }))
    );
  } catch (e) {
    console.error("Chat get error:", e);
    return NextResponse.json({ error: "Failed to load messages" }, { status: 500 });
  }
}

/** POST /api/chat — add a message. Body: { matchId, sender, text }. */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const matchId = typeof body?.matchId === "string" ? body.matchId.trim() : "";
    const sender = body?.sender === "employer" ? "employer" : "candidate";
    const text = typeof body?.text === "string" ? body.text.trim() : "";
    if (!matchId) return NextResponse.json({ error: "matchId required" }, { status: 400 });
    if (!text) return NextResponse.json({ error: "text required" }, { status: 400 });
    const msg = await prisma.chatMessage.create({
      data: { matchId, sender, text },
    });
    return NextResponse.json({
      id: msg.id,
      matchId: msg.matchId,
      sender: msg.sender,
      text: msg.text,
      createdAt: msg.createdAt.getTime(),
    });
  } catch (e) {
    console.error("Chat post error:", e);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
