"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import Logo from "@/components/Logo";
import { MOCK_EMPLOYER_SUBSCRIPTION } from "@/lib/matchMockData";
import { performEmployerLogout } from "@/lib/logoutUtils";

export default function EmployerCabinetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tCommon = useTranslations("common");
  const tCabinet = useTranslations("employerCabinet");
  const pathname = usePathname();
  const router = useRouter();
  const [hasSubscription, setHasSubscription] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function handleLogout() {
    performEmployerLogout();
    router.push("/login");
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("employerLoggedIn", "1");
      setHasSubscription(!!window.sessionStorage.getItem("employerHasSubscription"));
    }
  }, []);

  const sub = hasSubscription ? MOCK_EMPLOYER_SUBSCRIPTION : null;

  const navLinks = [
    { href: "/employer/cabinet", label: tCommon("candidates"), active: pathname?.endsWith("/employer/cabinet") && !pathname?.includes("/chats") },
    { href: "/employer/cabinet/chats", label: tCommon("chats"), active: pathname?.includes("/chats") },
    { href: "/employer/post?from=cabinet", label: tCommon("postVacancy"), active: false },
    { href: "/employer/cabinet/profile", label: tCommon("company"), active: pathname === "/employer/cabinet/profile" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 md:flex-row">
      {/* Mobile header */}
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 md:hidden">
        <Logo height={56} />
        <button
          type="button"
          onClick={() => setMobileMenuOpen((o) => !o)}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
          aria-label="Menu"
        >
          {mobileMenuOpen ? "✕" : "☰"}
        </button>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/20 md:hidden" onClick={() => setMobileMenuOpen(false)} aria-hidden />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-gray-200 bg-white shadow-xl transition-transform md:relative md:left-0 md:z-auto md:w-56 md:translate-x-0 md:shadow-none ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col overflow-y-auto p-4 pt-14 md:pt-4">
          <div className="mb-8 flex items-center justify-center rounded-xl border border-matcher/20 bg-matcher-pale/50 px-4 py-5">
            <Logo height={72} />
          </div>

          {sub ? (
            <div className="mb-6 rounded-xl border border-matcher/30 bg-matcher-pale p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-matcher-dark">
                {tCabinet("subscription")}
              </p>
              <p className="mt-1 font-semibold text-gray-900">{sub.packageLabel}</p>
              <p className="mt-1 text-xs text-gray-600">
                {sub.vacanciesTotal === -1
                  ? `${sub.vacanciesUsed} ${tCabinet("used")} · ${tCabinet("unlimited")}`
                  : `${sub.vacanciesUsed} / ${sub.vacanciesTotal} ${tCabinet("vacanciesUsed")}`}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {tCabinet("validUntil")} {new Date(sub.validUntil).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </p>
              <p className="mt-1 text-xs text-matcher-dark">{sub.pricePaid} GEL / year</p>
            </div>
          ) : (
            <div className="mb-6 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {tCabinet("subscription")}
              </p>
              <p className="mt-1 text-sm font-medium text-gray-700">{tCabinet("noSubscriptionYet")}</p>
              <p className="mt-1 text-xs text-gray-500">
                {tCabinet("postVacancyToStart")}
              </p>
              <Link
                href="/employer/post?from=cabinet"
                className="mt-3 block rounded-lg bg-matcher px-3 py-2 text-center text-sm font-medium text-white hover:bg-matcher-dark"
              >
                {tCommon("postVacancy")}
              </Link>
            </div>
          )}

          <nav className="flex flex-col gap-1">
            {navLinks.map(({ href, label, active }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className={`rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  active ? "bg-matcher-mint text-matcher-dark" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
              className="w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            >
              {tCommon("logOut")}
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto pb-20 md:pb-0">{children}</main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-gray-200 bg-white py-2 md:hidden">
        {navLinks.slice(0, 3).map(({ href, label, active }) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium ${active ? "text-matcher-dark" : "text-gray-500"}`}
          >
            <span>{label === tCommon("candidates") ? "👥" : label === tCommon("chats") ? "💬" : "➕"}</span>
            <span className="truncate max-w-[80px]">{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
