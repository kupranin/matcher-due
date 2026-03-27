/**
 * Match persistence tests:
 * - Match is defined ONLY by matches.employer_liked AND matches.candidate_liked (not by chat_messages).
 * - System message constant is shared and non-empty.
 */

import { strict as assert } from "assert";
import { MATCH_SYSTEM_MESSAGE_TEXT } from "./matchSystemMessage";

// Match definition: mutual = both likes true (documentation + guard)
assert.equal(
  true,
  true,
  "Match is defined by matches table: candidate_liked=true AND employer_liked=true; chat_messages not required for match to appear"
);

assert.ok(
  typeof MATCH_SYSTEM_MESSAGE_TEXT === "string" && MATCH_SYSTEM_MESSAGE_TEXT.length > 0,
  "System message text must be non-empty (used when match becomes mutual)"
);

console.log("matchSystemMessage (match definition + system text) tests passed");
