"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform, animate } from "framer-motion";
import { Briefcase, User, Sparkles, X as XIcon, Heart } from "lucide-react";
import { Link } from "@/i18n/navigation";

type Audience = "candidate" | "employer";

export type DemoJobCard = {
  id: string;
  title: string;
  company: string;
  salary: string;
  location: string;
  workType: string;
  tech: string[];
  description: string;
  photo: string;
};

export type InteractiveHeroLabels = {
  segmentedCandidate: string;
  segmentedEmployer: string;
  howItWorks: string;
  like: string;
  nope: string;
  swipeInstruction: string;
  tapToExpand: string;
  hideDetails: string;
  jobDescription: string;
  techStack: string;
  itsAMatchEyebrow: string;
  itsAMatchTitle: string;
  signUp: string;
  keepSwiping: string;
  noMoreDemoCardsTitle: string;
  noMoreDemoCardsSubtitle: string;
  getStarted: string;
};

function SegmentedAudienceControl({
  value,
  onChange,
  labels,
  theme,
}: {
  value: Audience;
  onChange: (v: Audience) => void;
  labels: Pick<InteractiveHeroLabels, "segmentedCandidate" | "segmentedEmployer">;
  theme: "light" | "dark";
}) {
  const isDark = theme === "dark";
  return (
    <div
      className={
        isDark
          ? "inline-flex items-center rounded-full border border-white/20 bg-white/10 p-1 backdrop-blur-md"
          : "inline-flex items-center rounded-full border border-gray-200 bg-white p-1 shadow-sm"
      }
    >
      <button
        type="button"
        onClick={() => onChange("candidate")}
        className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition ${
          value === "candidate"
            ? isDark
              ? "bg-white text-gray-900 shadow-sm"
              : "bg-matcher-pale text-matcher-dark"
            : isDark
              ? "text-white/85 hover:text-white"
              : "text-gray-600 hover:text-gray-900"
        }`}
        aria-pressed={value === "candidate"}
      >
        <User className="h-4 w-4" />
        {labels.segmentedCandidate}
      </button>
      <button
        type="button"
        onClick={() => onChange("employer")}
        className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition ${
          value === "employer"
            ? isDark
              ? "bg-white text-gray-900 shadow-sm"
              : "bg-matcher-pale text-matcher-dark"
            : isDark
              ? "text-white/85 hover:text-white"
              : "text-gray-600 hover:text-gray-900"
        }`}
        aria-pressed={value === "employer"}
      >
        <Briefcase className="h-4 w-4" />
        {labels.segmentedEmployer}
      </button>
    </div>
  );
}

