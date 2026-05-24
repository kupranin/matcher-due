"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { LogOut } from "lucide-react";
import Logo from "@/components/Logo";
import { performCandidateLogout } from "@/lib/logoutUtils";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { useTheme } from "@/components/theme/ThemeProvider";

export default function CabinetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);

  const rawHello = tCommon("hello");
  const helloLabel = rawHello === "common.hello" || rawHello === "hello" ? "Hello" : rawHello;

  useEffect(() => {
    fetch("/api/auth/session", { credentials: "include" })
      .then((r) => r.json())
      .then(async (data: { userId?: string | null; user: { id?: string; role: string } | null }) => {
        setAuthChecked(true);
        if (!data?.user || data.user.role !== "CANDIDATE") {
          router.replace("/login");
          return;
        }
        const userId = data.user.id || data.userId;
        if (!userId) return;
        // Try to hydrate candidate name for greeting
        try {
          const res = await fetch(`/api/candidates/profile?userId=${encodeURIComponent(userId)}`);
          const profile = (await res.json().catch(() => null)) as { fullName?: string | null; photo?: string | null } | null;
          if (profile?.fullName) setUserName(profile.fullName);
          if (profile?.photo) setUserPhoto(profile.photo);
        } catch {
          // ignore – greeting is optional
        }
      })
      .catch(() => {
        setAuthChecked(true);
        router.replace("/login");
      });
  }, [router]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    performCandidateLogout();
    router.push("/login");
  }

  if (!authChecked) {
    return (
      <div className={`flex min-h-screen items-center justify-center ${isDark ? "bg-[#070B12]" : "bg-gray-50"}`}>
        <p className={isDark ? "text-white/70" : "text-gray-500"}>Loading…</p>
      </div>
    );
  }

  const navLinks = [
    { href: "/cabinet", label: tCommon("opportunities"), active: pathname === "/cabinet" },
    { href: "/cabinet/matches", label: tCommon("matches"), active: pathname === "/cabinet/matches" },
    { href: "/cabinet/chats", label: tCommon("chats"), active: pathname?.includes("/chats") },
  ];

  return (
    <div className={`flex min-h-screen flex-col md:flex-row ${isDark ? "bg-[#070B12] text-white" : "bg-gray-50 text-gray-900"}`}>
      {/* Mobile header */}
      <header className={`flex items-center justify-between border-b px-4 py-3 md:hidden ${isDark ? "border-white/10 bg-black/30" : "border-gray-200 bg-white"}`}>
        <Logo height={56} />
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileMenuOpen((o) => !o)}
            className={`rounded-lg p-2 ${isDark ? "text-white/80 hover:bg-white/10" : "text-gray-600 hover:bg-gray-100"}`}
            aria-label="Menu"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
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
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r shadow-xl transition-transform md:sticky md:top-0 md:left-0 md:z-auto md:w-56 md:translate-x-0 md:shadow-none ${
          isDark ? "border-white/10 bg-[#0b101a]" : "border-gray-100 bg-white"
        } ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-screen flex flex-col justify-between p-4">
          {/* Top: logo */}
          <div>
            <div className="mb-8 flex items-center">
              <Logo height={34} className="max-h-9 w-auto" />
            </div>
            <div className="mb-4 hidden items-center gap-2 md:flex">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-2 flex-grow">
              {navLinks.map(({ href, label, active }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-xl p-3 text-sm font-medium transition-colors ${
                    active
                      ? isDark
                        ? "bg-matcher/20 text-matcher-bright"
                        : "bg-green-50 text-green-700"
                      : isDark
                      ? "text-white/70 hover:bg-white/10"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Bottom: user snippet + logout */}
          <div className={`mt-auto border-t pt-6 ${isDark ? "border-white/10" : "border-gray-100"}`}>
            <Link
              href="/cabinet/profile"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex w-full items-center rounded-xl p-3 transition-colors ${isDark ? "hover:bg-white/10" : "hover:bg-gray-50"}`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${isDark ? "bg-white/15 text-white" : "bg-gray-200 text-gray-700"}`}>
                {userPhoto ? (
                  <img
                    src={userPhoto}
                    alt={userName ? `${userName} profile photo` : "Profile photo"}
                    className="h-full w-full rounded-full object-cover"
                    onError={() => setUserPhoto(null)}
                  />
                ) : (
                  userName?.charAt(0)?.toUpperCase() || "L"
                )}
              </div>
              <div className="ml-3 flex flex-col items-start">
                <span className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{userName || "Lali Chokheli"}</span>
                <span className={isDark ? "text-xs text-white/60" : "text-xs text-gray-400"}>{tCommon("profile")}</span>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              className="mt-4 flex w-full items-center rounded-xl p-3 text-sm font-medium text-red-500 transition-all hover:bg-red-50"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {tCommon("logOut")}
            </button>
          </div>
        </div>
      </aside>

      {/* Main content - padding for mobile bottom nav */}
      <main className="flex-1 overflow-auto pb-20 md:pb-0">
        {userName && (
          <div className={`sticky top-0 z-10 border-b px-4 py-3 backdrop-blur md:static md:border-none md:bg-transparent ${isDark ? "border-white/10 bg-[#070B12]/85" : "border-gray-100 bg-gray-50/95"}`}>
            <p className={`mx-auto max-w-3xl text-sm font-medium ${isDark ? "text-white/90" : "text-gray-800"}`}>
              {helloLabel},{" "}
              <span className="font-semibold">{userName}</span>
            </p>
          </div>
        )}
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav className={`fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden ${isDark ? "border-white/10 bg-[#0b101a]" : "border-gray-200 bg-white"}`}>
        {navLinks.map(({ href, label, active }) => {
          const icon =
            href === "/cabinet"
              ? "💼"
              : href === "/cabinet/matches"
              ? "♥"
              : href === "/cabinet/chats"
              ? "💬"
              : "👤";
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium ${
                active ? "text-matcher-dark" : isDark ? "text-white/70" : "text-gray-500"
              }`}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
