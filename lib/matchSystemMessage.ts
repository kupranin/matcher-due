/**
 * Single source of truth for the system message inserted when a match becomes mutual.
 * Used by POST /api/matches and backfill script so chat thread exists immediately.
 */
export const MATCH_SYSTEM_MESSAGE_TEXT = "You matched! Say hi 👋";
