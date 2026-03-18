"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

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
}: {
  member: TeamMember;
}) {
  const [flipped, setFlipped] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setFlipped((f) => !f)}
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
            <div className="h-full overflow-hidden rounded-3xl border border-white/20 bg-white/10 shadow-xl shadow-black/10 backdrop-blur-md">
              <div className="relative h-[68%] w-full overflow-hidden bg-white/5">
                {!imgLoaded && <div className="absolute inset-0 animate-pulse bg-white/10" aria-hidden />}
                <Image
                  src={member.photo}
                  alt={member.name}
                  fill
                  sizes="(min-width: 768px) 300px, 260px"
                  className={`object-cover transition-opacity duration-300 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
                  onLoadingComplete={() => setImgLoaded(true)}
                />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" aria-hidden />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <p className="text-lg font-bold leading-tight">{member.name}</p>
                  <p className="mt-0.5 text-sm font-semibold text-white/85">{member.role}</p>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm font-semibold text-white/90">Tap to flip</p>
                <p className="mt-1 text-sm text-white/75">
                  Skill tags + why we built Matcher.
                </p>
              </div>
            </div>
          </div>

          {/* BACK */}
          <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <div className="h-full overflow-hidden rounded-3xl border border-white/20 bg-white/10 shadow-xl shadow-black/10 backdrop-blur-md">
              <div className="flex h-full flex-col p-5 text-white">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                    <Sparkles className="h-5 w-5 text-matcher-bright" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-base font-bold">{member.name}</p>
                    <p className="truncate text-sm font-semibold text-white/75">{member.role}</p>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                    Skill tags
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {member.tags.slice(0, 12).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/85"
                      >
                        {tag.startsWith("#") ? tag : `#${tag}`}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                    Why I built Matcher
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-white/85">
                    {member.why}
                  </p>
                </div>

                <AnimatePresence initial={false}>
                  {flipped && (
                    <motion.p
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      className="mt-4 text-xs font-semibold text-white/70"
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
}: {
  members: TeamMember[];
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="flex items-end justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {title}
          </h2>
          {subtitle ? <p className="mt-2 text-gray-600">{subtitle}</p> : null}
        </div>
        <p className="hidden text-sm font-semibold text-gray-500 sm:block">
          Swipe or tap to flip
        </p>
      </div>

      <div className="mt-8 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch]">
        <div className="flex gap-4 pr-6">
          {members.map((m) => (
            <FlippingTeamCard key={m.id} member={m} />
          ))}
        </div>
      </div>
    </section>
  );
}

