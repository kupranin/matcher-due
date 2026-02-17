"use client";

import { Link } from "@/i18n/navigation";

interface LogoProps {
  href?: string;
  className?: string;
  height?: number;
}

export default function Logo({ href = "/", className = "", height = 80 }: LogoProps) {
  const img = (
    <img
      src="/logo.svg"
      alt="Matcher.ge"
      className="h-auto w-auto object-contain"
      style={{ height: `${height}px`, maxWidth: `${height * 3.5}px` }}
    />
  );

  if (href) {
    return (
      <Link href={href} className={`inline-flex items-center ${className}`}>
        {img}
      </Link>
    );
  }

  return <span className={`inline-flex items-center ${className}`}>{img}</span>;
}
