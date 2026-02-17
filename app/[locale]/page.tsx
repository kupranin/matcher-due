"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo, animate } from "framer-motion";
import { Link } from "@/i18n/navigation";
import Logo from "@/components/Logo";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const PARTNER_SLUGS: Record<string, string> = {
  Gulf: "gulf",
  Nikora: "nikora",
  "2 Nabiji": "2nabiji",
  UGT: "ugt",
  iTechnics: "itechnics",
  "Kursi.ge": "kursi",
};

const DEMO_JOB_IMAGES: Record<string, string[]> = {
  barista: [
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=85",
    "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&q=85",
    "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400&q=85",
  ],
  parttime: [
    "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=85",
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=85",
    "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&q=85",
  ],
  noexp: [
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&q=85",
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=85",
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=85",
  ],
};

function SwipeCard({
  job,
  imgSrc,
  exitDir,
  onDragEnd,
  t,
}: {
  job: { title: string; location: string; match: number };
  imgSrc: string;
  exitDir: "left" | "right" | null;
  onDragEnd: (info: PanInfo) => boolean;
  t: (key: string) => string;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-180, 180], [-10, 10]);
  const likeOpacity = useTransform(x, [0, 60, 140], [0, 0.7, 1]);
  const nopeOpacity = useTransform(x, [-140, -60, 0], [1, 0.7, 0]);

  function handleDragEnd(e: unknown, info: PanInfo) {
    const consumed = onDragEnd(info);
    if (!consumed) {
      animate(x, 0, { type: "spring", stiffness: 280, damping: 28 });
    }
  }

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: -120, right: 120 }}
      dragElastic={0.4}
      onDragEnd={handleDragEnd}
      style={{ x, rotate }}
      initial={{ opacity: 1, scale: 1, x: 0 }}
      exit={{
        opacity: 0,
        x: exitDir === "right" ? 200 : exitDir === "left" ? -200 : 0,
        scale: 0.92,
        transition: { duration: 0.2, ease: "easeIn" },
      }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
    >
      <div className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
        <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-gray-100">
          <Image
            src={imgSrc}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
            aria-hidden
          />
          <span className="absolute right-2 top-2 rounded-full bg-matcher/95 px-2.5 py-0.5 text-xs font-bold text-white shadow">
            {job.match}% {t("match")}
          </span>
          <p className="absolute bottom-2 left-2 right-2 text-base font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
            {job.title}
          </p>
          <motion.div
            style={{ opacity: likeOpacity }}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg border-2 border-white/90 bg-matcher/95 px-3 py-1.5 text-xs font-bold text-white shadow-lg"
          >
            Like
          </motion.div>
          <motion.div
            style={{ opacity: nopeOpacity }}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-lg border-2 border-white/90 bg-rose-500/95 px-3 py-1.5 text-xs font-bold text-white shadow-lg"
          >
            Nope
          </motion.div>
        </div>
        <div className="shrink-0 bg-white p-4">
          <p className="font-semibold text-gray-900">{job.title}</p>
          <p className="text-sm text-gray-500">{job.location}</p>
        </div>
      </div>
    </motion.div>
  );
}

function InteractiveSwipeDemo({
  jobs,
  jobImages,
  chips,
  selectedChip,
  onSelectChip,
  t,
}: {
  jobs: Array<{ title: string; location: string; match: number }>;
  jobImages: string[];
  chips: readonly { id: string; label: string }[];
  selectedChip: string;
  onSelectChip: (id: string) => void;
  t: (key: string) => string;
}) {
  const [index, setIndex] = useState(0);
  const [exitDir, setExitDir] = useState<"left" | "right" | null>(null);
  const current = jobs[index % jobs.length];
  const imgSrc = jobImages[index % jobImages.length] ?? jobImages[0];

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
      className="relative z-10 flex flex-col rounded-2xl border border-gray-200/80 bg-white/95 p-6 shadow-xl shadow-matcher/10 backdrop-blur-sm"
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

      {/* Photo strip preview */}
      <div className="mt-4 flex gap-1.5 overflow-hidden rounded-lg">
        {[
          "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=120&q=80",
          "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=120&q=80",
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=120&q=80",
          "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=120&q=80",
        ].map((src, i) => (
          <div
            key={i}
            className="h-14 w-12 flex-1 overflow-hidden rounded-md bg-gray-100"
          >
            <Image
              src={src}
              alt=""
              width={48}
              height={56}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>

      <div className="relative mt-4 aspect-[3/4] max-h-[300px] overflow-hidden rounded-xl">
        {current && (
          <AnimatePresence mode="wait">
            <SwipeCard
              key={`${selectedChip}-${index}`}
              job={current}
              imgSrc={imgSrc}
              exitDir={exitDir}
              onDragEnd={handleDragEnd}
              t={t}
            />
          </AnimatePresence>
        )}
      </div>

      <p className="mt-3 text-center text-xs text-gray-400">
        {t("trySwiping")}
      </p>
      <div className="mt-3 flex justify-center gap-5">
        <motion.button
          type="button"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => handleSwipe("left")}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600 shadow-sm transition-colors hover:bg-rose-100"
        >
          ✕
        </motion.button>
        <motion.button
          type="button"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => handleSwipe("right")}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-matcher-mint text-matcher-dark shadow-sm transition-colors hover:bg-matcher/90 hover:text-white"
        >
          ♥
        </motion.button>
      </div>
    </motion.div>
  );
}

