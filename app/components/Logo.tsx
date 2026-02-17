import Link from "next/link";

interface LogoProps {
  href?: string;
  className?: string;
  height?: number;
}

export default function Logo({ href = "/", className = "", height = 32 }: LogoProps) {
  const img = (
    <img
      src="/logo.png"
      alt="Matcher.ge"
      className="h-auto w-auto object-contain"
      style={{ height: `${height}px`, maxWidth: "140px" }}
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
