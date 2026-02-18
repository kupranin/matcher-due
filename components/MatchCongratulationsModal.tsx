"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { MutualMatch } from "@/lib/matchStorage";

const BURST_COUNT = 12;

export default function MatchCongratulationsModal({
  match,
  onClose,
  onOpenChat,
}: {
  match: MutualMatch | null;
  onClose: () => void;
  onOpenChat: () => void;
}) {
  return (
    <AnimatePresence>
      {match && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl"
          >
            <div className="text-center">
              {/* Link-chain / interlocking rings (Matcher "m" reference) */}
              <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
                {Array.from({ length: BURST_COUNT }).map((_, i) => {
                  const angle = (i / BURST_COUNT) * 2 * Math.PI;
                  const r = 32;
                  return (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                      animate={{
                        scale: [0, 1.2, 0.8],
                        x: Math.cos(angle) * r,
                        y: Math.sin(angle) * r,
                        opacity: [1, 0.8, 0],
                      }}
                      transition={{
                        delay: 0.1 + i * 0.03,
                        duration: 0.8,
                        ease: "easeOut",
                      }}
                      className="absolute h-2 w-2 rounded-full bg-matcher-bright"
                    />
                  );
                })}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 18 }}
                  className="relative flex h-16 w-16 items-center justify-center"
                >
                  <svg viewBox="0 0 48 48" className="h-full w-full" aria-hidden>
                    <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="3" className="text-matcher" />
                    <circle cx="24" cy="24" r="12" fill="none" stroke="currentColor" strokeWidth="2" className="text-matcher-dark" />
                  </svg>
                </motion.div>
              </div>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                className="mt-2 block text-5xl"
              >
                🎉
              </motion.span>
              <h2 className="font-heading mt-4 text-2xl font-bold tracking-tight text-gray-900">It&apos;s a match!</h2>
              <p className="mt-2 text-gray-600">
                <span className="font-semibold text-matcher-dark">{match.company}</span> liked you for{" "}
                <span className="font-semibold">{match.vacancyTitle}</span>. Time to schedule next steps!
              </p>

              <div className="mt-8 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={onOpenChat}
                  className="rounded-xl bg-matcher px-6 py-3 font-semibold text-white shadow-lg hover:bg-matcher-dark"
                >
                  Open chat to schedule
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
