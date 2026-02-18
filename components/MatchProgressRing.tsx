"use client";

/**
 * Circular progress ring around employer initial/logo to emphasize "algorithm" match score.
 * Used on swipe cards for Gen Z scannability.
 */
export default function MatchProgressRing({
  percent,
  size = 56,
  className = "",
  children,
}: {
  percent: number;
  size?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const stroke = Math.max(2, Math.floor(size / 14));
  const r = (size - stroke) / 2 - 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className={`relative inline-flex shrink-0 items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0 -rotate-90" aria-hidden>
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-white/20"
        />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-matcher-bright transition-[stroke-dashoffset] duration-500"
        />
      </svg>
      <div className="relative z-10 flex items-center justify-center text-sm font-bold text-white">
        {children}
      </div>
    </div>
  );
}
