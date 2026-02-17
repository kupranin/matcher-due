"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

export default function ProfileRedirectPage() {
  const t = useTranslations("profile");
  const router = useRouter();
  useEffect(() => {
    router.replace("/cabinet/profile");
  }, [router]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <p className="text-sm text-gray-500">{t("redirecting")}</p>
    </div>
  );
}
