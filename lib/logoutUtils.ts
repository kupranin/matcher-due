/**
 * Clear session/localStorage on logout.
 * Call before navigating to /login.
 */

export function clearEmployerSession(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem("employerLoggedIn");
  window.sessionStorage.removeItem("employerHasSubscription");
  window.sessionStorage.removeItem("matcher_employer_company_id");
  window.sessionStorage.removeItem("matcher_employer_user_id");
}

/** Employer logout: clear employer session, then caller should navigate to /login */
export function performEmployerLogout(): void {
  clearEmployerSession();
}

/** Candidate logout: clears profile + candidate likes. Caller should navigate to /login. */
export function performCandidateLogout(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("matcher_candidate_profile");
  window.localStorage.removeItem("matcher_candidate_likes");
  window.localStorage.removeItem("matcher_candidate_user_id");
  window.localStorage.removeItem("matcher_candidate_profile_id");
  // Note: matcher_mutual_matches and matcher_chat_* are shared; clearing would affect employer. Skip.
}
