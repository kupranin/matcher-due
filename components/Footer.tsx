"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const currentYear = new Date().getFullYear();

const SOCIAL_LINKS = [
  {
    id: "facebook",
    href: "https://facebook.com/matcher.ge",
    label: "Facebook",
    icon: FacebookIcon,
  },
  {
    id: "linkedin",
    href: "https://www.linkedin.com/company/matcher-ge",
    label: "LinkedIn",
    icon: LinkedInIcon,
  },
  {
    id: "instagram",
    href: "https://instagram.com/matcher.ge",
    label: "Instagram",
    icon: InstagramIcon,
  },
] as const;

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.908 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm0 5.838a3.988 3.988 0 100 7.976 3.988 3.988 0 000-7.976zM12 8.865a3.135 3.135 0 110 6.27 3.135 3.135 0 010-6.27z" clipRule="evenodd" />
      <path d="M18.43 6.664a.932.932 0 100 1.864.932.932 0 000-1.864z" />
    </svg>
  );
}

function ExternalArrow({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M4.5 11.5L11.5 4.5M11.5 4.5H5.5M11.5 4.5V10.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SocialIconButton({
  href,
  label,
  icon: Icon,
  isDark,
}: {
  href: string;
  label: string;
  icon: typeof FacebookIcon;
  isDark: boolean;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={`group relative flex h-11 w-11 items-center justify-center rounded-2xl border transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-105 active:scale-95 ${
        isDark
          ? "border-white/10 bg-white/5 text-white/70 hover:border-white/25 hover:bg-white/10 hover:text-white hover:shadow-lg hover:shadow-black/20"
          : "border-gray-200/80 bg-gray-50/80 text-gray-500 hover:border-matcher/30 hover:bg-matcher-pale hover:text-matcher-dark hover:shadow-md hover:shadow-matcher/10"
      }`}
    >
      <Icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
    </a>
  );
}

function SocialTextLink({
  href,
  label,
  icon: Icon,
  isDark,
}: {
  href: string;
  label: string;
  icon: typeof FacebookIcon;
  isDark: boolean;
}) {
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        className={`group flex items-center gap-3 rounded-2xl border px-3.5 py-2.5 text-sm font-medium transition-all duration-300 ease-out hover:-translate-y-0.5 active:translate-y-0 ${
          isDark
            ? "border-transparent text-white/70 hover:border-white/10 hover:bg-white/5 hover:text-white"
            : "border-transparent text-gray-600 hover:border-gray-100 hover:bg-gray-50 hover:text-gray-900"
        }`}
      >
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors duration-300 ${
            isDark
              ? "bg-white/10 text-white/80 group-hover:bg-white/15 group-hover:text-white"
              : "bg-matcher-pale/60 text-matcher-dark group-hover:bg-matcher-pale"
          }`}
        >
          <Icon className="h-4 w-4" />
        </span>
        <span className="flex-1">{label}</span>
        <ExternalArrow
          className={`h-3.5 w-3.5 shrink-0 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 ${
            isDark ? "text-white/50" : "text-gray-400"
          }`}
        />
      </a>
    </li>
  );
}

function FooterLink({
  href,
  children,
  isDark,
}: {
  href: string;
  children: ReactNode;
  isDark: boolean;
}) {
  const className = `group relative inline-flex text-sm transition-colors duration-200 ${
    isDark ? "text-white/65 hover:text-white" : "text-gray-500 hover:text-gray-900"
  }`;

  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className}>
        <span className="relative">
          {children}
          <span
            className={`absolute -bottom-0.5 left-0 h-px w-0 transition-all duration-300 group-hover:w-full ${
              isDark ? "bg-white/60" : "bg-matcher"
            }`}
          />
        </span>
      </Link>
    );
  }

  return (
    <a href={href} className={className}>
      <span className="relative">
        {children}
        <span
          className={`absolute -bottom-0.5 left-0 h-px w-0 transition-all duration-300 group-hover:w-full ${
            isDark ? "bg-white/60" : "bg-matcher"
          }`}
        />
      </span>
    </a>
  );
}

export default function Footer({
  variant = "light",
}: {
  variant?: "light" | "dark";
}) {
  const t = useTranslations("footer");
  const isDark = variant === "dark";

  const headingClass = isDark
    ? "text-xs font-semibold uppercase tracking-[0.18em] text-white"
    : "text-xs font-semibold uppercase tracking-[0.18em] text-gray-900";

  return (
    <footer
      className={
        isDark
          ? "border-t border-white/10 bg-transparent"
          : "border-t border-gray-200/80 bg-white"
      }
    >
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:items-start">
          <div className="lg:col-span-2 flex flex-col">
            <p
              className={
                isDark
                  ? "max-w-xs text-sm font-bold leading-relaxed text-white"
                  : "max-w-xs text-sm font-bold leading-relaxed text-gray-900"
              }
            >
              {t("tagline")}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              {SOCIAL_LINKS.map((social) => (
                <SocialIconButton
                  key={social.id}
                  href={social.href}
                  label={social.label}
                  icon={social.icon}
                  isDark={isDark}
                />
              ))}
            </div>

            <div className={`mt-5 space-y-2 text-sm ${isDark ? "text-white/65" : "text-gray-500"}`}>
              <a
                href="mailto:keti@matcher.ge"
                className={`group flex w-fit items-center gap-2 rounded-xl px-2 py-1.5 transition-all duration-300 ${
                  isDark ? "hover:bg-white/5 hover:text-white" : "hover:bg-matcher-pale/50 hover:text-matcher-dark"
                }`}
              >
                <span className="font-medium">keti@matcher.ge</span>
              </a>
              <a
                href="tel:+995599620426"
                className={`group flex w-fit items-center gap-2 rounded-xl px-2 py-1.5 transition-all duration-300 ${
                  isDark ? "hover:bg-white/5 hover:text-white" : "hover:bg-matcher-pale/50 hover:text-matcher-dark"
                }`}
              >
                <span className="font-medium">+995 599 62 04 26</span>
              </a>
            </div>
          </div>

          <div className="flex flex-col">
            <h3 className={headingClass}>{t("company")}</h3>
            <ul className="mt-4 space-y-2.5">
              {[
                { href: "/about", label: t("about") },
                { href: "/team", label: t("team") },
                { href: "/contact", label: t("contact") },
              ].map((item) => (
                <li key={item.href}>
                  <FooterLink href={item.href} isDark={isDark}>
                    {item.label}
                  </FooterLink>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col">
            <h3 className={headingClass}>{t("legal")}</h3>
            <ul className="mt-4 space-y-2.5">
              {[
                { href: "/legal/terms", label: t("userAgreement") },
                { href: "/legal/privacy", label: t("privacyPolicy") },
              ].map((item) => (
                <li key={item.href}>
                  <FooterLink href={item.href} isDark={isDark}>
                    {item.label}
                  </FooterLink>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col">
            <h3 className={headingClass}>{t("followUs")}</h3>
            <ul className="mt-3 space-y-1">
              {SOCIAL_LINKS.map((social) => (
                <SocialTextLink
                  key={social.id}
                  href={social.href}
                  label={social.label}
                  icon={social.icon}
                  isDark={isDark}
                />
              ))}
            </ul>
          </div>
        </div>

        <div
          className={
            isDark
              ? "mt-12 border-t border-white/10 pt-8"
              : "mt-12 border-t border-gray-100 pt-8"
          }
        >
          <p
            className={
              isDark
                ? "text-center text-xs text-white/50"
                : "text-center text-xs text-gray-500"
            }
          >
            {t("allRightsReserved", { year: String(currentYear) })}
          </p>
        </div>
      </div>
    </footer>
  );
}
