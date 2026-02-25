"use client";

import { usePathname } from "@/i18n/navigation";
import LanguageSwitcher from "./LanguageSwitcher";

/** Renders LanguageSwitcher fixed top-right except on the home page (where it's in the header next to Login). */
export default function LanguageSwitcherFixed() {
  const pathname = usePathname();
  const isHome = pathname === "/" || pathname === "";
  if (isHome) return null;
  return (
    <div className="fixed right-4 top-4 z-[100] md:right-6 md:top-6">
      <LanguageSwitcher />
    </div>
  );
}
