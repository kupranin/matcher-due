"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Logo from "@/components/Logo";
import Footer from "@/components/Footer";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const prose = "text-gray-700 leading-relaxed";
const list = "space-y-2 pl-0 list-none";
const listItem = "flex gap-3 before:content-[''] before:shrink-0 before:w-1.5 before:h-1.5 before:rounded-full before:mt-2 before:bg-matcher";

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

export default function TermsPage() {
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
            Terms of Use
          </h1>
          <span className="inline-flex shrink-0 items-center rounded-full bg-matcher/15 px-4 py-1.5 text-sm font-medium text-matcher-dark">
            Effective 1/1/2026
          </span>
        </div>

        <div className="mt-8 rounded-2xl border border-matcher/20 bg-matcher-pale/30 p-6 sm:p-8">
          <p className={prose}>
            Welcome to Matcher.ge (“Matcher”, “we”, “our”, “us”). These Terms of
            Use (“Terms”) govern your access to and use of the Matcher.ge
            platform, including our website, services, and related tools (the
            “Service”).
          </p>
          <p className={`mt-4 ${prose}`}>
            By using Matcher.ge, you agree to these Terms. If you do not agree,
            please do not use the Service.
          </p>
        </div>

        <div className="mt-12 space-y-8">
          <Section number={1} title="What Matcher Does">
            <p>
              Matcher.ge is a job matching platform designed to help entry-level
              candidates connect with employers through structured profiles and
              skill-based matching.
            </p>
            <p className="mt-3">Matcher does not guarantee employment, interviews, or job offers.</p>
          </Section>

          <Section number={2} title="Eligibility">
            <p>To use Matcher.ge, you must:</p>
            <ul className={list}>
              <li className={listItem}>be at least 16 years old (or the minimum working age in Georgia)</li>
              <li className={listItem}>provide accurate information during registration</li>
              <li className={listItem}>use the platform only for lawful purposes</li>
            </ul>
          </Section>

          <Section number={3} title="User Accounts">
            <p>To access certain features, you may need to create an account.</p>
            <p className="mt-3">You agree to:</p>
            <ul className={list}>
              <li className={listItem}>provide correct and complete information</li>
              <li className={listItem}>keep your login details secure</li>
              <li className={listItem}>notify us if you believe your account has been compromised</li>
            </ul>
            <p className="mt-4">
              Matcher is not responsible for unauthorized access caused by your
              failure to protect your credentials.
            </p>
          </Section>

          <Section number={4} title="User Responsibilities">
            <p>When using Matcher.ge, you agree not to:</p>
            <ul className={list}>
              <li className={listItem}>submit false or misleading information</li>
              <li className={listItem}>impersonate another person or company</li>
              <li className={listItem}>misuse the platform for spam or fraud</li>
              <li className={listItem}>attempt to access systems or data you are not authorized to access</li>
              <li className={listItem}>interfere with the platform’s security or functionality</li>
            </ul>
            <p className="mt-4">
              We reserve the right to suspend or terminate accounts that violate
              these rules.
            </p>
          </Section>

          <Section number={5} title="Employer Interactions">
            <p>
              Matcher.ge helps facilitate connections between job seekers and
              employers.
            </p>
            <p className="mt-3">Employers are solely responsible for:</p>
            <ul className={list}>
              <li className={listItem}>job descriptions</li>
              <li className={listItem}>hiring decisions</li>
              <li className={listItem}>interview processes</li>
              <li className={listItem}>compliance with labor laws</li>
            </ul>
            <p className="mt-4">Matcher is not a party to employment agreements.</p>
          </Section>

          <Section number={6} title="Platform Content">
            <p>
              All content on Matcher.ge, including branding, design, software,
              and text, is owned by Matcher or its licensors and may not be
              copied or reused without permission.
            </p>
            <p className="mt-3">
              Users retain ownership of the information they submit but grant
              Matcher a license to use it for providing matching services.
            </p>
          </Section>

          <Section number={7} title="Disclaimer of Warranties">
            <p>Matcher.ge is provided “as is” and “as available.”</p>
            <p className="mt-3">We do not guarantee that:</p>
            <ul className={list}>
              <li className={listItem}>matches will lead to employment</li>
              <li className={listItem}>the platform will be uninterrupted or error-free</li>
              <li className={listItem}>employers will respond to candidates</li>
            </ul>
          </Section>

          <Section number={8} title="Limitation of Liability">
            <p>To the maximum extent allowed by law, Matcher.ge is not liable for:</p>
            <ul className={list}>
              <li className={listItem}>lost job opportunities</li>
              <li className={listItem}>employer decisions</li>
              <li className={listItem}>indirect or consequential damages</li>
              <li className={listItem}>disputes between users and employers</li>
            </ul>
          </Section>

          <Section number={9} title="Termination">
            <p>You may stop using Matcher.ge at any time.</p>
            <p className="mt-3">We may suspend or terminate access if:</p>
            <ul className={list}>
              <li className={listItem}>you violate these Terms</li>
              <li className={listItem}>required by law</li>
              <li className={listItem}>necessary to protect platform integrity</li>
            </ul>
          </Section>

          <Section number={10} title="Changes to Terms">
            <p>
              We may update these Terms from time to time. Continued use of the
              platform means you accept the updated Terms.
            </p>
          </Section>

          <section className="relative rounded-2xl border-2 border-matcher/30 bg-matcher-pale/40 p-6 shadow-sm sm:p-8">
            <div className="absolute left-0 top-6 h-1 w-12 rounded-r-full bg-matcher sm:top-8" />
            <div className="pl-4 sm:pl-6">
              <h2 className="text-lg font-semibold text-gray-900">11. Contact</h2>
              <p className="mt-2 text-gray-700">For questions about these Terms, contact:</p>
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
