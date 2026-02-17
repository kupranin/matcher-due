/**
 * Clear session/localStorage on logout.
 * Call before navigating to /login.
 */

export function clearEmployerSession(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem("employerLoggedIn");
  window.sessionStorage.removeItem("employerHasSubscription");
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
  // Note: matcher_mutual_matches and matcher_chat_* are shared; clearing would affect employer. Skip.
}
