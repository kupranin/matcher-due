"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const currentYear = new Date().getFullYear();

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

export default function Footer() {
  const t = useTranslations("footer");
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:items-start">
          {/* Left: Brand + social icons */}
          <div className="lg:col-span-2 flex flex-col">
            <p className="max-w-xs text-sm font-bold text-gray-900">
              {t("tagline")}
            </p>
            <div className="mt-4 flex items-center gap-4">
              <a
                href="https://facebook.com/matcher.ge"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 transition hover:text-matcher-dark"
                aria-label="Facebook"
              >
                <FacebookIcon className="h-5 w-5" />
              </a>
              <a
                href="https://www.linkedin.com/company/matcher-ge"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 transition hover:text-matcher-dark"
                aria-label="LinkedIn"
              >
                <LinkedInIcon className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com/matcher.ge"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 transition hover:text-matcher-dark"
                aria-label="Instagram"
              >
                <InstagramIcon className="h-5 w-5" />
              </a>
            </div>
            <div className="mt-4 space-y-1 text-sm text-gray-500">
              <a
                href="mailto:keti@matcher.ge"
                className="block text-gray-500 transition hover:text-matcher-dark"
              >
                keti@matcher.ge
              </a>
              <a
                href="tel:+995599620426"
                className="block text-gray-500 transition hover:text-matcher-dark"
              >
                +995 599 62 04 26
              </a>
            </div>
          </div>

          {/* Middle: Company links */}
          <div className="flex flex-col">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-900">
              {t("company")}
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-gray-500 transition hover:text-gray-900"
                >
                  {t("about")}
                </Link>
              </li>
              <li>
                <Link
                  href="/team"
                  className="text-sm text-gray-500 transition hover:text-gray-900"
                >
                  {t("team")}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-gray-500 transition hover:text-gray-900"
                >
                  {t("contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Middle: Legal links */}
          <div className="flex flex-col">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-900">
              {t("legal")}
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/legal/terms"
                  className="text-sm text-gray-500 transition hover:text-gray-900"
                >
                  {t("userAgreement")}
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/privacy"
                  className="text-sm text-gray-500 transition hover:text-gray-900"
                >
                  {t("privacyPolicy")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Right: Social links */}
          <div className="flex flex-col">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-900">
              {t("followUs")}
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <a
                  href="https://www.linkedin.com/company/matcher-ge"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-500 transition hover:text-gray-900"
                  aria-label="LinkedIn"
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href="https://facebook.com/matcher.ge"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-500 transition hover:text-gray-900"
                  aria-label="Facebook"
                >
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href="https://x.com/matcher_ge"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-500 transition hover:text-gray-900"
                  aria-label="Twitter/X"
                >
                  Twitter/X
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-gray-100 pt-8">
          <p className="text-center text-xs text-gray-500">
            {t("allRightsReserved", { year: String(currentYear) })}
          </p>
        </div>
      </div>
    </footer>
  );
}
