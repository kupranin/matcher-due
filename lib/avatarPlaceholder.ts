/**
 * Fallback when candidate/employer has no photo. Use with img src or show inline placeholder.
 * Next.js: ensure Supabase storage host is in images.remotePatterns for next/image.
 */
export const AVATAR_PLACEHOLDER_PATH = "/images/avatar-placeholder.svg";

export function getAvatarSrc(photoUrl: string | null | undefined): string {
  if (photoUrl && typeof photoUrl === "string" && photoUrl.trim().length > 0) {
    return photoUrl.trim();
  }
  return AVATAR_PLACEHOLDER_PATH;
}
