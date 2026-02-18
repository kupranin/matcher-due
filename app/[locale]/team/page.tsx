"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion, useMotionValue, useTransform, animate, PanInfo, AnimatePresence } from "framer-motion";
import Logo from "@/components/Logo";
import Footer from "@/components/Footer";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const memberKeys = ["ketevan", "nino", "david"] as const;
type MemberKey = (typeof memberKeys)[number];

const MEMBER_PHOTOS: Record<MemberKey, string> = {
  nino: "/team/nino.png",
  ketevan: "/team/ketevan.png",
  david: "/team/david.png",
};

function TeamSwipeCard({
  name,
  role,
  expertise,
  reasonToBelieve,
  text,
  photo,
  onSwipe,
  t,
}: {
  name: string;
  role: string;
  expertise: string;
  reasonToBelieve: string;
  text: string;
  photo: string;
  onSwipe: (dir: "left" | "right") => void;
  t: (key: string) => string;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-10, 10]);
  const nextOpacity = useTransform(x, [0, 80, 160], [0, 0.5, 1]);
  const prevOpacity = useTransform(x, [-160, -80, 0], [1, 0.5, 0]);

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
      <div className="relative h-full w-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">
        {/* Swipe overlays */}
        <motion.div
          style={{ opacity: nextOpacity }}
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-end pr-8"
        >
          <div className="rounded-2xl border-4 border-matcher bg-matcher/90 px-5 py-2.5 shadow-xl -rotate-12">
            <span className="text-xl font-black uppercase tracking-wider text-white">{t("swipeNext")}</span>
          </div>
        </motion.div>
        <motion.div
          style={{ opacity: prevOpacity }}
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-start pl-8"
        >
          <div className="rounded-2xl border-4 border-gray-400 bg-gray-500/90 px-5 py-2.5 shadow-xl rotate-12">
            <span className="text-xl font-black uppercase tracking-wider text-white">{t("swipePrev")}</span>
          </div>
        </motion.div>

        {/* Photo — face in upper 65%, text confined to bottom 35% */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-100">
          <Image
            src={photo}
            alt=""
            fill
            className="object-cover object-[center_25%]"
            sizes="(max-width: 768px) 100vw, 400px"
            priority
          />
          {/* Gradient only over bottom third so face stays clear */}
          <div
            className="absolute inset-x-0 bottom-0 h-[35%] bg-gradient-to-t from-black/95 to-transparent"
            aria-hidden
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[35%] overflow-hidden p-4 sm:p-5">
            <h3 className="text-lg font-bold text-white drop-shadow-lg sm:text-xl">{name}</h3>
            <p className="mt-0.5 text-sm font-medium text-white/90">{role}</p>
            <p className="mt-2 text-xs font-medium uppercase tracking-wider text-matcher/90">
              {expertise}
            </p>
            <p className="mt-1.5 text-xs text-white/95 leading-snug line-clamp-2 sm:text-sm">
              {reasonToBelieve}
            </p>
          </div>
        </div>
        <div className="p-5">
          <p className="text-sm leading-relaxed text-gray-600">{text}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function TeamPage() {
  const t = useTranslations("team");
  const tCommon = useTranslations("common");
  const values = t.raw("values") as string[];
  const [members, setMembers] = useState<MemberKey[]>(() => [...memberKeys]);
  const [exitDir, setExitDir] = useState<"left" | "right" | null>(null);
  const current = members[0];

  function handleSwipe(dir: "left" | "right") {
    if (!current) return;
    setExitDir(dir);
    setMembers((prev): MemberKey[] => prev.slice(1));
    setTimeout(() => setExitDir(null), 50);
  }

  return (
    <div className="relative min-h-screen bg-white">
      {/* Soft background gradient */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-matcher-pale/40 via-white to-white" />

      <header className="border-b border-gray-100/80 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="shrink-0 transition-opacity hover:opacity-90">
            <Logo height={56} />
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              href="/"
              className="shrink-0 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-matcher hover:bg-matcher-pale hover:text-matcher-dark"
            >
              {tCommon("backToHome")}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-20 md:py-24">
        {/* Hero */}
        <section className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 text-xl text-gray-600 sm:text-2xl">
            {t("subtitle")}
          </p>
          <p className="mt-8 text-base leading-relaxed text-gray-600 sm:text-lg">
            {t("intro")}
          </p>
        </section>

        {/* Section 1: Why we started */}
        <section className="mt-20 sm:mt-24">
          <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">
            {t("whyHeading")}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-600 sm:text-lg">
            {t("whyText")}
          </p>
        </section>

        {/* Section 2: Globally local */}
        <section className="mt-20 sm:mt-24">
          <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">
            {t("globalHeading")}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-600 sm:text-lg">
            {t("globalText")}
          </p>
          <p className="mt-6 rounded-xl border-l-4 border-matcher bg-matcher-pale/60 px-5 py-4 text-sm font-medium italic text-gray-700 sm:text-base">
            {t("globalHighlight")}
          </p>
        </section>

        {/* Section 3: What we believe */}
        <section className="mt-20 sm:mt-24">
          <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">
            {t("beliefsHeading")}
          </h2>
          <ul className="mt-6 space-y-4">
            {Array.isArray(values) &&
              values.map((value, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-matcher" aria-hidden />
                  <span className="text-base leading-relaxed text-gray-600 sm:text-lg">{value}</span>
                </li>
              ))}
          </ul>
        </section>

        {/* Section 4: Founding Team – swipe deck */}
        <section className="mt-20 sm:mt-24">
          <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">
            {t("foundingHeading")}
          </h2>
          <p className="mt-2 text-sm text-gray-500">{t("swipeHint")}</p>
          <div className="relative mx-auto mt-8 aspect-[3/4] max-h-[420px] overflow-hidden rounded-2xl sm:max-h-[480px]">
            {current ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={current}
                  initial={{ opacity: 1, scale: 1 }}
                  exit={{
                    opacity: 0,
                    x: exitDir === "right" ? 400 : exitDir === "left" ? -400 : 0,
                    rotate: exitDir === "right" ? 15 : exitDir === "left" ? -15 : 0,
                    transition: { duration: 0.3, ease: "easeIn" },
                  }}
                  className="absolute inset-0"
                >
                  <TeamSwipeCard
                    name={t(`members.${current}.name`)}
                    role={t(`members.${current}.role`)}
                    expertise={t(`members.${current}.expertise`)}
                    reasonToBelieve={t(`members.${current}.reasonToBelieve`)}
                    text={t(`members.${current}.text`)}
                    photo={MEMBER_PHOTOS[current]}
                    onSwipe={handleSwipe}
                    t={t}
                  />
                </motion.div>
              </AnimatePresence>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="flex h-full flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-matcher via-matcher-teal/90 to-matcher-dark p-8 text-center shadow-xl sm:p-10"
              >
                <motion.span
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-5xl sm:text-6xl"
                  aria-hidden
                >
                  ✨
                </motion.span>
                <motion.h3
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="mt-4 text-2xl font-bold text-white sm:text-3xl"
                >
                  {t("lastCardHeadline")}
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="mt-3 max-w-sm text-base text-white/90 sm:text-lg"
                >
                  {t("lastCardSubtext")}
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="mt-4 text-lg font-semibold tracking-tight text-white/95 sm:text-xl"
                >
                  {t("lastCardLine")}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 }}
                  className="mt-8"
                >
                  <Link
                    href="/"
                    className="inline-block rounded-xl bg-white px-8 py-3.5 font-semibold text-matcher-dark shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-100"
                  >
                    {t("lastCardCta")}
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </div>
          {current && (
            <div className="mt-6 flex justify-center">
              <motion.button
                type="button"
                onClick={() => handleSwipe("right")}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-matcher text-white shadow-lg shadow-matcher/30 hover:bg-matcher-dark sm:h-16 sm:w-16"
              >
                <span className="text-xl">→</span>
              </motion.button>
            </div>
          )}
        </section>

        {/* Closing section */}
        <section className="mt-20 sm:mt-24">
          <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">
            {t("closingHeading")}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-600 sm:text-lg">
            {t("closingText")}
          </p>
          <p className="mt-10 text-center text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl md:text-3xl">
            {t("closingLine")}
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
