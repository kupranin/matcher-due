import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSupabaseStorageClient, AVATARS_BUCKET } from "@/lib/supabaseStorage";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024; // 5MB

/**
 * POST /api/candidates/profile/photo
 * multipart/form-data: file (image), userId (string)
 * Uploads to Supabase Storage avatars bucket, saves public URL in CandidateProfile.photo.
 * Bucket "avatars" must exist and be PUBLIC for getPublicUrl to work.
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const userId = typeof formData.get("userId") === "string" ? formData.get("userId") as string : "";

    if (!userId?.trim()) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "file required" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Use JPEG, PNG, or WebP." },
        { status: 400 }
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "File too large. Maximum 5 MB." },
        { status: 400 }
      );
    }

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId: userId.trim() },
      select: { id: true },
    });
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `${profile.id}/${crypto.randomUUID()}.${ext}`;

    const supabase = getSupabaseStorageClient();
    const { error: uploadError } = await supabase.storage
      .from(AVATARS_BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      console.error("Supabase storage upload error:", uploadError);
      return NextResponse.json(
        { error: "Upload failed. Ensure the avatars bucket exists and is writable." },
        { status: 502 }
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(path);

    await prisma.candidateProfile.update({
      where: { id: profile.id },
      data: { photo: publicUrl },
    });

    return NextResponse.json({ photoUrl: publicUrl });
  } catch (e) {
    console.error("Profile photo upload error:", e);
    return NextResponse.json(
      { error: "Failed to upload photo" },
      { status: 500 }
    );
  }
}
