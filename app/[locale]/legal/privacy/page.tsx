"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Logo from "@/components/Logo";
import Footer from "@/components/Footer";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const prose = "text-gray-700 leading-relaxed";
const list = "space-y-2 pl-0 list-none";
const listItem = "flex gap-3 before:content-[''] before:shrink-0 before:w-1.5 before:h-1.5 before:rounded-full before:mt-2 before:bg-matcher";
const subheading = "text-base font-medium text-gray-900 mt-4";

function Section({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="relative rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm transition hover:shadow-md sm:p-8">
      <div className="absolute left-0 top-6 h-1 w-12 rounded-r-full bg-matcher sm:top-8" />
      <div className="flex gap-4 pl-4 sm:pl-6">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-matcher/15 text-sm font-bold text-matcher-dark">
          {number}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <div className={`mt-4 ${prose}`}>{children}</div>
        </div>
      </div>
    </section>
  );
}

export default function PrivacyPage() {
  const tCommon = useTranslations("common");

  return (
    <div className="relative min-h-screen bg-white">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-matcher-pale/50 via-white to-gray-50/50" />

      <header className="border-b border-gray-100/80 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="shrink-0 transition-opacity hover:opacity-90">
            <Logo height={56} />
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              href="/"
              className="shrink-0 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-matcher hover:bg-matcher-pale hover:text-matcher-dark"
            >
              {tCommon("backToHome")}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Privacy Policy — Matcher.ge
          </h1>
          <span className="inline-flex shrink-0 items-center rounded-full bg-matcher/15 px-4 py-1.5 text-sm font-medium text-matcher-dark">
            Effective 1/1/2026
          </span>
        </div>

        <div className="mt-8 rounded-2xl border border-matcher/20 bg-matcher-pale/30 p-6 sm:p-8">
          <p className={prose}>
            Matcher.ge (“Matcher”, “we”, “our”) values your privacy. This
            Privacy Policy explains what data we collect, how we use it, and
            your rights.
          </p>
          <p className={`mt-4 ${prose}`}>By using Matcher.ge, you agree to this policy.</p>
        </div>

        <div className="mt-12 space-y-8">
          <Section number={1} title="Information We Collect">
            <p>We may collect:</p>
            <h3 className={subheading}>a) Personal Information</h3>
            <ul className={list}>
              <li className={listItem}>Name</li>
              <li className={listItem}>Phone number</li>
              <li className={listItem}>Email address</li>
            </ul>
            <h3 className={subheading}>b) Profile Information</h3>
            <ul className={list}>
              <li className={listItem}>Job preferences</li>
              <li className={listItem}>Skills and experience</li>
              <li className={listItem}>Availability (full-time, part-time, remote, etc.)</li>
            </ul>
            <h3 className={subheading}>c) Technical Data</h3>
            <ul className={list}>
              <li className={listItem}>Device type and browser</li>
              <li className={listItem}>IP address</li>
              <li className={listItem}>Usage activity on the platform</li>
            </ul>
          </Section>

          <Section number={2} title="How We Use Your Information">
            <p>We use your data to:</p>
            <ul className={list}>
              <li className={listItem}>create and manage your account</li>
              <li className={listItem}>provide job matching services</li>
              <li className={listItem}>recommend relevant opportunities</li>
              <li className={listItem}>connect candidates with employers (with consent)</li>
              <li className={listItem}>improve platform performance and user experience</li>
              <li className={listItem}>prevent fraud and ensure safety</li>
            </ul>
          </Section>

          <Section number={3} title="Sharing of Information">
            <p>We do not sell personal data.</p>
            <p className="mt-3">We may share limited information:</p>
            <p className="mt-3 font-medium text-gray-900">With Employers</p>
            <p>Only when you choose to match or apply, your profile may be shared with relevant employers.</p>
            <p className="mt-3 font-medium text-gray-900">With Service Providers</p>
            <p>We may use trusted tools (e.g., hosting, analytics, messaging) that process data on our behalf.</p>
            <p className="mt-3 font-medium text-gray-900">Legal Requirements</p>
            <p>We may disclose data if required by law or to protect users and platform security.</p>
          </Section>

          <Section number={4} title="Data Storage and Security">
            <p>
              We take reasonable measures to protect your data, including
              encryption and secure infrastructure.
            </p>
            <p className="mt-3">However, no online system is 100% secure.</p>
          </Section>

          <Section number={5} title="Your Rights">
            <p>You have the right to:</p>
            <ul className={list}>
              <li className={listItem}>access your personal data</li>
              <li className={listItem}>correct inaccurate information</li>
              <li className={listItem}>request deletion of your account</li>
              <li className={listItem}>withdraw consent for employer sharing</li>
            </ul>
            <p className="mt-4">To request changes, email: <a href="mailto:hello@matcher.ge" className="font-medium text-matcher-dark underline decoration-matcher/50 underline-offset-2 hover:decoration-matcher">hello@matcher.ge</a></p>
          </Section>

          <Section number={6} title="Data Retention">
            <p>We keep data only as long as needed for:</p>
            <ul className={list}>
              <li className={listItem}>matching services</li>
              <li className={listItem}>legal obligations</li>
              <li className={listItem}>platform improvement</li>
            </ul>
            <p className="mt-4">You may request deletion at any time.</p>
          </Section>

          <Section number={7} title="Cookies">
            <p>Matcher.ge may use cookies or similar technologies to:</p>
            <ul className={list}>
              <li className={listItem}>keep you signed in</li>
              <li className={listItem}>analyze traffic</li>
              <li className={listItem}>improve experience</li>
            </ul>
            <p className="mt-4">You can disable cookies in your browser settings.</p>
          </Section>

          <Section number={8} title="Updates to This Policy">
            <p>
              We may update this Privacy Policy periodically. Updates will be
              posted on this page.
            </p>
          </Section>

          <section className="relative rounded-2xl border-2 border-matcher/30 bg-matcher-pale/40 p-6 shadow-sm sm:p-8">
            <div className="absolute left-0 top-6 h-1 w-12 rounded-r-full bg-matcher sm:top-8" />
            <div className="pl-4 sm:pl-6">
              <h2 className="text-lg font-semibold text-gray-900">9. Contact</h2>
              <p className="mt-2 text-gray-700">For privacy questions, contact:</p>
              <ul className="mt-4 space-y-2 text-gray-700">
                <li>
                  <a href="mailto:hello@matcher.ge" className="font-medium text-matcher-dark underline decoration-matcher/50 underline-offset-2 hover:decoration-matcher">
                    📧 hello@matcher.ge
                  </a>
                </li>
                <li>📍 Georgia</li>
              </ul>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
