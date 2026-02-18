"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo, animate } from "framer-motion";
import { Link } from "@/i18n/navigation";
import Logo from "@/components/Logo";
import Footer from "@/components/Footer";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import MatchProgressRing from "@/components/MatchProgressRing";

function SwipeCard({
  job,
  exitDir,
  onDragEnd,
  t,
}: {
  job: { title: string; company: string; location: string; workType: string; salary: string; match: number; employer: string; photo: string };
  exitDir: "left" | "right" | null;
  onDragEnd: (info: PanInfo) => boolean;
  t: (key: string) => string;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-12, 12]);
  const likeOpacity = useTransform(x, [0, 100, 200], [0, 0.5, 1]);
  const nopeOpacity = useTransform(x, [-200, -100, 0], [1, 0.5, 0]);

  function handleDragEnd(e: unknown, info: PanInfo) {
    const consumed = onDragEnd(info);
    if (!consumed) {
      animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
    }
  }

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: -180, right: 180 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      style={{ x, rotate }}
      initial={{ opacity: 1, scale: 1, x: 0 }}
      exit={{
        opacity: 0,
        x: exitDir === "right" ? 400 : exitDir === "left" ? -400 : 0,
        rotate: exitDir === "right" ? 20 : exitDir === "left" ? -20 : 0,
        transition: { duration: 0.3, ease: "easeIn" },
      }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className="absolute inset-0 flex cursor-grab flex-col active:cursor-grabbing"
    >
      {/* Card content – fits in viewport; pointer-events-none so whole area is draggable */}
      <div className="pointer-events-none flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl bg-gray-900 shadow-2xl shadow-gray-300/50 ring-2 ring-white/20">
        {/* Image – fixed share of height so card always fits */}
        <div className="relative h-[52%] min-h-0 w-full shrink-0 overflow-hidden">
          <img
            src={job.photo}
            alt=""
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute right-3 top-3 rounded-full bg-matcher-bright px-2.5 py-1 text-xs font-bold tracking-tight text-charcoal shadow-lg sm:right-4 sm:top-4 sm:px-3 sm:py-1.5 sm:text-sm">
            {job.salary}
          </div>
          <div className="absolute left-3 top-3 sm:left-4 sm:top-4">
            <MatchProgressRing percent={job.match} size={40} className="text-matcher-bright">
              {job.match}%
            </MatchProgressRing>
          </div>
          <motion.div
            style={{ opacity: likeOpacity }}
            className="pointer-events-none absolute inset-0 flex items-center justify-end pr-6"
          >
            <div className="rounded-xl border-2 border-matcher bg-matcher/90 px-4 py-2 shadow-xl -rotate-12">
              <span className="text-xl font-black uppercase tracking-wider text-white sm:text-2xl">{t("demoLike")}</span>
            </div>
          </motion.div>
          <motion.div
            style={{ opacity: nopeOpacity }}
            className="pointer-events-none absolute inset-0 flex items-center justify-start pl-6"
          >
            <div className="rounded-xl border-2 border-rose-400 bg-rose-500/90 px-4 py-2 shadow-xl rotate-12">
              <span className="text-xl font-black uppercase tracking-wider text-white sm:text-2xl">{t("demoUnlike")}</span>
            </div>
          </motion.div>
        </div>

        {/* Info block – vibe row + location, workType */}
        <div className="flex min-h-0 flex-1 flex-col justify-between overflow-hidden p-3 text-white sm:p-4">
          <div className="min-w-0">
            <h2 className="font-heading truncate text-lg font-bold sm:text-xl">{job.title}</h2>
            <p className="mt-0.5 truncate text-sm font-medium text-white/90 sm:text-base">{job.company}</p>
            <p className="mt-1.5 flex flex-wrap items-center gap-1.5 sm:mt-2 sm:gap-2">
              <span className="rounded-md bg-white/15 px-2 py-0.5 text-xs font-medium sm:px-2.5 sm:py-1 sm:text-sm" title="No CV needed">
                <svg className="inline h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </span>
              <span className="rounded-md bg-white/15 px-2 py-0.5 text-xs font-medium sm:px-2.5 sm:py-1 sm:text-sm" title="Weekly pay">
                <svg className="inline h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v2a2 2 0 002 2h2m2 4h10a2 2 2 0 002-2v-2a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2zm0 0V7a2 2 0 012-2h2a2 2 0 012 2v0" /></svg>
              </span>
              <span className="rounded-md bg-white/15 px-2 py-0.5 text-xs font-medium sm:px-2.5 sm:py-1 sm:text-sm">{job.location}</span>
              <span className="rounded-md bg-white/15 px-2 py-0.5 text-xs font-medium sm:px-2.5 sm:py-1 sm:text-sm">{job.workType}</span>
            </p>
          </div>
          <p className="mt-2 shrink-0 text-xs font-medium text-white/80 sm:mt-3">{t("demoSwipeInstruction")}</p>
        </div>
      </div>
    </motion.div>
  );
}

