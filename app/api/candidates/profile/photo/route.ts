import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createAdminClient } from "@/lib/supabase/admin";

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

    let profile = await prisma.candidateProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!profile) {
      // If profile does not exist yet (e.g. user logged in before completing onboarding),
      // create a minimal profile so that photo uploads still work.
      profile = await prisma.candidateProfile.create({
        data: {
          userId,
          fullName: "Candidate",
          phone: null,
          locationCityId: "tbilisi",
          salaryMin: 800,
          willingToRelocate: false,
          experienceMonths: 0,
          educationLevel: "High School",
          workTypes: ["Full-time"],
          jobTitle: null,
        },
        select: { id: true },
      });
    }

    // Use admin Supabase client (service role) so we can always write to the
    // candidate-photos bucket from the backend, regardless of user auth.
    // If env is missing on a deployment, surface a clear 503 error.
    let supabase;
    try {
      supabase = createAdminClient();
    } catch (e) {
      console.error("[/api/candidates/profile/photo] admin client misconfigured", e);
      return NextResponse.json(
        { error: "Upload not configured (missing Supabase service role key)" },
        { status: 503 }
      );
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const key = `${userId}/${profile.id}-${Date.now()}.${ext}`;
    const buf = await file.arrayBuffer();

    const { data, error } = await supabase.storage.from(BUCKET).upload(key, buf, {
      contentType: file.type,
      upsert: true,
    });

    if (error) {
      console.error("[/api/candidates/profile/photo] Supabase upload error", {
        userId,
        key,
        error,
      });
      return NextResponse.json(
        { error: `Upload failed: ${error.message}` },
        { status: 500 }
      );
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
    const url = urlData?.publicUrl ?? "";
    if (!url) {
      console.error("[/api/candidates/profile/photo] missing public URL", {
        userId,
        key,
        path: data.path,
        urlData,
      });
      return NextResponse.json(
        { error: "Upload succeeded but public URL was not generated" },
        { status: 500 }
      );
    }

    await prisma.candidateProfile.update({
      where: { userId },
      data: { photo: url || null },
    });

    return NextResponse.json({ url });
  } catch (e) {
    console.error("[/api/candidates/profile/photo] unexpected error", e);
    // Surface a helpful message to the client (without leaking secrets).
    const message =
      e instanceof Error && typeof e.message === "string" && e.message.trim().length > 0
        ? e.message
        : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