function PartnerLogo({
  name,
  domain,
  bg,
  text,
}: {
  name: string;
  domain: string;
  bg: string;
  text: string;
}) {
  const [useFallback, setUseFallback] = useState(false);
  const initials = name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 2).toUpperCase();
  const slug = PARTNER_SLUGS[name] ?? domain.replace(".ge", "");
  const localSrc = `/partners/${slug}.png`;

  if (useFallback) {
    return (
      <div
        className={`flex h-16 w-16 items-center justify-center rounded-2xl ${bg} ${text} text-xs font-bold shadow-md transition-all hover:scale-110 hover:shadow-lg md:h-20 md:w-20 md:text-sm`}
        title={name}
      >
        {initials}
      </div>
    );
  }

  return (
    <div
      className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white p-2 shadow-md transition-all hover:scale-110 hover:shadow-lg md:h-20 md:w-20"
      title={name}
    >
      <Image
        src={localSrc}
        alt={name}
        width={80}
        height={80}
        className="object-contain"
        onError={() => setUseFallback(true)}
      />
    </div>
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
      location: string;
      match: number;
    }>,
    parttime: t.raw("demoJobs.parttime") as Array<{
      title: string;
      location: string;
      match: number;
    }>,
    noexp: t.raw("demoJobs.noexp") as Array<{
      title: string;
      location: string;
      match: number;
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
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo height={88} />

        <div className="flex items-center gap-4">
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
      <section className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-20 md:grid-cols-2">
        {/* Left side – hero text */}
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl font-bold tracking-tight text-gray-900"
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
            className="mt-6 text-lg text-gray-600"
          >
            {t("heroSubtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 flex gap-4"
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
            className="mt-8 flex gap-6 text-sm text-gray-500"
          >
            <p>{t("instantMatching")}</p>
            <p>{t("entryLevel")}</p>
            <p>{t("builtForGeorgia")}</p>
          </motion.div>
        </div>

        {/* Right side – interactive swipe demo */}
        <InteractiveSwipeDemo
          jobs={jobs}
          jobImages={DEMO_JOB_IMAGES[selectedChip] ?? DEMO_JOB_IMAGES.barista}
          chips={CHIPS}
          selectedChip={selectedChip}
          onSelectChip={setSelectedChip}
          t={t}
        />
      </section>

      {/* Collage strip under hero (mobile / secondary) */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mx-auto max-w-6xl px-6 pb-20"
      >
        <div className="flex justify-center gap-3 md:hidden">
          {[
            { img: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200&q=80", label: "Coffee" },
            { img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&q=80", label: "Retail" },
            { img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&q=80", label: "Hotel" },
            { img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=200&q=80", label: "Warehouse" },
          ].map(({ img, label }) => (
            <div
              key={label}
              className="h-20 w-14 overflow-hidden rounded-xl opacity-90"
              style={{
                backgroundImage: `url("${img}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
              title={label}
            />
          ))}
        </div>
      </motion.section>

      {/* Partners / Logos strip */}
      <section className="border-t border-matcher/20 bg-gradient-to-b from-matcher-pale/50 to-matcher-mint/30 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex justify-center">
            <Logo height={48} className="opacity-80" />
          </div>
          <p className="mt-4 text-center text-sm font-medium uppercase tracking-wider text-matcher-dark">
            {t("trustedBy")}
          </p>
          <p className="mt-1.5 text-center text-xs text-gray-600">
            {t("partnerNote")}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {[
              { name: "Gulf", domain: "gulf.ge", bg: "bg-matcher", text: "text-white" },
              { name: "Nikora", domain: "nikora.ge", bg: "bg-matcher-teal", text: "text-white" },
              { name: "2 Nabiji", domain: "2nabiji.ge", bg: "bg-matcher-dark", text: "text-white" },
              { name: "UGT", domain: "ugt.ge", bg: "bg-matcher-amber", text: "text-gray-900" },
              { name: "iTechnics", domain: "itechnics.ge", bg: "bg-matcher-coral", text: "text-white" },
              { name: "Kursi.ge", domain: "kursi.ge", bg: "bg-matcher", text: "text-white" },
            ].map(({ name, domain, bg, text }) => (
              <PartnerLogo key={name} name={name} domain={domain} bg={bg} text={text} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
          {t("testimonialsTitle")}
        </h2>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
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
              className={`rounded-2xl border border-gray-200 border-l-4 bg-white p-6 ${item.accent}`}
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
      <section className="border-t border-matcher/20 bg-gradient-to-b from-matcher-mint/20 to-matcher-pale/50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
            {t("howItWorksTitle")}
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
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
                className={`rounded-2xl border-2 bg-white p-6 text-center ${item.bg}`}
              >
                <span className="text-2xl">{item.icon}</span>
                <p className="mt-3 font-semibold text-gray-900">{item.title}</p>
                <p className="mt-1 text-sm text-gray-500">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Metrics row */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {[
            { value: "2 min", label: t("metrics.setup"), color: "text-matcher-dark" },
            { value: "Top 3", label: t("metrics.matches"), color: "text-matcher-teal" },
            { value: "0", label: t("metrics.cvRequired"), color: "text-matcher" },
            { value: "🇬🇪", label: t("metrics.builtForGeorgia"), color: "text-matcher-dark" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border-2 border-matcher/20 bg-matcher-pale/50 p-6 text-center"
            >
              <p className={`text-2xl font-bold md:text-3xl ${stat.color}`}>
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div
          className="rounded-2xl border border-matcher bg-gradient-to-br from-matcher-pale to-matcher-mint p-12 text-center md:p-16"
        >
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
            {t("readyTitle")}
          </h2>
          <p className="mt-3 text-gray-600">
            {t("readySubtitle")}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
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
    </main>
  );
}