function DemoSwipeCard({
  card,
  onSwipe,
  zIndex,
  labels,
  theme,
}: {
  card: DemoJobCard;
  onSwipe: (dir: "left" | "right") => void;
  zIndex: number;
  labels: Pick<
    InteractiveHeroLabels,
    | "like"
    | "nope"
    | "swipeInstruction"
    | "tapToExpand"
    | "hideDetails"
    | "jobDescription"
    | "techStack"
  >;
  theme: "light" | "dark";
}) {
  const isDark = theme === "dark";
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], [-14, 14]);
  const likeOpacity = useTransform(x, [0, 60, 110], [0, 0.4, 1]);
  const nopeOpacity = useTransform(x, [-110, -60, 0], [1, 0.4, 0]);
  const bgLeftOpacity = useTransform(x, [0, -120], [0, 0.25]);
  const bgRightOpacity = useTransform(x, [120, 0], [0.25, 0]);

  const [expanded, setExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);

  function handleDragEnd(_: unknown, info: PanInfo) {
    const threshold = 90;
    if (info.offset.x > threshold) onSwipe("right");
    else if (info.offset.x < -threshold) onSwipe("left");
    else animate(x, 0, { type: "spring", stiffness: 280, damping: 28 });
  }

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: -200, right: 200 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      style={{ x, rotate, zIndex }}
      className="absolute inset-0 touch-none cursor-grab active:cursor-grabbing"
      role="article"
      aria-label={`${card.title} at ${card.company}`}
    >
      {/* drag background hint */}
      <div className="absolute -inset-3 flex overflow-hidden rounded-[1.5rem]">
        <motion.div style={{ opacity: bgLeftOpacity }} className="flex-1 bg-rose-500/35" aria-hidden />
        <motion.div style={{ opacity: bgRightOpacity }} className="flex-1 bg-emerald-500/35" aria-hidden />
      </div>

      <div
        className={
          isDark
            ? "relative flex h-full w-full flex-col overflow-hidden rounded-3xl border border-white/20 bg-white/10 shadow-2xl shadow-black/15 backdrop-blur-md"
            : "relative flex h-full w-full flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-lg"
        }
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          {/* Always-visible placeholder (never blocks the image). */}
          <div
            className={`absolute inset-0 ${
              isDark
                ? "bg-gradient-to-br from-white/10 via-white/5 to-white/10"
                : "bg-gradient-to-br from-matcher-pale via-white to-matcher-mint/40"
            }`}
            aria-hidden
          />
          <div className={`absolute inset-0 animate-pulse ${isDark ? "bg-white/5" : "bg-white/40"}`} aria-hidden />
          {!imgError && (
            <Image
              src={card.photo}
              alt=""
              fill
              className="object-cover"
              sizes="(min-width: 768px) 420px, 90vw"
              unoptimized
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              priority={zIndex > 1}
            />
          )}
          <div className="absolute right-3 top-3 rounded-full bg-matcher-bright px-3 py-1.5 text-sm font-bold text-charcoal shadow-lg">
            {card.salary}
          </div>

          {/* LIKE / NOPE stamps */}
          <motion.div style={{ opacity: likeOpacity }} className="pointer-events-none absolute inset-0 flex items-center justify-end pr-8">
            <div className="rounded-2xl border-4 border-matcher bg-matcher/90 px-6 py-3 shadow-xl -rotate-12">
              <span className="text-3xl font-black uppercase tracking-wider text-white">{labels.like}</span>
            </div>
          </motion.div>
          <motion.div style={{ opacity: nopeOpacity }} className="pointer-events-none absolute inset-0 flex items-center justify-start pl-8">
            <div className="rounded-2xl border-4 border-rose-400 bg-rose-500/90 px-6 py-3 shadow-xl rotate-12">
              <span className="text-3xl font-black uppercase tracking-wider text-white">{labels.nope}</span>
            </div>
          </motion.div>
        </div>

        <div className={`flex flex-1 flex-col justify-between p-5 ${isDark ? "text-white" : "text-gray-900"}`}>
          <div>
            <h3 className="text-xl font-bold tracking-tight">{card.title}</h3>
            <p className={`mt-0.5 ${isDark ? "text-white/85" : "text-gray-600"}`}>{card.company}</p>

            {/* quick view */}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className={`rounded-full px-3 py-1 font-semibold ${isDark ? "bg-white/15" : "bg-gray-100 text-gray-700"}`}>
                {card.location}
              </span>
              <span className={`rounded-full px-3 py-1 font-semibold ${isDark ? "bg-white/15" : "bg-gray-100 text-gray-700"}`}>
                {card.workType}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              className={
                isDark
                  ? "mt-4 inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-white/90 hover:bg-white/15"
                  : "mt-4 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
              }
              aria-expanded={expanded}
            >
              {expanded ? labels.hideDetails : labels.tapToExpand}
              <span aria-hidden className={isDark ? "text-white/70" : "text-gray-500"}>
                {expanded ? "▴" : "▾"}
              </span>
            </button>

            <AnimatePresence initial={false}>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className={`mt-3 space-y-3 rounded-2xl p-4 ${isDark ? "bg-white/10" : "bg-gray-50 border border-gray-200"}`}>
                    <div>
                      <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? "text-white/70" : "text-gray-600"}`}>{labels.jobDescription}</p>
                      <p className={`mt-1 text-sm ${isDark ? "text-white/90" : "text-gray-700"}`}>{card.description}</p>
                    </div>
                    <div>
                      <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? "text-white/70" : "text-gray-600"}`}>{labels.techStack}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {card.tech.map((t) => (
                          <span
                            key={t}
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              isDark ? "bg-white/15 text-white/90" : "bg-white border border-gray-200 text-gray-700"
                            }`}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <p className={`mt-4 text-sm font-medium ${isDark ? "text-white/80" : "text-gray-600"}`}>{labels.swipeInstruction}</p>
        </div>
      </div>
    </motion.div>
  );
}

function MatchOverlay({
  open,
  onClose,
  ctaHref,
  labels,
}: {
  open: boolean;
  onClose: () => void;
  ctaHref: string;
  labels: Pick<
    InteractiveHeroLabels,
    "itsAMatchEyebrow" | "itsAMatchTitle" | "signUp" | "keepSwiping"
  >;
}) {
  const confetti = useMemo(() => {
    return Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      left: `${Math.round(Math.random() * 100)}%`,
      delay: Math.random() * 0.2,
      duration: 0.8 + Math.random() * 0.6,
      rotate: -20 + Math.random() * 40,
      bg: i % 3 === 0 ? "bg-matcher" : i % 3 === 1 ? "bg-matcher-bright" : "bg-rose-500",
    }));
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ scale: 0.96, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.98, y: 6, opacity: 0 }}
            transition={{ type: "spring", stiffness: 340, damping: 26 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-6 text-white shadow-2xl shadow-black/20 backdrop-blur-md"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 rounded-full bg-white/10 p-2 text-white/90 hover:bg-white/15"
              aria-label="Close"
            >
              <XIcon className="h-5 w-5" />
            </button>

            {/* confetti */}
            <div className="pointer-events-none absolute inset-0" aria-hidden>
              {confetti.map((c) => (
                <motion.span
                  key={c.id}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 220, opacity: [0, 1, 1, 0] }}
                  transition={{ delay: c.delay, duration: c.duration, ease: "easeOut" }}
                  className={`absolute top-0 h-2.5 w-2.5 rounded-sm ${c.bg}`}
                  style={{ left: c.left, rotate: c.rotate }}
                />
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                <Sparkles className="h-6 w-6 text-matcher-bright" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white/80">{labels.itsAMatchEyebrow}</p>
                <h4 className="text-xl font-bold tracking-tight">{labels.itsAMatchTitle}</h4>
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <Link
                href={ctaHref}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-matcher px-5 py-3 text-sm font-semibold text-white hover:bg-matcher-dark"
              >
                <Heart className="h-4 w-4" />
                {labels.signUp}
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white/90 hover:bg-white/15"
              >
                {labels.keepSwiping}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function InteractiveHero({
  candidateCopy,
  employerCopy,
  candidateHowItWorks,
  employerHowItWorks,
  labels,
  demoCards,
  swapWords = [],
  swapIntervalMs = 1700,
  theme = "dark",
}: {
  candidateCopy: { eyebrow: string; title: string; subtitle: string; ctaPrimary: string; ctaSecondary: string };
  employerCopy: { eyebrow: string; title: string; subtitle: string; ctaPrimary: string; ctaSecondary: string };
  candidateHowItWorks: Array<{ title: string; text: string }>;
  employerHowItWorks: Array<{ title: string; text: string }>;
  labels: InteractiveHeroLabels;
  demoCards: DemoJobCard[];
  swapWords?: string[];
  swapIntervalMs?: number;
  theme?: "light" | "dark";
}) {
  const isDark = theme === "dark";
  const [audience, setAudience] = useState<Audience>("candidate");
  const [deck, setDeck] = useState<DemoJobCard[]>(() => demoCards);
  const [exitDir, setExitDir] = useState<"left" | "right" | null>(null);
  const [matchOpen, setMatchOpen] = useState(false);
  const [swapIdx, setSwapIdx] = useState(0);

  const copy = audience === "candidate" ? candidateCopy : employerCopy;
  const steps = audience === "candidate" ? candidateHowItWorks : employerHowItWorks;
  const ctaHref = audience === "candidate" ? "/userFlow/1" : "/employer/register";

  const current = deck[0] ?? null;

  function swipe(dir: "left" | "right") {
    if (!current) return;
    setExitDir(dir);
    setDeck((prev) => prev.slice(1));
    if (dir === "right") setMatchOpen(true);
    setTimeout(() => setExitDir(null), 80);
  }

  const titleHasSwap = copy.title.includes("{swap}") && swapWords.length > 0;
  const activeSwapWord = swapWords.length > 0 ? swapWords[swapIdx % swapWords.length] : "";
  const [titleBefore, titleAfter] = titleHasSwap ? copy.title.split("{swap}") : [copy.title, ""];
  const swapMinWidthCh = useMemo(() => Math.max(0, ...swapWords.map((w) => (typeof w === "string" ? w.length : 0))), [swapWords]);

  useEffect(() => {
    if (!titleHasSwap) return;
    const id = window.setInterval(() => {
      setSwapIdx((i) => (swapWords.length > 0 ? (i + 1) % swapWords.length : 0));
    }, Math.max(800, swapIntervalMs));
    return () => window.clearInterval(id);
  }, [swapIntervalMs, swapWords.length, titleHasSwap]);

  return (
    <section className="relative mx-auto grid max-w-6xl grid-cols-1 items-start gap-10 px-4 py-8 sm:px-6 sm:py-12 md:grid-cols-2 md:gap-14 md:items-center">
      <div className="md:pr-4">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <div className="inline-flex items-center gap-3">
            <span
              className={
                isDark
                  ? "rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white/90 backdrop-blur-md"
                  : "rounded-full bg-matcher-pale px-4 py-1.5 text-sm font-semibold text-matcher-dark"
              }
            >
              {copy.eyebrow}
            </span>
            <SegmentedAudienceControl
              value={audience}
              onChange={setAudience}
              labels={{
                segmentedCandidate: labels.segmentedCandidate,
                segmentedEmployer: labels.segmentedEmployer,
              }}
              theme={theme}
            />
          </div>
          <h1
            className={
              isDark
                ? "font-heading mt-5 text-balance text-4xl font-extrabold tracking-tight leading-tight text-white sm:text-5xl"
                : "font-heading mt-5 text-balance text-4xl font-extrabold tracking-tight leading-tight text-gray-900 sm:text-5xl"
            }
          >
            {titleHasSwap ? (
              <>
                {titleBefore}
                <span className="relative inline-block align-baseline" style={{ minWidth: swapMinWidthCh ? `${swapMinWidthCh}ch` : undefined }}>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={activeSwapWord}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -10, opacity: 0 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className={
                        isDark
                          ? "mx-1 inline-flex rounded-xl bg-matcher-bright px-2.5 py-1 font-extrabold text-charcoal shadow-sm"
                          : "mx-1 inline-flex rounded-xl bg-matcher px-2.5 py-1 font-extrabold text-white shadow-sm"
                      }
                    >
                      {activeSwapWord}
                    </motion.span>
                  </AnimatePresence>
                </span>
                {titleAfter}
              </>
            ) : (
              copy.title
            )}
          </h1>
          <p className={isDark ? "mt-4 max-w-xl text-balance text-base leading-relaxed text-white/80 sm:text-lg" : "mt-4 max-w-xl text-balance text-base leading-relaxed text-gray-600 sm:text-lg"}>
            {copy.subtitle}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href={ctaHref}
              className="inline-flex items-center justify-center rounded-xl bg-matcher px-6 py-3 font-semibold text-white hover:bg-matcher-dark"
            >
              {copy.ctaPrimary}
            </Link>
            <Link
              href={audience === "candidate" ? "/employer" : "/userFlow/1"}
              className={
                isDark
                  ? "inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-6 py-3 font-semibold text-white/90 backdrop-blur-md hover:bg-white/15"
                  : "inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-800 hover:bg-gray-50"
              }
            >
              {copy.ctaSecondary}
            </Link>
          </div>
        </motion.div>

        {/* How it works */}
        <div className="mt-10">
          <p className={isDark ? "text-xs font-semibold uppercase tracking-[0.2em] text-white/70" : "text-xs font-semibold uppercase tracking-[0.2em] text-gray-500"}>
            {labels.howItWorks}
          </p>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {steps.slice(0, 3).map((s) => (
              <div
                key={s.title}
                className={
                  isDark
                    ? "rounded-2xl border border-white/20 bg-white/10 p-4 text-white/90 backdrop-blur-md"
                    : "rounded-2xl border border-gray-200 bg-white p-4 text-gray-900 shadow-sm"
                }
              >
                <p className="text-sm font-semibold">{s.title}</p>
                <p className={isDark ? "mt-1 text-sm text-white/75" : "mt-1 text-sm text-gray-600"}>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live swipe demo */}
      <div className="relative flex justify-center md:justify-end md:self-center">
        <div
          className={`absolute -inset-8 -z-10 rounded-[3rem] blur-2xl ${
            isDark
              ? "bg-[radial-gradient(circle_at_top,rgba(139,195,74,0.22),transparent_55%),radial-gradient(circle_at_bottom,rgba(0,173,181,0.18),transparent_55%)]"
              : "bg-[radial-gradient(circle_at_top,rgba(139,195,74,0.22),transparent_60%),radial-gradient(circle_at_bottom,rgba(0,173,181,0.14),transparent_60%)]"
          }`}
        />

        {/* Phone frame */}
        <div
          className={`relative mx-auto w-full max-w-[420px] overflow-hidden rounded-[2.5rem] border p-3 shadow-2xl ${
            isDark ? "border-white/15 bg-[#0b101a]" : "border-gray-200 bg-white"
          }`}
        >
          {/* Notch */}
          <div className={`pointer-events-none absolute left-1/2 top-3 h-6 w-28 -translate-x-1/2 rounded-full ${isDark ? "bg-black/35" : "bg-gray-100"}`} />

          <div className="relative mx-auto aspect-[3/4] max-h-[560px] w-full">
            {/* Back cards for depth */}
            <div className={`absolute inset-0 -z-10 rounded-3xl ${isDark ? "bg-white/5" : "bg-gray-50"}`} />
            <div
              className={`absolute inset-0 -z-10 rounded-3xl border ${
                isDark ? "border-white/10" : "border-gray-200"
              }`}
              style={{ transform: "translateY(10px) scale(0.985)" }}
              aria-hidden
            />
            <div
              className={`absolute inset-0 -z-10 rounded-3xl border ${
                isDark ? "border-white/10" : "border-gray-200"
              }`}
              style={{ transform: "translateY(18px) scale(0.97)" }}
              aria-hidden
            />

            <AnimatePresence mode="wait">
              {current ? (
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, y: 18, scale: 0.985 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{
                    opacity: 0,
                    x: exitDir === "right" ? 420 : exitDir === "left" ? -420 : 0,
                    rotate: exitDir === "right" ? 18 : exitDir === "left" ? -18 : 0,
                    transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
                  }}
                  className="absolute inset-0 z-10"
                >
                  <DemoSwipeCard
                    card={current}
                    onSwipe={swipe}
                    zIndex={3}
                    labels={{
                      like: labels.like,
                      nope: labels.nope,
                      swipeInstruction: labels.swipeInstruction,
                      tapToExpand: labels.tapToExpand,
                      hideDetails: labels.hideDetails,
                      jobDescription: labels.jobDescription,
                      techStack: labels.techStack,
                    }}
                    theme={theme}
                  />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={
                    isDark
                      ? "flex h-full flex-col items-center justify-center rounded-3xl border border-white/20 bg-white/10 p-8 text-center text-white backdrop-blur-md"
                      : "flex h-full flex-col items-center justify-center rounded-3xl border border-gray-200 bg-white p-8 text-center text-gray-900 shadow-sm"
                  }
                >
                  <p className="text-3xl font-extrabold sm:text-4xl">{labels.noMoreDemoCardsTitle}</p>
                  <p className={isDark ? "mt-3 text-white/80" : "mt-3 text-gray-600"}>{labels.noMoreDemoCardsSubtitle}</p>
                  <Link href={ctaHref} className="mt-6 rounded-xl bg-matcher px-6 py-3 font-semibold text-white hover:bg-matcher-dark">
                    {labels.getStarted}
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>

        {/* Swipe buttons (under the phone/card) */}
        <div className="mt-6 flex justify-center">
          <div
            className={`inline-flex items-center gap-4 rounded-full border px-4 py-3 shadow-lg ${
              isDark ? "border-white/15 bg-white/10 backdrop-blur-md" : "border-gray-200 bg-white"
            }`}
          >
            <button
              type="button"
              onClick={() => swipe("left")}
              disabled={!current}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-red-500 text-white shadow-md disabled:opacity-50"
              aria-label="Pass"
            >
              <XIcon className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={() => swipe("right")}
              disabled={!current}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-matcher to-matcher-teal text-white shadow-md disabled:opacity-50"
              aria-label="Like"
            >
              <Heart className="h-6 w-6" />
            </button>
          </div>
        </div>

        <MatchOverlay
          open={matchOpen}
          onClose={() => setMatchOpen(false)}
          ctaHref={ctaHref}
          labels={{
            itsAMatchEyebrow: labels.itsAMatchEyebrow,
            itsAMatchTitle: labels.itsAMatchTitle,
            signUp: labels.signUp,
            keepSwiping: labels.keepSwiping,
          }}
        />
      </div>
    </section>
  );
}

