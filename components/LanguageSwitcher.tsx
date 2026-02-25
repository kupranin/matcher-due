"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const effectiveLocale = locale === "local" ? "en" : locale;

  function switchTo(next: "en" | "ka") {
    if (next === effectiveLocale) return;
    router.replace(pathname, { locale: next });
  }

  return (
    <div
      className="flex rounded-full border border-gray-200 bg-white/95 shadow-sm backdrop-blur"
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => switchTo("en")}
        className={`rounded-l-full px-3 py-1.5 text-sm font-medium transition-colors ${
          effectiveLocale === "en"
            ? "bg-matcher text-white"
            : "text-gray-600 hover:bg-gray-100 hover:text-matcher-dark"
        }`}
        title="English"
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => switchTo("ka")}
        className={`rounded-r-full border-l border-gray-200 px-3 py-1.5 text-sm font-medium transition-colors ${
          effectiveLocale === "ka"
            ? "bg-matcher text-white"
            : "text-gray-600 hover:bg-gray-100 hover:text-matcher-dark"
        }`}
        title="ქართული"
      >
        KA
      </button>
    </div>
  );
}
