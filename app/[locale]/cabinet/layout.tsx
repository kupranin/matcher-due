"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import Logo from "@/components/Logo";
import { performCandidateLogout } from "@/lib/logoutUtils";

export default function CabinetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function handleLogout() {
    performCandidateLogout();
    router.push("/login");
  }

  const navLinks = [
    { href: "/cabinet", label: tCommon("matches"), active: pathname === "/cabinet" },
    { href: "/cabinet/chats", label: tCommon("chats"), active: pathname?.includes("/chats") },
    { href: "/cabinet/profile", label: tCommon("profile"), active: pathname === "/cabinet/profile" },
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

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar - hidden on mobile, slide-out when open */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-gray-200 bg-white shadow-xl transition-transform md:relative md:left-0 md:z-auto md:w-56 md:translate-x-0 md:shadow-none ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col p-4 pt-14 md:pt-4">
          <div className="mb-6 hidden items-center justify-center rounded-xl border border-matcher/20 bg-matcher-pale/50 px-4 py-4 md:flex md:mb-8 md:py-5">
            <Logo height={72} />
          </div>

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
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              className="w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            >
              {tCommon("logOut")}
            </button>
          </div>
        </div>
      </aside>

      {/* Main content - padding for mobile bottom nav */}
      <main className="flex-1 overflow-auto pb-20 md:pb-0">{children}</main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-gray-200 bg-white py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden">
        {navLinks.map(({ href, label, active }) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium ${
              active ? "text-matcher-dark" : "text-gray-500"
            }`}
          >
            <span>{label === tCommon("matches") ? "♥" : label === tCommon("chats") ? "💬" : "👤"}</span>
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
