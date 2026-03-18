"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { CheckCircle2, FileText, XCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import Logo from "@/components/Logo";
import Footer from "@/components/Footer";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import InteractiveHero from "@/components/InteractiveHero";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { useTheme } from "@/components/theme/ThemeProvider";

export default function Home() {
  const t = useTranslations("home");
  const tCommon = useTranslations("common");
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [antiResumeImgLoaded, setAntiResumeImgLoaded] = useState(false);
  const [antiResumeImgError, setAntiResumeImgError] = useState(false);

  const liveHeroLabels = {
    segmentedCandidate: t("liveHero.segmentedCandidate"),
    segmentedEmployer: t("liveHero.segmentedEmployer"),
    howItWorks: t("liveHero.howItWorksTitle"),
    like: t("liveHero.like"),
    nope: t("liveHero.nope"),
    swipeInstruction: t("liveHero.swipeInstruction"),
    tapToExpand: t("liveHero.tapToExpand"),
    hideDetails: t("liveHero.hideDetails"),
    jobDescription: t("liveHero.jobDescription"),
    techStack: t("liveHero.techStack"),
    itsAMatchEyebrow: t("liveHero.itsAMatchEyebrow"),
    itsAMatchTitle: t("liveHero.itsAMatchTitle"),
    signUp: t("liveHero.signUp"),
    keepSwiping: t("liveHero.keepSwiping"),
    noMoreDemoCardsTitle: t("liveHero.noMoreDemoCardsTitle"),
    noMoreDemoCardsSubtitle: t("liveHero.noMoreDemoCardsSubtitle"),
    getStarted: t("liveHero.getStarted"),
  } as const;

  const demoCards = t.raw("liveHero.demoCards") as Array<import("@/components/InteractiveHero").DemoJobCard>;

  const headingClass = isDark
    ? "font-heading text-center text-xl font-extrabold tracking-tight text-white sm:text-2xl md:text-3xl"
    : "font-heading text-center text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl md:text-3xl";

  const glassCard = isDark
    ? "border-white/15 bg-white/10 text-white shadow-xl shadow-black/10 backdrop-blur-md"
    : "border-gray-200 bg-white text-gray-900 shadow-sm";

  const glassCardStrong = isDark
    ? "border-white/20 bg-white/10 text-white shadow-2xl shadow-black/20 backdrop-blur-md"
    : "border-matcher/30 bg-white text-gray-900 shadow-sm";

  return (
    <main className={`relative min-h-screen overflow-hidden ${isDark ? "bg-[#070B12]" : "bg-white"} ${isDark ? "text-white" : "text-gray-900"}`}>
      {/* Noise filter for collage placeholders (no external URLs) */}
      <svg className="absolute h-0 w-0" aria-hidden>
        <filter id="noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="4"
            result="noise"
          />
          <feColorMatrix in="noise" type="saturate" values="0" />
          <feBlend in="SourceGraphic" in2="noise" mode="overlay" />
        </filter>
      </svg>

      {/* Soft background glow */}
      <div
        className={`absolute inset-0 -z-10 ${
          isDark
            ? "bg-[radial-gradient(ellipse_at_top,rgba(139,195,74,0.22),transparent_55%),radial-gradient(ellipse_at_bottom,rgba(0,173,181,0.20),transparent_55%)]"
            : "bg-gradient-to-b from-matcher-pale via-matcher-mint/30 to-white"
        }`}
      />

      {/* Navbar */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        <Logo height={108} />
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <ThemeToggle />
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/login"
              className={
                isDark
                  ? "inline-block rounded-full bg-white/10 px-5 py-2 text-sm font-semibold text-white shadow-sm backdrop-blur-md hover:bg-white/15"
                  : "inline-block rounded-full bg-matcher px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-matcher-dark"
              }
            >
              {tCommon("login")}
            </Link>
          </motion.div>
        </div>
      </header>

      <InteractiveHero
        candidateCopy={{
          eyebrow: t("liveHero.candidate.eyebrow"),
          title: t("liveHero.candidate.title"),
          subtitle: t("liveHero.candidate.subtitle"),
          ctaPrimary: tCommon("getMatched"),
          ctaSecondary: tCommon("imHiring"),
        }}
        employerCopy={{
          eyebrow: t("liveHero.employer.eyebrow"),
          title: t("liveHero.employer.title"),
          subtitle: t("liveHero.employer.subtitle"),
          ctaPrimary: tCommon("imHiring"),
          ctaSecondary: tCommon("getMatched"),
        }}
        swapWords={[t("liveHero.swapWords.job"), t("liveHero.swapWords.candidate")]}
        candidateHowItWorks={[
          { title: t("liveHero.candidate.steps.step1Title"), text: t("liveHero.candidate.steps.step1Text") },
          { title: t("liveHero.candidate.steps.step2Title"), text: t("liveHero.candidate.steps.step2Text") },
          { title: t("liveHero.candidate.steps.step3Title"), text: t("liveHero.candidate.steps.step3Text") },
        ]}
        employerHowItWorks={[
          { title: t("liveHero.employer.steps.step1Title"), text: t("liveHero.employer.steps.step1Text") },
          { title: t("liveHero.employer.steps.step2Title"), text: t("liveHero.employer.steps.step2Text") },
          { title: t("liveHero.employer.steps.step3Title"), text: t("liveHero.employer.steps.step3Text") },
        ]}
        labels={liveHeroLabels}
        demoCards={demoCards}
        theme={isDark ? "dark" : "light"}
      />

      {/* Anti-Resume comparison */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          {/* Old school resume */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`relative overflow-hidden rounded-3xl border p-6 shadow-sm ${isDark ? "border-white/15 bg-white/5 text-white/90 shadow-black/15 backdrop-blur-md" : "border-gray-200 bg-white text-gray-900"}`}
          >
            {isDark ? (
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" aria-hidden />
            ) : null}
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${isDark ? "text-white/60" : "text-gray-500"}`}>
                  {t("antiResume.oldSchool")}
                </p>
                <h2 className="font-heading mt-2 text-2xl font-extrabold tracking-tight">
                  {t("antiResume.resumeTitle")}
                </h2>
                <p className={`mt-2 text-sm ${isDark ? "text-white/70" : "text-gray-600"}`}>
                  {t("antiResume.resumeSubtitle")}
                </p>
              </div>
              <motion.div
                animate={{ rotate: [0, -4, 4, -3, 3, 0] }}
                transition={{ duration: 0.7, repeat: Infinity, repeatDelay: 0.8 }}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold ${
                  isDark ? "border-white/15 bg-white/10 text-white/80" : "border-gray-200 bg-gray-50 text-gray-700"
                }`}
              >
                <XCircle className={`h-4 w-4 ${isDark ? "text-rose-400" : "text-rose-500"}`} />
                {t("antiResume.no")}
              </motion.div>
            </div>

            <div className={`relative mt-6 rounded-2xl border p-5 ${isDark ? "border-white/10 bg-white/5" : "border-gray-200 bg-gray-50"}`}>
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isDark ? "bg-white/10" : "bg-white"}`}>
                  <FileText className={`h-5 w-5 ${isDark ? "text-white/75" : "text-gray-600"}`} />
                </div>
                <div className="min-w-0">
                  <div className={`h-3 w-40 rounded ${isDark ? "bg-white/10" : "bg-gray-200"}`} />
                  <div className={`mt-2 h-3 w-28 rounded ${isDark ? "bg-white/10" : "bg-gray-200"}`} />
                </div>
              </div>
              <div className="mt-5 space-y-2">
                <div className={`h-2.5 w-full rounded ${isDark ? "bg-white/10" : "bg-gray-200"}`} />
                <div className={`h-2.5 w-11/12 rounded ${isDark ? "bg-white/10" : "bg-gray-200"}`} />
                <div className={`h-2.5 w-10/12 rounded ${isDark ? "bg-white/10" : "bg-gray-200"}`} />
                <div className={`h-2.5 w-9/12 rounded ${isDark ? "bg-white/10" : "bg-gray-200"}`} />
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {(t.raw("antiResume.resumeChips") as string[]).map((x) => (
                  <span
                    key={x}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                      isDark ? "border-white/10 bg-white/5 text-white/70" : "border-gray-200 bg-white text-gray-600"
                    }`}
                  >
                    {x}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Matcher card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`relative overflow-hidden rounded-3xl border p-6 ${isDark ? "border-white/20 bg-white/10 text-white shadow-2xl shadow-black/20 backdrop-blur-md" : "border-matcher/30 bg-white text-gray-900 shadow-sm"}`}
          >
            <div
              className={`absolute inset-0 ${
                isDark
                  ? "bg-[radial-gradient(circle_at_top,rgba(139,195,74,0.22),transparent_50%),radial-gradient(circle_at_bottom,rgba(0,173,181,0.22),transparent_55%)]"
                  : "bg-gradient-to-br from-matcher-pale to-white"
              }`}
              aria-hidden
            />
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${isDark ? "text-white/70" : "text-gray-600"}`}>
                  {t("antiResume.newWay")}
                </p>
                <h2 className="font-heading mt-2 text-2xl font-extrabold tracking-tight">
                  {t("antiResume.matcherCardTitle")}
                </h2>
                <p className={`mt-2 text-sm ${isDark ? "text-white/80" : "text-gray-600"}`}>
                  {t("antiResume.matcherCardSubtitle")}
                </p>
              </div>
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold ${
                  isDark ? "border-white/20 bg-white/10 text-white" : "border-gray-200 bg-white text-gray-700"
                }`}
              >
                <CheckCircle2 className={`h-4 w-4 ${isDark ? "text-emerald-300" : "text-emerald-600"}`} />
                {t("antiResume.yes")}
              </motion.div>
            </div>

            <div className={`relative mt-6 overflow-hidden rounded-2xl border ${isDark ? "border-white/15 bg-white/10" : "border-gray-200 bg-white"}`}>
              <div className={`relative aspect-[16/9] w-full overflow-hidden ${isDark ? "bg-white/5" : "bg-gray-100"}`}>
                {!antiResumeImgLoaded && (
                  <div
                    className={`absolute inset-0 animate-pulse ${isDark ? "bg-white/10" : "bg-gray-200"}`}
                    aria-hidden
                  />
                )}
                {antiResumeImgError && (
                  <div
                    className={`absolute inset-0 ${
                      isDark
                        ? "bg-gradient-to-br from-white/10 via-white/5 to-white/10"
                        : "bg-gradient-to-br from-matcher-pale via-white to-matcher-mint/40"
                    }`}
                    aria-hidden
                  />
                )}
                <Image
                  src={t("antiResume.matcherDemoCard.photo")}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 520px, 92vw"
                  className={`object-cover transition-opacity duration-300 ${
                    antiResumeImgLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  unoptimized
                  referrerPolicy="no-referrer"
                  onLoadingComplete={() => setAntiResumeImgLoaded(true)}
                  onError={() => {
                    setAntiResumeImgError(true);
                    setAntiResumeImgLoaded(true);
                  }}
                />
                <div className={`absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t ${isDark ? "from-black/65" : "from-white/70"} to-transparent`} aria-hidden />
              </div>
              <div className="p-5">
                <p className="font-heading text-lg font-bold">{t("antiResume.matcherDemoCard.title")}</p>
                <p className={`mt-1 text-sm font-semibold ${isDark ? "text-white/80" : "text-gray-600"}`}>{t("antiResume.matcherDemoCard.company")}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(t.raw("antiResume.matcherDemoCard.chips") as string[]).map((x) => (
                    <span
                      key={x}
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                        isDark ? "border-white/15 bg-white/10 text-white/90" : "border-gray-200 bg-gray-50 text-gray-700"
                      }`}
                    >
                      {x}
                    </span>
                  ))}
                </div>
              </div>
              <div className={`flex items-center justify-between border-t px-5 py-4 ${isDark ? "border-white/10 bg-white/5" : "border-gray-200 bg-gray-50"}`}>
                <p className={`text-xs font-semibold ${isDark ? "text-white/70" : "text-gray-600"}`}>{t("antiResume.matcherDemoCard.footerLeft")}</p>
                <p className="rounded-full bg-matcher-bright px-3 py-1 text-xs font-black text-charcoal">
                  {t("antiResume.matcherDemoCard.footerRight")}
                </p>
              </div>
            </div>

            <div className="relative mt-6 flex flex-wrap gap-3">
              <Link
                href="/userFlow/1"
                className="inline-flex items-center justify-center rounded-xl bg-matcher px-6 py-3 font-semibold text-white hover:bg-matcher-dark"
              >
                {t("antiResume.ctaPrimary")}
              </Link>
              <Link
                href="/about"
                className={
                  isDark
                    ? "inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-6 py-3 font-semibold text-white/90 hover:bg-white/15"
                    : "inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-800 hover:bg-gray-50"
                }
              >
                {t("antiResume.ctaSecondary")}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 md:py-20">
        <h2 className={headingClass}>{t("testimonialsTitle")}</h2>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 sm:gap-5 md:grid-cols-3 md:gap-6 md:mt-12">
          {[
            {
              ...t.raw("testimonials.nini"),
              accent: "border-l-matcher bg-matcher-mint/40",
            },
            {
              ...t.raw("testimonials.giorgi"),
              accent: "border-l-matcher-teal bg-matcher-pale/60",
            },
            {
              ...t.raw("testimonials.mariam"),
              accent: "border-l-matcher-amber bg-matcher-mint/30",
            },
          ].map((item) => (
            <div
              key={item.name}
              className={`rounded-2xl border p-4 sm:p-5 md:p-6 ${glassCard}`}
            >
              <p className={isDark ? "text-white/80" : "text-gray-700"}>&ldquo;{item.quote}&rdquo;</p>
              <p className={isDark ? "mt-4 text-sm font-bold text-white" : "font-heading mt-4 text-sm font-bold text-gray-900"}>
                {item.name}, {item.city}
              </p>
              <p className={isDark ? "text-sm font-semibold text-white/60" : "text-sm font-medium text-gray-600"}>{item.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trusted – social proof */}
      <section className={`${isDark ? "border-t border-white/10" : "border-t border-gray-200"} py-12 sm:py-14 md:py-16`}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <p className={isDark ? "text-center text-xs font-semibold uppercase tracking-[0.2em] text-white/65" : "text-center text-xs font-semibold uppercase tracking-[0.2em] text-gray-500"}>
            {t("socialProofTitle")}
          </p>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className={`rounded-2xl border px-6 py-6 text-center sm:px-8 sm:py-8 ${glassCard}`}
            >
              <p className={isDark ? "font-heading text-3xl font-extrabold text-white sm:text-4xl" : "font-heading text-3xl font-extrabold text-gray-900 sm:text-4xl"}>
                20+
              </p>
              <p className={isDark ? "mt-1 text-sm font-semibold text-white/70" : "mt-1 text-sm font-medium text-gray-600"}>
                {t("socialProofCompanies")}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className={`rounded-2xl border px-6 py-6 text-center sm:px-8 sm:py-8 ${glassCard}`}
            >
              <p className={isDark ? "font-heading text-3xl font-extrabold text-white sm:text-4xl" : "font-heading text-3xl font-extrabold text-gray-900 sm:text-4xl"}>
                150
              </p>
              <p className={isDark ? "mt-1 text-sm font-semibold text-white/70" : "mt-1 text-sm font-medium text-gray-600"}>
                {t("socialProofVacancies")}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className={`rounded-2xl border px-6 py-6 text-center sm:px-8 sm:py-8 ${glassCard}`}
            >
              <p className={isDark ? "font-heading text-3xl font-extrabold text-white sm:text-4xl" : "font-heading text-3xl font-extrabold text-gray-900 sm:text-4xl"}>
                1,000+
              </p>
              <p className={isDark ? "mt-1 text-sm font-semibold text-white/70" : "mt-1 text-sm font-medium text-gray-600"}>
                {t("socialProofUsers")}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 md:py-20">
        <div
          className={
            isDark
              ? "rounded-3xl border border-white/15 bg-white/10 p-8 text-center text-white shadow-2xl shadow-black/15 backdrop-blur-md sm:p-10 md:p-12 lg:p-16"
              : "rounded-2xl border border-matcher bg-gradient-to-br from-matcher-pale to-matcher-mint p-8 text-center sm:p-10 md:p-12 lg:p-16"
          }
        >
          <h2 className={isDark ? "font-heading text-xl font-extrabold tracking-tight text-white sm:text-2xl md:text-3xl" : "font-heading text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl md:text-3xl"}>
            {t("readyTitle")}
          </h2>
          <p className={isDark ? "mt-2 text-white/75 sm:mt-3 sm:text-base" : "mt-2 text-gray-600 sm:mt-3 sm:text-base"}>
            {t("readySubtitle")}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:mt-8 sm:gap-4">
            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/userFlow/1"
                className="inline-block rounded-xl bg-matcher px-6 py-3 font-semibold text-white hover:bg-matcher-dark"
              >
                {tCommon("getMatched")}
              </Link>
            </motion.div>
            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/employer"
                className={
                  isDark
                    ? "inline-block rounded-xl border border-white/20 bg-white/10 px-6 py-3 font-semibold text-white/90 hover:bg-white/15"
                    : "inline-block rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-800 hover:bg-gray-50"
                }
              >
                {tCommon("imHiring")}
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
      <Footer variant={isDark ? "dark" : "light"} />
    </main>
  );
}
