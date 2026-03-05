/**
 * Tests for candidate like flow: no pitch step, like triggers match directly.
 * - Liking a vacancy must not require modal interaction (no PitchModal).
 * - Like is recorded via addCandidateLike + POST /api/matches with candidateLiked only (no candidatePitch).
 */

import { strict as assert } from "assert";
import * as matchStorage from "./matchStorage";

// 1) setCandidatePitch removed: like flow does not collect or store pitch
(function testNoPitchExport() {
  assert.equal(
    "setCandidatePitch" in matchStorage,
    false,
    "setCandidatePitch must not be exported; pitch step was removed"
  );
})();

// 2) addCandidateLike is the only way to record a candidate like (no pitch)
assert.equal(typeof matchStorage.addCandidateLike, "function", "addCandidateLike must exist for like flow");

console.log("matchStorage (like flow, no pitch) tests passed");
