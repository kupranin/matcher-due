import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const BUCKET = "candidate-photos";
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** POST /api/candidates/profile/photo — upload candidate photo. Body: multipart/form-data with "photo" (file) and "userId" (string). */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("photo");
    const userId = typeof formData.get("userId") === "string" ? formData.get("userId") as string : "";
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
    if (!file || !(file instanceof File)) return NextResponse.json({ error: "photo file required" }, { status: 400 });
    if (file.size > MAX_SIZE_BYTES) return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
    if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: "Only JPEG, PNG, WebP allowed" }, { status: 400 });

    const profile = await prisma.candidateProfile.findUnique({ where: { userId }, select: { id: true } });
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    let supabase;
    try {
      const { createClient } = await import("@/lib/supabase/server");
      supabase = await createClient();
    } catch {
      return NextResponse.json({ error: "Upload not configured" }, { status: 503 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const key = `${userId}/${profile.id}-${Date.now()}.${ext}`;
    const buf = await file.arrayBuffer();

    const { data, error } = await supabase.storage.from(BUCKET).upload(key, buf, {
      contentType: file.type,
      upsert: true,
    });

    if (error) {
      console.error("Supabase storage upload error:", error);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
    const url = urlData?.publicUrl ?? "";

    await prisma.candidateProfile.update({
      where: { userId },
      data: { photo: url || null },
    });

    return NextResponse.json({ url });
  } catch (e) {
    console.error("Photo upload error:", e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
