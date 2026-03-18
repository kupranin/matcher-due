"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  photo: string;
  tags: string[];
  why: string;
};

export function FlippingTeamCard({
  member,
  theme = "light",
  onFlipChange,
}: {
  member: TeamMember;
  theme?: "light" | "dark";
  onFlipChange?: (flipped: boolean) => void;
}) {
  const isDark = theme === "dark";
  const [flipped, setFlipped] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <button
      type="button"
      onClick={() =>
        setFlipped((f) => {
          const next = !f;
          onFlipChange?.(next);
          return next;
        })
      }
      className="group relative w-[260px] shrink-0 text-left sm:w-[300px]"
      aria-pressed={flipped}
      aria-label={`Team member: ${member.name}. Tap to flip.`}
    >
      <div
        className="[perspective:1000px]"
      >
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          className="relative h-[380px] w-full [transform-style:preserve-3d]"
        >
          {/* FRONT */}
          <div className="absolute inset-0 [backface-visibility:hidden]">
            <div
              className={
                isDark
                  ? "h-full overflow-hidden rounded-3xl border border-white/20 bg-white/10 shadow-xl shadow-black/10 backdrop-blur-md"
                  : "h-full overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-lg"
              }
            >
              <div className={isDark ? "relative h-[68%] w-full overflow-hidden bg-white/5" : "relative h-[68%] w-full overflow-hidden bg-gray-100"}>
                {/* Always-visible placeholder so we never show a blank rectangle */}
                <div
                  className={
                    isDark
                      ? "absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-white/10"
                      : "absolute inset-0 bg-gradient-to-br from-matcher-pale via-white to-matcher-mint/40"
                  }
                  aria-hidden
                />
                <div className={isDark ? "absolute inset-0 bg-white/5" : "absolute inset-0 bg-white/40"} aria-hidden />
                {!imgError && (
                  <Image
                    src={member.photo}
                    alt={member.name}
                    fill
                    sizes="(min-width: 768px) 300px, 260px"
                    className="object-cover"
                    onError={() => setImgError(true)}
                  />
                )}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" aria-hidden />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <p className="text-lg font-bold leading-tight">{member.name}</p>
                  <p className="mt-0.5 text-sm font-semibold text-white/85">{member.role}</p>
                </div>
              </div>
              <div className="p-4">
                <p className={isDark ? "text-sm font-semibold text-white/90" : "text-sm font-semibold text-gray-900"}>Tap to flip</p>
                <p className={isDark ? "mt-1 text-sm text-white/75" : "mt-1 text-sm text-gray-600"}>
                  Skills + why we built Matcher.
                </p>
              </div>
            </div>
          </div>

          {/* BACK */}
          <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <div
              className={
                isDark
                  ? "h-full overflow-hidden rounded-3xl border border-white/20 bg-white/10 shadow-xl shadow-black/10 backdrop-blur-md"
                  : "h-full overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-lg"
              }
            >
              <div className={isDark ? "flex h-full flex-col p-5 text-white" : "flex h-full flex-col p-5 text-gray-900"}>
                <div className="flex items-center gap-3">
                  <div className={isDark ? "flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10" : "flex h-10 w-10 items-center justify-center rounded-2xl bg-matcher-pale"}>
                    <Sparkles className={isDark ? "h-5 w-5 text-matcher-bright" : "h-5 w-5 text-matcher"} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-base font-bold">{member.name}</p>
                    <p className={isDark ? "truncate text-sm font-semibold text-white/75" : "truncate text-sm font-semibold text-gray-600"}>{member.role}</p>
                  </div>
                </div>

                <div className="mt-5">
                  <p className={isDark ? "text-xs font-semibold uppercase tracking-[0.18em] text-white/70" : "text-xs font-semibold uppercase tracking-[0.18em] text-gray-500"}>
                    Skill tags
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {member.tags.slice(0, 12).map((tag) => (
                      <span
                        key={tag}
                        className={
                          isDark
                            ? "rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/85"
                            : "rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700"
                        }
                      >
                        {tag.startsWith("#") ? tag : `#${tag}`}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex-1">
                  <p className={isDark ? "text-xs font-semibold uppercase tracking-[0.18em] text-white/70" : "text-xs font-semibold uppercase tracking-[0.18em] text-gray-500"}>
                    Why I built Matcher
                  </p>
                  <p className={isDark ? "mt-2 text-sm leading-relaxed text-white/85" : "mt-2 text-sm leading-relaxed text-gray-700"}>
                    {member.why}
                  </p>
                </div>

                <AnimatePresence initial={false}>
                  {flipped && (
                    <motion.p
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      className={isDark ? "mt-4 text-xs font-semibold text-white/70" : "mt-4 text-xs font-semibold text-gray-500"}
                    >
                      Tap to flip back
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </button>
  );
}

export function SwipeTeamCarousel({
  members,
  title,
  subtitle,
  theme = "light",
}: {
  members: TeamMember[];
  title: string;
  subtitle?: string;
  theme?: "light" | "dark";
}) {
  const isDark = theme === "dark";
  const scrollId = useId();
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  function scrollByCards(dir: "left" | "right") {
    const el = scrollerRef.current;
    if (!el) return;
    const cardWidth = 320; // close to card width; good enough for UX
    const delta = dir === "left" ? -cardWidth : cardWidth;
    el.scrollBy({ left: delta, behavior: "smooth" });
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="flex items-end justify-between gap-6">
        <div>
          <h2 className={isDark ? "text-2xl font-bold tracking-tight text-white sm:text-3xl" : "text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl"}>
            {title}
          </h2>
          {subtitle ? <p className={isDark ? "mt-2 text-white/70" : "mt-2 text-gray-600"}>{subtitle}</p> : null}
        </div>
        <p className={isDark ? "hidden text-sm font-semibold text-white/60 sm:block" : "hidden text-sm font-semibold text-gray-500 sm:block"}>
          Swipe or tap to flip
        </p>
      </div>

      <div
        ref={scrollerRef}
        id={scrollId}
        className="mt-8 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch]"
        aria-label="Team cards carousel"
      >
        <div className="flex gap-4 pr-6">
          {members.map((m) => (
            <FlippingTeamCard
              key={m.id}
              member={m}
              theme={theme}
            />
          ))}
        </div>
      </div>

      {/* Scroll affordance under cards */}
      <div className="mt-5 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => scrollByCards("left")}
          className={
            isDark
              ? "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/85 hover:bg-white/10"
              : "inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-800 hover:bg-gray-50"
          }
          aria-controls={scrollId}
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <p className={isDark ? "text-sm font-semibold text-white/60" : "text-sm font-semibold text-gray-500"}>
          Scroll
        </p>
        <button
          type="button"
          onClick={() => scrollByCards("right")}
          className={
            isDark
              ? "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/85 hover:bg-white/10"
              : "inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-800 hover:bg-gray-50"
          }
          aria-controls={scrollId}
          aria-label="Scroll right"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}

