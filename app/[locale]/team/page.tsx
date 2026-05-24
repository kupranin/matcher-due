"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import Logo from "@/components/Logo";
import Footer from "@/components/Footer";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { useTheme } from "@/components/theme/ThemeProvider";
import { SwipeTeamCarousel, type TeamMember } from "@/components/FlippingTeamCard";

const memberKeys = ["ketevan", "nino"] as const;
type MemberKey = (typeof memberKeys)[number];

const MEMBER_PHOTOS: Record<MemberKey, string> = {
  nino: "/team/nino.png",
  ketevan: "/team/ketevan.png",
};

export default function TeamPage() {
  const t = useTranslations("team");
  const tCommon = useTranslations("common");
  const values = t.raw("values") as string[];
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const teamMembers: TeamMember[] = memberKeys.map((key) => ({
    id: key,
    name: t(`members.${key}.name`),
    role: t(`members.${key}.role`),
    photo: MEMBER_PHOTOS[key],
    tags: (t.raw(`members.${key}.tags`) as string[]) ?? [],
    why: t(`members.${key}.why`),
  }));

  return (
    <div className={isDark ? "relative min-h-screen bg-[#070B12] text-white" : "relative min-h-screen bg-white text-gray-900"}>
      {/* Soft background gradient */}
      <div
        className={
          isDark
            ? "pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(139,195,74,0.18),transparent_55%),radial-gradient(ellipse_at_bottom,rgba(0,173,181,0.14),transparent_55%)]"
            : "pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-matcher-pale/40 via-white to-white"
        }
      />

      <header className={isDark ? "border-b border-white/10 bg-black/30 backdrop-blur-sm" : "border-b border-gray-100/80 bg-white/80 backdrop-blur-sm"}>
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="shrink-0 transition-opacity hover:opacity-90">
            <Logo height={56} />
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggle />
            <Link
              href="/"
              className={
                isDark
                  ? "shrink-0 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10"
                  : "shrink-0 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-matcher hover:bg-matcher-pale hover:text-matcher-dark"
              }
            >
              {tCommon("backToHome")}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-14 sm:px-6 sm:py-18 md:py-20">
        {/* Hero */}
        <section className="text-center">
          <h1 className={isDark ? "text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl" : "text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-5xl"}>
            {t("title")}
          </h1>
          <p className={isDark ? "mt-4 text-xl text-white/70 sm:text-2xl" : "mt-4 text-xl text-gray-600 sm:text-2xl"}>
            {t("subtitle")}
          </p>
          <p className={isDark ? "mt-8 text-base leading-relaxed text-white/70 sm:text-lg" : "mt-8 text-base leading-relaxed text-gray-600 sm:text-lg"}>
            {t("intro")}
          </p>
        </section>

        {/* Section 1: Why we started */}
        <section className="mt-14 sm:mt-16 md:mt-18">
          <h2 className={isDark ? "text-xl font-semibold text-white sm:text-2xl" : "text-xl font-semibold text-gray-900 sm:text-2xl"}>
            {t("whyHeading")}
          </h2>
          <p className={isDark ? "mt-4 text-base leading-relaxed text-white/70 sm:text-lg" : "mt-4 text-base leading-relaxed text-gray-600 sm:text-lg"}>
            {t("whyText")}
          </p>
        </section>

        {/* Section 2: Globally local */}
        <section className="mt-14 sm:mt-16 md:mt-18">
          <h2 className={isDark ? "text-xl font-semibold text-white sm:text-2xl" : "text-xl font-semibold text-gray-900 sm:text-2xl"}>
            {t("globalHeading")}
          </h2>
          <p className={isDark ? "mt-4 text-base leading-relaxed text-white/70 sm:text-lg" : "mt-4 text-base leading-relaxed text-gray-600 sm:text-lg"}>
            {t("globalText")}
          </p>
          <p
            className={
              isDark
                ? "mt-6 rounded-xl border-l-4 border-matcher bg-white/5 px-5 py-4 text-sm font-medium italic text-white/80 sm:text-base"
                : "mt-6 rounded-xl border-l-4 border-matcher bg-matcher-pale/60 px-5 py-4 text-sm font-medium italic text-gray-700 sm:text-base"
            }
          >
            {t("globalHighlight")}
          </p>
        </section>

        {/* Section 3: What we believe */}
        <section className="mt-14 sm:mt-16 md:mt-18">
          <h2 className={isDark ? "text-xl font-semibold text-white sm:text-2xl" : "text-xl font-semibold text-gray-900 sm:text-2xl"}>
            {t("beliefsHeading")}
          </h2>
          <ul className="mt-6 space-y-4">
            {Array.isArray(values) &&
              values.map((value, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-matcher" aria-hidden />
                  <span className={isDark ? "text-base leading-relaxed text-white/70 sm:text-lg" : "text-base leading-relaxed text-gray-600 sm:text-lg"}>{value}</span>
                </li>
              ))}
          </ul>
        </section>

        {/* Section 4: Swipe the Team – flip carousel (moved from About) */}
        <section className="mt-16 sm:mt-18 md:mt-20">
          <SwipeTeamCarousel
            title={t("swipeTeam.title")}
            subtitle={t("swipeTeam.subtitle")}
            members={teamMembers}
            theme={isDark ? "dark" : "light"}
          />
        </section>

        {/* Closing section */}
        <section className="mt-16 sm:mt-18 md:mt-20">
          <h2 className={isDark ? "text-xl font-semibold text-white sm:text-2xl" : "text-xl font-semibold text-gray-900 sm:text-2xl"}>
            {t("closingHeading")}
          </h2>
          <p className={isDark ? "mt-4 text-base leading-relaxed text-white/70 sm:text-lg" : "mt-4 text-base leading-relaxed text-gray-600 sm:text-lg"}>
            {t("closingText")}
          </p>
          <p className={isDark ? "mt-10 text-center text-xl font-semibold tracking-tight text-white sm:text-2xl md:text-3xl" : "mt-10 text-center text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl md:text-3xl"}>
            {t("closingLine")}
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
