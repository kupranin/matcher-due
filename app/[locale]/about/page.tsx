"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion, useMotionValue, useTransform, animate, PanInfo, AnimatePresence } from "framer-motion";
import Logo from "@/components/Logo";
import Footer from "@/components/Footer";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { useTheme } from "@/components/theme/ThemeProvider";
import { aboutSections } from "@/config/aboutSections";

type AboutSection = (typeof aboutSections)[number];

function SwipeCard({
  section,
  title,
  text,
  onSwipe,
  t,
  isDark,
}: {
  section: AboutSection;
  title: string;
  text: string;
  onSwipe: (dir: "left" | "right") => void;
  t: (key: string) => string;
  isDark: boolean;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-12, 12]);
  const likeOpacity = useTransform(x, [0, 80, 160], [0, 0.5, 1]);
  const nopeOpacity = useTransform(x, [-160, -80, 0], [1, 0.5, 0]);
  const bgLeftOpacity = useTransform(x, [0, -120], [0, 0.25]);
  const bgRightOpacity = useTransform(x, [120, 0], [0.25, 0]);

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
      className="absolute inset-0 touch-none cursor-grab active:cursor-grabbing"
    >
      {/* drag background hint */}
      <div className="absolute -inset-3 flex overflow-hidden rounded-[1.75rem]">
        <motion.div style={{ opacity: bgLeftOpacity }} className="flex-1 bg-rose-500/35" aria-hidden />
        <motion.div style={{ opacity: bgRightOpacity }} className="flex-1 bg-emerald-500/35" aria-hidden />
      </div>

      <div
        className={
          isDark
            ? "relative h-full w-full overflow-hidden rounded-3xl border border-white/20 bg-white/10 shadow-2xl shadow-black/20 backdrop-blur-md"
            : "relative h-full w-full overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl"
        }
      >
        {/* Top “photo” area (premium, like real card) */}
        <div className={isDark ? "relative h-[56%] w-full overflow-hidden bg-white/5" : "relative h-[56%] w-full overflow-hidden bg-gray-100"}>
          <div
            className={
              isDark
                ? "absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,195,74,0.18),transparent_55%),radial-gradient(circle_at_bottom,rgba(0,173,181,0.14),transparent_55%)]"
                : "absolute inset-0 bg-gradient-to-br from-matcher-pale via-white to-matcher-mint/40"
            }
            aria-hidden
          />
          <div className="absolute inset-0 opacity-70 [filter:url(#noise)]" aria-hidden />

          <div className="absolute left-4 top-4 flex items-center gap-2">
            <span className={isDark ? "rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/85" : "rounded-full bg-matcher-pale px-3 py-1 text-xs font-bold text-matcher-dark"}>
              {t("badge")}
            </span>
          </div>

          <div className="absolute right-4 top-4 opacity-90">
            <Logo href="" height={36} />
          </div>

          <div className="absolute bottom-4 left-4">
            <div className={isDark ? "inline-flex items-center gap-2 rounded-2xl bg-black/35 px-3 py-2 text-white" : "inline-flex items-center gap-2 rounded-2xl bg-white/80 px-3 py-2 text-gray-900 shadow-sm"}>
              <span className="text-lg" aria-hidden>
                {section.icon}
              </span>
              <span className="text-sm font-semibold">{title}</span>
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/55 to-transparent" aria-hidden />
        </div>

        {/* Content area */}
        <div className={isDark ? "flex h-[44%] flex-col justify-between p-5 text-white" : "flex h-[44%] flex-col justify-between p-5 text-gray-900"}>
          <div>
            <p className={isDark ? "text-xs font-semibold uppercase tracking-[0.2em] text-white/60" : "text-xs font-semibold uppercase tracking-[0.2em] text-gray-500"}>
              {t("swipeHint")}
            </p>
            <p className={isDark ? "mt-2 text-sm leading-relaxed text-white/80" : "mt-2 text-sm leading-relaxed text-gray-700"}>
              {text}
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className={isDark ? "rounded-full bg-white/10 px-3 py-1 font-semibold text-white/85" : "rounded-full bg-gray-100 px-3 py-1 font-semibold text-gray-700"}>
              {t("like")} / {t("nope")}
            </span>
            <span className={isDark ? "rounded-full bg-white/10 px-3 py-1 font-semibold text-white/85" : "rounded-full bg-gray-100 px-3 py-1 font-semibold text-gray-700"}>
              matcher.ge
            </span>
          </div>
        </div>

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
      </div>
    </motion.div>
  );
}

const initialSections: AboutSection[] = Array.from(aboutSections);

export default function AboutPage() {
  const t = useTranslations("about");
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [sections, setSections] = useState<AboutSection[]>(initialSections);
  const [exitDir, setExitDir] = useState<"left" | "right" | null>(null);
  const current = sections[0];

  function handleSwipe(dir: "left" | "right") {
    if (!current) return;
    setExitDir(dir);
    setSections((prev): AboutSection[] => prev.slice(1));
    setTimeout(() => setExitDir(null), 50);
  }

  return (
    <div className={isDark ? "relative min-h-screen overflow-hidden bg-[#070B12] text-white" : "relative min-h-screen overflow-hidden bg-white text-gray-900"}>
      {/* Background gradient */}
      <div
        className={
          isDark
            ? "pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(139,195,74,0.18),transparent_55%),radial-gradient(ellipse_at_bottom,rgba(0,173,181,0.14),transparent_55%)]"
            : "pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-matcher-pale via-matcher-mint/20 to-white"
        }
      />

      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -left-32 top-32 h-64 w-64 rounded-full bg-matcher/5 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-96 h-80 w-80 rounded-full bg-matcher-teal/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-1/3 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-matcher-amber/5 blur-3xl" />

      <header className={isDark ? "border-b border-white/10 bg-black/30 backdrop-blur-sm" : "border-b border-gray-100/80 bg-white/60 backdrop-blur-sm"}>
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="transition-opacity hover:opacity-90 shrink-0">
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
            <span
              className={
                isDark
                  ? "inline-block rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/85"
                  : "inline-block rounded-full bg-matcher/10 px-4 py-1.5 text-sm font-medium text-matcher-dark"
              }
            >
              {t("badge")}
            </span>
            <h1 className={isDark ? "mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl" : "mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl"}>
              {t("title")}
            </h1>
            <p className={isDark ? "mt-4 text-base text-white/70 sm:text-lg" : "mt-4 text-base text-gray-600 sm:text-lg"}>
              {t("subtitle")}
            </p>
            <p className={isDark ? "mt-3 text-sm text-white/60" : "mt-3 text-sm text-gray-500"}>{t("swipeHint")}</p>
          </motion.div>
        </section>

        {/* Card deck - one visible at a time */}
        <section className="mx-auto max-w-2xl px-4 pb-24 sm:px-6">
          <div className="relative mx-auto aspect-[3/4] max-h-[520px]">
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
                    isDark={isDark}
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

        {/* Team carousel moved to /team */}
      </main>

      <Footer />
    </div>
  );
}
