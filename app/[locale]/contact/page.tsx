"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { Mail, Phone, Clock, Copy } from "lucide-react";
import Logo from "@/components/Logo";
import Footer from "@/components/Footer";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { useTheme } from "@/components/theme/ThemeProvider";

export default function ContactPage() {
  const t = useTranslations("contactPage");
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [copied, setCopied] = useState<"email" | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      if (!res.ok) throw new Error("Submit failed");
      setStatus("success");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch {
      setStatus("error");
    }
  }

  function handleCopy(value: string, key: "email") {
    navigator.clipboard
      .writeText(value)
      .then(() => {
        setCopied(key);
        setTimeout(() => setCopied(null), 1800);
      })
      .catch(() => {
        // ignore
      });
  }

  return (
    <div className={isDark ? "relative min-h-screen bg-[#070B12] text-white" : "relative min-h-screen bg-white text-gray-900"}>
      <div
        className={
          isDark
            ? "pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(139,195,74,0.18),transparent_55%),radial-gradient(ellipse_at_bottom,rgba(0,173,181,0.14),transparent_55%)]"
            : "pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-matcher-pale/40 via-white to-white"
        }
      />

      {/* Subtle decorative blob in top-right for branding */}
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-matcher/20 blur-3xl"
        aria-hidden
      />

      <header className={isDark ? "border-b border-white/10 bg-black/40 backdrop-blur-sm" : "border-b border-gray-100/80 bg-white/80 backdrop-blur-sm"}>
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="shrink-0 transition-opacity hover:opacity-90">
            <Logo height={56} />
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggle />
            <Link
              href="/"
              className={
                isDark
                  ? "shrink-0 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white/85 transition hover:bg-white/15"
                  : "shrink-0 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-matcher hover:bg-matcher-pale hover:text-matcher-dark"
              }
            >
              {t("backToHome")}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-18">
        <div className="max-w-2xl">
          <h1 className={isDark ? "font-heading text-3xl font-extrabold tracking-tight text-white sm:text-4xl" : "font-heading text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl"}>
            {t("title")}
          </h1>
          <p className={isDark ? "mt-3 text-base leading-relaxed text-white/75 sm:text-lg" : "mt-3 text-base leading-relaxed text-gray-600 sm:text-lg"}>
            {t("subtitle")}
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:mt-12 lg:grid-cols-2 lg:gap-8">
          {/* Quick contact column */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className={
              isDark
                ? "space-y-4 rounded-3xl border border-white/15 bg-white/10 p-6 shadow-lg shadow-black/20 backdrop-blur-sm sm:p-7 lg:p-8"
                : "space-y-4 rounded-3xl border border-gray-100 bg-white/50 p-6 shadow-sm backdrop-blur-sm sm:p-7 lg:p-8"
            }
          >
            <p className={isDark ? "text-xs font-semibold uppercase tracking-[0.2em] text-white/70" : "text-xs font-semibold uppercase tracking-[0.2em] text-gray-500"}>
              {t("quickContactLabel")}
            </p>
            <h2 className={isDark ? "font-heading text-xl font-semibold text-white sm:text-2xl" : "font-heading text-xl font-semibold text-gray-900 sm:text-2xl"}>
              {t("quickContactTitle")}
            </h2>
            <p className={isDark ? "text-sm text-white/70" : "text-sm text-gray-600"}>
              {t("hint")}
            </p>

            <div className="mt-4 space-y-3">
              {/* Email tile */}
              <motion.div
                whileHover={{ y: -3, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className={
                  isDark
                    ? "flex items-center justify-between gap-4 rounded-2xl border border-white/15 bg-black/40 p-4 shadow-sm"
                    : "flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-sm"
                }
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-green-50 p-3 text-green-700">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className={isDark ? "text-xs font-semibold uppercase tracking-wide text-white/70" : "text-xs font-semibold uppercase tracking-wide text-gray-500"}>
                      {t("email")}
                    </p>
                    <a
                      href="mailto:keti@matcher.ge"
                      className={isDark ? "mt-0.5 block text-sm font-semibold text-white hover:underline" : "mt-0.5 block text-sm font-semibold text-matcher-dark hover:underline"}
                    >
                      keti@matcher.ge
                    </a>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy("keti@matcher.ge", "email")}
                  aria-label="Copy to Clipboard"
                  title="Copy to Clipboard"
                  className={
                    isDark
                      ? "inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium text-white/80 hover:bg-white/10"
                      : "inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-white"
                  }
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copied === "email" ? t("copied") : t("copy")}
                </button>
              </motion.div>

              {/* Phone tile */}
              <motion.div
                whileHover={{ y: -3, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className={
                  isDark
                    ? "flex items-center gap-3 rounded-2xl border border-white/15 bg-black/40 p-4 shadow-sm"
                    : "flex items-center gap-3 rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-sm"
                }
              >
                <div className="rounded-full bg-green-50 p-3 text-green-700">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className={isDark ? "text-xs font-semibold uppercase tracking-wide text-white/70" : "text-xs font-semibold uppercase tracking-wide text-gray-500"}>
                    {t("phone")}
                  </p>
                  <a
                    href="tel:+995599620426"
                    className={isDark ? "mt-0.5 block text-sm font-semibold text-white hover:underline" : "mt-0.5 block text-sm font-semibold text-matcher-dark hover:underline"}
                  >
                    +995 599 62 04 26
                  </a>
                </div>
              </motion.div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
              <span
                className={
                  isDark
                    ? "inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/80"
                    : "inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-700"
                }
              >
                <Clock className="h-3.5 w-3.5" />
              </span>
              <p className={isDark ? "text-xs font-medium text-white/70" : "text-xs font-medium text-gray-600"}>
                {t("replyTime")}
              </p>
            </div>
          </motion.div>

          {/* Form column */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className={
              isDark
                ? "space-y-4 rounded-3xl border border-white/15 bg-white/10 p-6 shadow-lg shadow-black/20 backdrop-blur-sm sm:p-7 lg:p-8"
                : "space-y-4 rounded-3xl border border-gray-100 bg-white/50 p-6 shadow-sm backdrop-blur-sm sm:p-7 lg:p-8"
            }
          >
            <h2 className={isDark ? "font-heading text-xl font-semibold text-white" : "font-heading text-xl font-semibold text-gray-900"}>
              {t("formTitle")}
            </h2>
            <p className={isDark ? "mb-2 text-sm text-white/70" : "mb-2 text-sm text-gray-600"}>{t("hint")}</p>

            <FormField
              id="contact-name"
              label={t("name")}
              placeholder={t("namePlaceholder")}
              value={name}
              onChange={setName}
              type="text"
              required
              isDark={isDark}
            />
            <FormField
              id="contact-email"
              label={t("email")}
              placeholder="you@example.com"
              value={email}
              onChange={setEmail}
              type="email"
              required
              isDark={isDark}
            />
            <FormField
              id="contact-subject"
              label={t("subject")}
              placeholder={t("subjectPlaceholder")}
              value={subject}
              onChange={setSubject}
              type="text"
              required={false}
              isDark={isDark}
            />
            <FormTextArea
              id="contact-message"
              label={t("message")}
              placeholder={t("messagePlaceholder")}
              value={message}
              onChange={setMessage}
              isDark={isDark}
            />
            {status === "success" && (
              <p className="text-sm font-medium text-green-500">
                {t("successMessage")}
              </p>
            )}
            {status === "error" && (
              <p className="text-sm font-medium text-red-500">
                {t("errorMessage")}
              </p>
            )}
            <button
              type="submit"
              disabled={status === "sending"}
              className="inline-flex w-full items-center justify-center rounded-xl bg-matcher px-5 py-3 text-sm font-semibold text-white shadow transition hover:bg-matcher-dark focus:outline-none focus:ring-2 focus:ring-matcher focus:ring-offset-2 focus:ring-offset-transparent disabled:cursor-not-allowed disabled:opacity-80 sm:w-auto sm:min-w-[180px]"
            >
              {status === "sending" ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  {t("sending")}
                </span>
              ) : (
                t("submit")
              )}
            </button>
          </motion.form>
        </div>
      </main>

      <Footer />
    </div>
  );
}

type FormFieldProps = {
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  type: string;
  required?: boolean;
  isDark: boolean;
};

function FormField({ id, label, placeholder, value, onChange, type, required = true, isDark }: FormFieldProps) {
  const baseInput =
    "w-full rounded-xl border px-4 py-4 text-sm shadow-sm outline-none transition focus-visible:ring-0 hover:border-matcher/70 focus:border-matcher";

  const colorInput = isDark
    ? "border-white/15 bg-black/40 text-white placeholder:text-white/40"
    : "border-gray-200 bg-white text-gray-900 placeholder:text-gray-400";

  return (
    <motion.div whileHover={{ y: -1 }} transition={{ type: "spring", stiffness: 260, damping: 22 }}>
      <label htmlFor={id} className={isDark ? "block text-sm font-medium text-white/85" : "block text-sm font-medium text-gray-800"}>
        {label}
      </label>
      <motion.input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        whileFocus={{ boxShadow: "0 0 0 1px rgba(162, 217, 78, 0.9), 0 0 0 6px rgba(162, 217, 78, 0.22)" }}
        className={`${baseInput} ${colorInput} mt-2`}
      />
    </motion.div>
  );
}

type FormTextAreaProps = {
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  isDark: boolean;
};

function FormTextArea({ id, label, placeholder, value, onChange, isDark }: FormTextAreaProps) {
  const base =
    "mt-2 w-full min-h-[120px] resize-y rounded-xl border px-4 py-4 text-sm shadow-sm outline-none transition focus-visible:ring-0 hover:border-matcher/70 focus:border-matcher";
  const color = isDark
    ? "border-white/15 bg-black/40 text-white placeholder:text-white/40"
    : "border-gray-200 bg-white text-gray-900 placeholder:text-gray-400";

  return (
    <motion.div whileHover={{ y: -1 }} transition={{ type: "spring", stiffness: 260, damping: 22 }}>
      <label htmlFor={id} className={isDark ? "block text-sm font-medium text-white/85" : "block text-sm font-medium text-gray-800"}>
        {label}
      </label>
      <motion.textarea
        id={id}
        required
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        whileFocus={{ boxShadow: "0 0 0 1px rgba(162, 217, 78, 0.9), 0 0 0 6px rgba(162, 217, 78, 0.22)" }}
        className={`${base} ${color}`}
      />
    </motion.div>
  );
}