function InteractiveSwipeDemo({
  jobs,
  chips,
  selectedChip,
  onSelectChip,
  t,
}: {
  jobs: Array<{ title: string; company: string; location: string; workType: string; salary: string; match: number; employer: string; photo: string }>;
  chips: readonly { id: string; label: string }[];
  selectedChip: string;
  onSelectChip: (id: string) => void;
  t: (key: string) => string;
}) {
  const [index, setIndex] = useState(0);
  const [exitDir, setExitDir] = useState<"left" | "right" | null>(null);
  const current = jobs[index % jobs.length];

  function handleDragEnd(info: PanInfo): boolean {
    const threshold = 60;
    if (info.offset.x > threshold) {
      setExitDir("right");
      setTimeout(() => {
        setIndex((i) => i + 1);
        setExitDir(null);
      }, 180);
      return true;
    }
    if (info.offset.x < -threshold) {
      setExitDir("left");
      setTimeout(() => {
        setIndex((i) => i + 1);
        setExitDir(null);
      }, 180);
      return true;
    }
    return false;
  }

  function handleSwipe(dir: "left" | "right") {
    setExitDir(dir);
    setTimeout(() => {
      setIndex((i) => i + 1);
      setExitDir(null);
    }, 220);
  }

  useEffect(() => {
    setIndex(0);
    setExitDir(null);
  }, [selectedChip]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative z-10 flex flex-col rounded-2xl border border-gray-200/80 bg-white/95 p-4 shadow-xl shadow-matcher/10 backdrop-blur-sm sm:p-5 md:p-6"
    >
      <p className="text-sm font-semibold text-gray-600">{t("assistantDemo")}</p>
      <p className="mt-1 text-xs text-gray-400">{t("assistantGreeting")}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {chips.map((chip) => (
          <motion.button
            key={chip.id}
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelectChip(chip.id)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${
              selectedChip === chip.id
                ? "border-matcher bg-matcher-mint text-matcher-dark"
                : "border-gray-200 bg-white hover:border-matcher"
            }`}
          >
            {chip.label}
          </motion.button>
        ))}
      </div>

      <div className="relative mt-4 aspect-[3/4] max-h-[320px] w-full overflow-hidden rounded-3xl sm:max-h-[380px] md:max-h-[420px]">
        {current && (
          <AnimatePresence mode="wait">
            <SwipeCard
              key={`${selectedChip}-${index}`}
              job={current}
              exitDir={exitDir}
              onDragEnd={handleDragEnd}
              t={t}
            />
          </AnimatePresence>
        )}
      </div>

      <p className="mt-4 text-center text-xs text-gray-500">
        {t("demoSwipeInstruction")}
      </p>
      <div className="mt-4 flex justify-center gap-6 sm:gap-8">
        <motion.button
          type="button"
          onClick={() => handleSwipe("left")}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-red-500 text-white shadow-lg shadow-rose-300/50 transition-shadow hover:shadow-xl hover:shadow-rose-400/50 sm:h-16 sm:w-16"
        >
          <span className="text-2xl font-bold">✕</span>
        </motion.button>
        <motion.button
          type="button"
          onClick={() => handleSwipe("right")}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-matcher to-matcher-teal text-white shadow-lg shadow-matcher/40 transition-shadow hover:shadow-xl hover:shadow-matcher/50 sm:h-16 sm:w-16"
        >
          <span className="text-2xl">♥</span>
        </motion.button>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const t = useTranslations("home");
  const tCommon = useTranslations("common");

  const CHIPS = [
    { id: "barista", label: t("chips.barista") },
    { id: "parttime", label: t("chips.parttime") },
    { id: "noexp", label: t("chips.noexp") },
  ] as const;

  const demoJobs = {
    barista: t.raw("demoJobs.barista") as Array<{
      title: string;
      company: string;
      location: string;
      workType: string;
      salary: string;
      match: number;
      employer: string;
      photo: string;
    }>,
    parttime: t.raw("demoJobs.parttime") as Array<{
      title: string;
      company: string;
      location: string;
      workType: string;
      salary: string;
      match: number;
      employer: string;
      photo: string;
    }>,
    noexp: t.raw("demoJobs.noexp") as Array<{
      title: string;
      company: string;
      location: string;
      workType: string;
      salary: string;
      match: number;
      employer: string;
      photo: string;
    }>,
  };

  const [selectedChip, setSelectedChip] = useState<string>("barista");
  const jobs = demoJobs[selectedChip as keyof typeof demoJobs] ?? demoJobs.barista;

  // Dynamic hero: alternate "job" / "candidate"
  const [heroWord, setHeroWord] = useState<"job" | "candidate">("job");
  useEffect(() => {
    const id = setInterval(() => {
      setHeroWord((w) => (w === "job" ? "candidate" : "job"));
    }, 2800);
    return () => clearInterval(id);
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-white">
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
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-matcher-pale via-matcher-mint/30 to-white" />

      {/* Navbar */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        <Logo height={108} />
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/login"
              className="inline-block rounded-full bg-matcher px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-matcher-dark"
            >
              {tCommon("login")}
            </Link>
          </motion.div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-6 px-4 py-8 sm:gap-8 sm:px-6 sm:py-12 md:grid-cols-2 md:gap-10 md:py-16 lg:gap-12 lg:py-20">
        {/* Left side – hero text */}
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-balance text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-5xl"
          >
            {t("heroTitlePrefix")}
            <AnimatePresence mode="wait">
              <motion.span
                key={heroWord}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{
                  duration: 0.4,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className="inline-block text-matcher-dark"
              >
                {heroWord === "job" ? t("heroWordJob") : t("heroWordCandidate")}
              </motion.span>
            </AnimatePresence>
            {t("heroTitleSuffix")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-balance mt-4 text-base text-gray-600 sm:mt-5 sm:text-lg"
          >
            {t("heroSubtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 flex flex-wrap gap-3 sm:mt-8 sm:gap-4"
          >
            <motion.div
              whileHover={{ y: -2, boxShadow: "0 8px 20px -8px rgba(139, 195, 74, 0.5)" }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href="/userFlow/1"
                className="inline-block rounded-xl bg-matcher px-6 py-3 font-semibold text-white shadow hover:bg-matcher-dark"
              >
                {tCommon("getMatched")}
              </Link>
            </motion.div>
            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/employer"
                className="inline-block rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-800 hover:bg-gray-50"
              >
                {tCommon("imHiring")}
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-5 flex flex-wrap gap-4 text-xs text-gray-500 sm:mt-6 sm:gap-6 sm:text-sm"
          >
            <p>{t("instantMatching")}</p>
            <p>{t("entryLevel")}</p>
            <p>{t("builtForGeorgia")}</p>
          </motion.div>
        </div>

        {/* Right side – interactive swipe demo */}
        <InteractiveSwipeDemo
          jobs={jobs}
          chips={CHIPS}
          selectedChip={selectedChip}
          onSelectChip={setSelectedChip}
          t={t}
        />
      </section>

      {/* Social proof – stats instead of logos */}
      <section className="border-t border-matcher/15 bg-gradient-to-b from-matcher-pale/40 to-matcher-mint/20 py-12 sm:py-14 md:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-matcher-dark/90">
            {t("socialProofTitle")}
          </p>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="rounded-2xl border border-matcher/20 bg-white px-6 py-6 text-center shadow-sm sm:px-8 sm:py-8"
            >
              <p className="font-heading text-3xl font-bold text-matcher-dark sm:text-4xl">20+</p>
              <p className="mt-1 text-sm font-medium text-gray-600">{t("socialProofCompanies")}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="rounded-2xl border border-matcher/20 bg-white px-6 py-6 text-center shadow-sm sm:px-8 sm:py-8"
            >
              <p className="font-heading text-3xl font-bold text-matcher-dark sm:text-4xl">150</p>
              <p className="mt-1 text-sm font-medium text-gray-600">{t("socialProofVacancies")}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="rounded-2xl border border-matcher/20 bg-white px-6 py-6 text-center shadow-sm sm:px-8 sm:py-8"
            >
              <p className="font-heading text-3xl font-bold text-matcher-dark sm:text-4xl">1,000+</p>
              <p className="mt-1 text-sm font-medium text-gray-600">{t("socialProofUsers")}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 md:py-20">
        <h2 className="text-center text-xl font-bold tracking-tight text-gray-900 sm:text-2xl md:text-3xl">
          {t("testimonialsTitle")}
        </h2>
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
              className={`rounded-2xl border border-gray-200 border-l-4 bg-white p-4 sm:p-5 md:p-6 ${item.accent}`}
            >
              <p className="text-gray-600">&ldquo;{item.quote}&rdquo;</p>
              <p className="mt-4 text-sm font-semibold text-gray-900">
                {item.name}, {item.city}
              </p>
              <p className="text-sm text-gray-500">{item.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-matcher/20 bg-gradient-to-b from-matcher-mint/20 to-matcher-pale/50 py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center text-xl font-bold tracking-tight text-gray-900 sm:text-2xl md:text-3xl">
            {t("howItWorksTitle")}
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:mt-10 sm:gap-6 md:grid-cols-3 md:gap-8 md:mt-12">
            {[
              {
                step: 1,
                icon: "✏️",
                title: t("howItWorks.step1Title"),
                text: t("howItWorks.step1Text"),
                bg: "bg-matcher-mint/50 border-matcher/30",
              },
              {
                step: 2,
                icon: "⚡",
                title: t("howItWorks.step2Title"),
                text: t("howItWorks.step2Text"),
                bg: "bg-matcher-pale/80 border-matcher-dark/20",
              },
              {
                step: 3,
                icon: "✓",
                title: t("howItWorks.step3Title"),
                text: t("howItWorks.step3Text"),
                bg: "bg-matcher-mint/40 border-matcher/30",
              },
            ].map((item) => (
              <div
                key={item.step}
                className={`rounded-2xl border-2 bg-white p-5 text-center sm:p-6 ${item.bg}`}
              >
                <span className="text-2xl">{item.icon}</span>
                <p className="mt-3 font-semibold text-gray-900">{item.title}</p>
                <p className="mt-1 text-sm text-gray-500">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LandingStats / ValueProp */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12 md:py-16">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 md:gap-6">
          {(["stat_1", "stat_2", "stat_3", "stat_4"] as const).map((key, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.5,
                delay: i * 0.08,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              whileHover={{
                y: -6,
                scale: 1.03,
                transition: { duration: 0.2 },
              }}
              whileTap={{ scale: 0.98 }}
              className={`stats-value-prop relative overflow-hidden rounded-xl border-2 p-4 text-center shadow-sm transition-shadow hover:shadow-md sm:rounded-2xl sm:p-5 md:p-6 ${
                key === "stat_1"
                  ? "border-matcher/30 bg-matcher-pale/60"
                  : key === "stat_2"
                    ? "border-matcher-teal/25 bg-matcher-mint/40"
                    : key === "stat_3"
                      ? "border-matcher-amber/25 bg-matcher-amber/10"
                      : "border-matcher-dark/20 bg-matcher-pale/50"
              }`}
            >
              <motion.span
                className="block text-3xl font-bold tracking-tight text-primary sm:text-4xl"
                initial={{ scale: 0.9 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 + 0.1 }}
              >
                {t(`stats.${key}_value`)}
              </motion.span>
              <motion.div
                className="mt-1.5 text-sm font-medium text-muted-foreground leading-relaxed"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 + 0.2 }}
              >
                {t(`stats.${key}_desc`)}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 md:py-20">
        <div
          className="rounded-2xl border border-matcher bg-gradient-to-br from-matcher-pale to-matcher-mint p-8 text-center sm:p-10 md:p-12 lg:p-16"
        >
          <h2 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl md:text-3xl">
            {t("readyTitle")}
          </h2>
          <p className="mt-2 text-gray-600 sm:mt-3 sm:text-base">
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
                className="inline-block rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-800 hover:bg-gray-50"
              >
                {tCommon("imHiring")}
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
