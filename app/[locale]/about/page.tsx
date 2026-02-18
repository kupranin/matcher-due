"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion, useMotionValue, useTransform, animate, PanInfo, AnimatePresence } from "framer-motion";
import Logo from "@/components/Logo";
import Footer from "@/components/Footer";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { aboutSections } from "@/config/aboutSections";

type AboutSection = (typeof aboutSections)[number];

function SwipeCard({
  section,
  title,
  text,
  onSwipe,
  t,
}: {
  section: AboutSection;
  title: string;
  text: string;
  onSwipe: (dir: "left" | "right") => void;
  t: (key: string) => string;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-12, 12]);
  const likeOpacity = useTransform(x, [0, 80, 160], [0, 0.5, 1]);
  const nopeOpacity = useTransform(x, [-160, -80, 0], [1, 0.5, 0]);

  function handleDragEnd(_: unknown, info: PanInfo) {
    const threshold = 80;
    if (info.offset.x > threshold) onSwipe("right");
    else if (info.offset.x < -threshold) onSwipe("left");
    else animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
  }

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: -180, right: 180 }}
      dragElastic={0.6}
      onDragEnd={handleDragEnd}
      style={{ x, rotate }}
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
    >
      <div
        className={`relative h-full w-full overflow-hidden rounded-2xl border border-gray-100 border-l-4 bg-white p-6 shadow-lg ${section.accent}`}
      >
        {/* Swipe overlays */}
        <motion.div
          style={{ opacity: likeOpacity }}
          className="pointer-events-none absolute inset-0 flex items-center justify-end pr-8"
        >
          <div className="rounded-2xl border-4 border-matcher bg-matcher/90 px-5 py-2.5 shadow-xl -rotate-12">
            <span className="text-2xl font-black uppercase tracking-wider text-white">{t("like")}</span>
          </div>
        </motion.div>
        <motion.div
          style={{ opacity: nopeOpacity }}
          className="pointer-events-none absolute inset-0 flex items-center justify-start pl-8"
        >
          <div className="rounded-2xl border-4 border-rose-400 bg-rose-500/90 px-5 py-2.5 shadow-xl rotate-12">
            <span className="text-2xl font-black uppercase tracking-wider text-white">{t("nope")}</span>
          </div>
        </motion.div>

        <div className="flex flex-col gap-4">
          <span className="text-3xl" aria-hidden>
            {section.icon}
          </span>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">{title}</h2>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed sm:text-base">{text}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function AboutPage() {
  const t = useTranslations("about");
  const [sections, setSections] = useState<AboutSection[]>(() => [...aboutSections]);
  const [exitDir, setExitDir] = useState<"left" | "right" | null>(null);
  const current = sections[0];

  function handleSwipe(dir: "left" | "right") {
    if (!current) return;
    setExitDir(dir);
    setSections((prev) => prev.slice(1));
    setTimeout(() => setExitDir(null), 50);
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-matcher-pale via-matcher-mint/20 to-white" />

      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -left-32 top-32 h-64 w-64 rounded-full bg-matcher/5 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-96 h-80 w-80 rounded-full bg-matcher-teal/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-1/3 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-matcher-amber/5 blur-3xl" />

      <header className="border-b border-gray-100/80 bg-white/60 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="transition-opacity hover:opacity-90 shrink-0">
            <Logo height={56} />
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              href="/"
              className="shrink-0 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-matcher hover:bg-matcher-pale hover:text-matcher-dark"
            >
              {t("backToHome")}
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative mx-auto max-w-3xl px-4 py-12 text-center sm:px-6 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <span className="inline-block rounded-full bg-matcher/10 px-4 py-1.5 text-sm font-medium text-matcher-dark">
              {t("badge")}
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
              {t("title")}
            </h1>
            <p className="mt-4 text-base text-gray-600 sm:text-lg">
              {t("subtitle")}
            </p>
            <p className="mt-3 text-sm text-gray-500">{t("swipeHint")}</p>
          </motion.div>
        </section>

        {/* Card deck - one visible at a time */}
        <section className="mx-auto max-w-2xl px-4 pb-24 sm:px-6">
          <div className="relative mx-auto aspect-[4/3] max-h-[360px] sm:max-h-[420px]">
            {current ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.key}
                  initial={{ opacity: 1, scale: 1 }}
                  exit={{
                    opacity: 0,
                    x: exitDir === "right" ? 400 : exitDir === "left" ? -400 : 0,
                    rotate: exitDir === "right" ? 20 : exitDir === "left" ? -20 : 0,
                    transition: { duration: 0.3, ease: "easeIn" },
                  }}
                  className="absolute inset-0"
                >
                  <SwipeCard
                    section={current}
                    title={t(`sections.${current.key}.title`)}
                    text={t(`sections.${current.key}.text`)}
                    onSwipe={handleSwipe}
                    t={t}
                  />
                </motion.div>
              </AnimatePresence>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="flex h-full flex-col items-center justify-center rounded-2xl border-2 border-matcher/20 bg-gradient-to-br from-matcher-mint/50 to-matcher-pale/80 p-8 text-center sm:p-12"
              >
                <p className="text-lg italic text-gray-700 sm:text-xl">
                  {t("closingLine")}
                </p>
                <motion.div
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-8"
                >
                  <Link
                    href="/"
                    className="inline-block rounded-xl bg-matcher px-8 py-3.5 font-semibold text-white shadow-lg shadow-matcher/25 transition-shadow hover:bg-matcher-dark hover:shadow-matcher/30"
                  >
                    {t("getStarted")}
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </div>

          {/* Action buttons */}
          {current && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 flex justify-center gap-8 sm:mt-8"
            >
              <motion.button
                type="button"
                onClick={() => handleSwipe("left")}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-red-500 text-white shadow-lg shadow-rose-300/50 sm:h-16 sm:w-16"
              >
                <span className="text-2xl font-bold">✕</span>
              </motion.button>
              <motion.button
                type="button"
                onClick={() => handleSwipe("right")}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-matcher to-matcher-teal text-white shadow-lg shadow-matcher/40 sm:h-16 sm:w-16"
              >
                <span className="text-2xl">♥</span>
              </motion.button>
            </motion.div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
