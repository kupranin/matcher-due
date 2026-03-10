"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { MutualMatch } from "@/lib/matchStorage";

const AVATAR_PLACEHOLDER = "/images/avatar-placeholder.svg";
const BURST_COUNT = 16;

function formatMatchSubtext(match: MutualMatch, isCandidateView: boolean): string {
  if (isCandidateView) {
    return `You and ${match.company} both liked each other.`;
  }
  return `You and ${match.candidateName} both liked each other.`;
}

export default function MatchCongratulationsModal({
  match,
  onClose,
  onOpenChat,
  isCandidateView = true,
}: {
  match: MutualMatch | null;
  onClose: () => void;
  onOpenChat: () => void;
  isCandidateView?: boolean;
}) {
  return (
    <AnimatePresence>
      {match && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          {/* Confetti burst */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {Array.from({ length: BURST_COUNT }).map((_, i) => {
              const angle = (i / BURST_COUNT) * 2 * Math.PI + Math.random() * 0.5;
              const r = 80 + Math.random() * 60;
              const delay = 0.05 + i * 0.02;
              const size = 6 + Math.random() * 6;
              const colors = ["#22c55e", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4"];
              const color = colors[i % colors.length];
              return (
                <motion.div
                  key={i}
                  initial={{ scale: 0, x: "50%", y: "50%", opacity: 1 }}
                  animate={{
                    scale: [0, 1],
                    x: `calc(50% + ${Math.cos(angle) * r}px)`,
                    y: `calc(50% + ${Math.sin(angle) * r}px)`,
                    opacity: [1, 0],
                  }}
                  transition={{
                    delay,
                    duration: 0.7,
                    ease: "easeOut",
                  }}
                  className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full -translate-x-1/2 -translate-y-1/2"
                  style={{ width: size, height: size, backgroundColor: color }}
                />
              );
            })}
          </div>

          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 22, stiffness: 280, duration: 0.35 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl ring-1 ring-black/5"
          >
            {/* Avatars row */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              className="flex justify-center gap-4 items-center"
            >
              <div className="h-16 w-16 rounded-full overflow-hidden bg-matcher-mint ring-4 ring-white shadow-lg flex items-center justify-center text-2xl font-bold text-matcher-dark">
                {isCandidateView ? "👤" : <img src={AVATAR_PLACEHOLDER} alt="" className="h-full w-full object-cover" />}
              </div>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.25, type: "spring", stiffness: 300 }}
                className="text-3xl text-matcher"
                aria-hidden
              >
                ♥
              </motion.span>
              <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-100 ring-4 ring-white shadow-lg flex items-center justify-center text-2xl font-bold text-gray-600">
                {isCandidateView ? <span className="text-lg">{match.company.slice(0, 2).toUpperCase()}</span> : "👤"}
              </div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.25 }}
              className="font-heading mt-6 text-center text-2xl font-bold tracking-tight text-gray-900"
            >
              It&apos;s a Match!
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.25 }}
              className="mt-2 text-center text-gray-600"
            >
              {formatMatchSubtext(match, isCandidateView)}
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="mt-4 rounded-xl bg-gray-50 px-4 py-3 text-center"
            >
              <p className="text-sm font-semibold text-gray-900">{match.vacancyTitle}</p>
              <p className="text-sm text-gray-600">{match.company}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.25 }}
              className="mt-8 flex flex-col gap-3"
            >
              <motion.button
                type="button"
                onClick={onOpenChat}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="rounded-xl bg-matcher px-6 py-3.5 font-semibold text-white shadow-lg shadow-matcher/25 hover:bg-matcher-dark transition-colors"
              >
                Start Chat
              </motion.button>
              <motion.button
                type="button"
                onClick={onClose}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="rounded-xl border border-gray-200 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Continue Browsing
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
