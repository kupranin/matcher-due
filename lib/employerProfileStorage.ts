/**
 * Employer/company profile storage (localStorage MVP).
 * Used by employer cabinet profile page.
 */

const EMPLOYER_PROFILE_KEY = "matcher_employer_profile";

export interface StoredEmployerProfile {
  companyName: string;
  bio: string;
  industry: string;
  location: string;
  website: string;
  employeeCount: string;
  email: string;
  phone: string;
  linkedIn: string;
  address: string;
}

export function saveEmployerProfile(profile: StoredEmployerProfile): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(EMPLOYER_PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.warn("Failed to save employer profile", e);
  }
}

export function loadEmployerProfile(): StoredEmployerProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(EMPLOYER_PROFILE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredEmployerProfile;
    if (parsed && typeof parsed === "object") return parsed;
    return null;
  } catch (e) {
    console.warn("Failed to load employer profile", e);
    return null;
  }
}
