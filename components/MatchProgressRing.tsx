"use client";

/**
 * Circular progress ring around employer initial/logo to emphasize "algorithm" match score.
 * Used on swipe cards for Gen Z scannability.
 */

function getMatchColorClasses(percent: number): { ringClass: string; textClass: string } {
  if (percent < 40) {
    // Weak match – red
    return { ringClass: "text-red-500", textClass: "text-red-600" };
  }
  if (percent < 70) {
    // Medium match – amber
    return { ringClass: "text-amber-500", textClass: "text-amber-600" };
  }
  // Strong match – green
  return { ringClass: "text-green-500", textClass: "text-green-600" };
}
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
  const stroke = Math.max(3, Math.floor(size / 10));
  const r = (size - stroke) / 2 - 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (percent / 100) * circumference;
  const { ringClass, textClass } = getMatchColorClasses(percent);

  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="absolute inset-0 -rotate-90" aria-hidden>
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-gray-200"
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
          className={`${ringClass} transition-[stroke-dashoffset] duration-500`}
        />
      </svg>
      <div className={`relative z-10 flex items-center justify-center text-sm font-bold ${textClass}`}>
        {children}
      </div>
    </div>
  );
}
