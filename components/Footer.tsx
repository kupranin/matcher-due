"use client";

import { Link } from "@/i18n/navigation";

const currentYear = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:items-start">
          {/* Left: Brand */}
          <div className="lg:col-span-2 flex flex-col">
            <p className="max-w-xs text-sm font-bold text-gray-900">
              Fast, structured hiring for entry-level jobs in Georgia.
            </p>
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
              Company
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-gray-500 transition hover:text-gray-900"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/team"
                  className="text-sm text-gray-500 transition hover:text-gray-900"
                >
                  Team
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-gray-500 transition hover:text-gray-900"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Middle: Legal links */}
          <div className="flex flex-col">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-900">
              Legal
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/legal/terms"
                  className="text-sm text-gray-500 transition hover:text-gray-900"
                >
                  User Agreement
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/privacy"
                  className="text-sm text-gray-500 transition hover:text-gray-900"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Right: Social links */}
          <div className="flex flex-col">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-900">
              Follow us
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <a
                  href="https://linkedin.com/company/matcher-ge"
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
            © {currentYear} Matcher.ge — All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
