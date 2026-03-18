"use client";

import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggle({
  className = "",
}: {
  className?: string;
}) {
  const { resolvedTheme, toggle } = useTheme();

  const isDark = resolvedTheme === "dark";

  return (
    <motion.button
      type="button"
      onClick={toggle}
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: 1.02 }}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-md ${
        isDark
          ? "border-white/20 bg-white/10 text-white/90 hover:bg-white/15"
          : "border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50"
      } ${className}`}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </motion.button>
  );
}

