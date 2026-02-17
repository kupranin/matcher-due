"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { loadEmployerProfile, saveEmployerProfile } from "@/lib/employerProfileStorage";

const INDUSTRIES = [
  "Hospitality", "Retail", "Food & beverage", "Logistics", "Office & admin",
  "Healthcare", "Security", "Cleaning", "Construction", "Other",
];
const EMPLOYEE_COUNTS = ["1–10", "11–50", "51–200", "201–500", "500+"];

export default function EmployerCabinetProfilePage() {
  const t = useTranslations("employerProfile");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [bio, setBio] = useState("");
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [employeeCount, setEmployeeCount] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [linkedIn, setLinkedIn] = useState("");
  const [address, setAddress] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = loadEmployerProfile();
    if (!stored) return;
    setCompanyName(stored.companyName ?? "");
    setBio(stored.bio ?? "");
    setIndustry(stored.industry ?? "");
    setLocation(stored.location ?? "");
    setWebsite(stored.website ?? "");
    setEmployeeCount(stored.employeeCount ?? "");
    setEmail(stored.email ?? "");
    setPhone(stored.phone ?? "");
    setLinkedIn(stored.linkedIn ?? "");
    setAddress(stored.address ?? "");
  }, []);

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setLogoUrl(URL.createObjectURL(file));
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-gray-900">{t("title")}</h1>
      <p className="mt-1 text-gray-600">{t("subtitle")}</p>

      <div className="mt-8 space-y-6">
        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">{t("companyLogo")}</h2>
          <p className="mt-1 text-sm text-gray-500">{t("logoHint")}</p>
          <div className="mt-4 flex items-center gap-6">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
              {logoUrl ? <img src={logoUrl} alt="Logo" className="h-full w-full object-contain" /> : <span className="text-4xl text-gray-400">🏢</span>}
            </div>
            <div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                {logoUrl ? t("changeLogo") : t("addLogo")}
              </button>
              {logoUrl && <button type="button" onClick={() => setLogoUrl(null)} className="ml-2 text-sm text-gray-500 hover:text-red-600">{t("remove")}</button>}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">{t("basicInfo")}</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-900">{t("companyName")}</label>
              <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder={t("companyNamePlaceholder")} className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-matcher/30" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900">{t("aboutCompany")}</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder={t("aboutPlaceholder")} rows={4} maxLength={500} className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-matcher/30" />
              <p className="mt-1 text-xs text-gray-500">{bio.length}/500</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900">{t("industry")}</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {INDUSTRIES.map((i) => (
                  <button key={i} type="button" onClick={() => setIndustry(i)} className={`rounded-full border px-3 py-1.5 text-xs ${industry === i ? "border-matcher bg-matcher-mint" : "border-gray-200 hover:bg-gray-50"}`}>{i}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900">{t("companySize")}</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {EMPLOYEE_COUNTS.map((c) => (
                  <button key={c} type="button" onClick={() => setEmployeeCount(c)} className={`rounded-full border px-3 py-1.5 text-xs ${employeeCount === c ? "border-matcher bg-matcher-mint" : "border-gray-200 hover:bg-gray-50"}`}>{c} {t("employees")}</button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">{t("location")}</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-900">{t("city")}</label>
              <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder={t("cityPlaceholder")} className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-matcher/30" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900">{t("addressOptional")}</label>
              <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder={t("addressPlaceholder")} className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-matcher/30" />
            </div>
          </div>
        </section>

        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">{t("links")}</h2>
          <p className="mt-1 text-sm text-gray-500">{t("linksHint")}</p>
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-900">{t("website")}</label>
              <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder={t("websitePlaceholder")} className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-matcher/30" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900">{t("linkedInOptional")}</label>
              <input type="url" value={linkedIn} onChange={(e) => setLinkedIn(e.target.value)} placeholder={t("linkedInPlaceholder")} className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-matcher/30" />
            </div>
          </div>
        </section>

        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">{t("contact")}</h2>
          <p className="mt-1 text-sm text-gray-500">{t("contactHint")}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-900">{t("email")}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("emailPlaceholder")} className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-matcher/30" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900">{t("phone")}</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t("phonePlaceholder")} className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-matcher/30" />
            </div>
          </div>
        </section>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={() => {
            saveEmployerProfile({
              companyName: companyName.trim(),
              bio: bio.trim(),
              industry,
              location: location.trim(),
              website: website.trim(),
              employeeCount,
              email: email.trim(),
              phone: phone.trim(),
              linkedIn: linkedIn.trim(),
              address: address.trim(),
            });
            const btn = document.activeElement as HTMLButtonElement;
            const orig = btn?.textContent;
            if (btn) btn.textContent = t("saved");
            setTimeout(() => { if (btn) btn.textContent = orig ?? t("saveProfile"); }, 1500);
          }}
          className="rounded-2xl bg-matcher px-6 py-3 text-sm font-semibold text-white hover:bg-matcher-dark"
        >
          {t("saveProfile")}
        </button>
      </div>
    </div>
  );
}
