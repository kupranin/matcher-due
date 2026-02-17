"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale() {
    const next = locale === "en" ? "ka" : "en";
    router.replace(pathname, { locale: next });
  }

  return (
    <button
      type="button"
      onClick={switchLocale}
      className="min-w-[3.25rem] rounded-full border border-gray-200 px-3 py-1.5 text-center text-sm font-medium text-gray-600 transition-colors hover:border-matcher hover:bg-matcher-pale/50 hover:text-matcher-dark"
      title={locale === "en" ? "ქართულად" : "In English"}
    >
      {locale === "en" ? "KA" : "EN"}
    </button>
  );
}
