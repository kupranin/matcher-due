import { strict as assert } from "assert";
import {
  CandidateProfile,
  VacancyProfile,
  passesHardGate,
  calculateMatchResult,
  shouldShowToViewer,
  matchPosition,
} from "./matchCalculation";

function baseCandidate(overrides: Partial<CandidateProfile> = {}): CandidateProfile {
  return {
    locationCityId: "tbilisi",
    salaryMin: 1000,
    willingToRelocate: false,
    experienceMonths: 12,
    educationLevel: "High School",
    workTypes: ["Full-time"],
    skills: [],
    ...overrides,
  };
}

function baseVacancy(overrides: Partial<VacancyProfile> = {}): VacancyProfile {
  return {
    locationCityId: "tbilisi",
    isRemote: false,
    salaryMax: 1000,
    requiredExperienceMonths: 6,
    requiredEducationLevel: "High School",
    workType: "Full-time",
    skills: [],
    positionTitle: "Cashier",
    ...overrides,
  };
}

// 1) availableToWork=false => eligible=false, showToEmployer=false, showToCandidate=false
(function testAvailabilityGate() {
  const c: CandidateProfile = baseCandidate({
    availableToWork: false,
    primaryPosition: "Cashier",
  });
  const v: VacancyProfile = baseVacancy();
  const gate = passesHardGate(c, v);
  assert.equal(gate.reasons.availabilityPassed, false);

  const result = calculateMatchResult(c, v);
  assert.equal(result.eligible, false);
  assert.equal(result.matchPercent, 0);
  assert.equal(shouldShowToViewer(result, "employer"), false);
  assert.equal(shouldShowToViewer(result, "candidate"), false);
})();

// 2) position mismatch => eligible=false
(function testPositionMismatch() {
  const c: CandidateProfile = baseCandidate({
    availableToWork: true,
    primaryPosition: "Barista",
  });
  const v: VacancyProfile = baseVacancy({ positionTitle: "Cashier" });
  const gate = passesHardGate(c, v);
  assert.equal(gate.reasons.positionPassed, false);
  const result = calculateMatchResult(c, v);
  assert.equal(result.eligible, false);
})();

// 3) willingToRelocate=true and city mismatch => still passes geo
(function testRelocateOverridesCity() {
  const c: CandidateProfile = baseCandidate({
    locationCityId: "batumi",
    willingToRelocate: true,
    availableToWork: true,
    primaryPosition: "Cashier",
  });
  const v: VacancyProfile = baseVacancy({
    locationCityId: "tbilisi",
  });
  const gate = passesHardGate(c, v);
  assert.equal(gate.reasons.geographyPassed, true);
})();

// 4) finance at exact 80% boundary passes
(function testFinanceAtBoundary() {
  const c: CandidateProfile = baseCandidate({
    salaryMin: 1000,
    availableToWork: true,
    primaryPosition: "Cashier",
  });
  const v: VacancyProfile = baseVacancy({
    salaryMax: 800, // 80% of 1000
  });
  const gate = passesHardGate(c, v);
  assert.equal(gate.reasons.financePassed, true);
})();

// 5) employer visibility threshold
(function testEmployerVisibilityThreshold() {
  const baseResult = {
    eligible: true,
    gates: {
      availabilityPassed: true,
      positionPassed: true,
      geographyPassed: true,
      financePassed: true,
      availabilityReason: "",
      positionReason: "",
      geographyReason: "",
      financeReason: "",
    },
    scores: {},
    aggregation: { sumPoints: 0, sumWeights: 0, raw: 0, rounded: 0 },
  };

  const r59 = { ...baseResult, matchPercent: 59 };
  const r60 = { ...baseResult, matchPercent: 60 };
  // 59% => eligible true but showToEmployer=false
  assert.equal(shouldShowToViewer(r59, "employer"), false);
  // 60% => showToEmployer=true
  assert.equal(shouldShowToViewer(r60, "employer"), true);
})();

// 6) candidate visibility: 10% but eligible => showToCandidate=true (no 60% threshold for candidate)
(function testCandidateVisibilityLowScore() {
  const result: any = {
    eligible: true,
    matchPercent: 10,
    gates: {
      availabilityPassed: true,
      positionPassed: true,
      geographyPassed: true,
      financePassed: true,
      availabilityReason: "",
      positionReason: "",
      geographyReason: "",
      financeReason: "",
    },
    scores: {},
    aggregation: { sumPoints: 0, sumWeights: 0, raw: 0, rounded: 10 },
  };
  assert.equal(shouldShowToViewer(result, "candidate"), true);
})();

// 7) Finance: candidate.minSalary null/absent => do NOT apply finance gate (pass)
(function testFinanceGateCandidateNoMinSalary() {
  const c = baseCandidate({ availableToWork: true, primaryPosition: "Cashier" }) as CandidateProfile & { salaryMin?: number };
  delete (c as { salaryMin?: number }).salaryMin;
  const v = baseVacancy({ salaryMax: 500 });
  const gate = passesHardGate(c, v);
  assert.equal(gate.reasons.financePassed, true, "finance should pass when candidate has no min salary");
})();

// 8) Finance: vacancy.salaryMax null/absent => FAIL finance gate
(function testFinanceGateVacancyNoMaxSalary() {
  const c = baseCandidate({ availableToWork: true, primaryPosition: "Cashier", salaryMin: 1000 });
  const v = baseVacancy({ salaryMax: NaN } as unknown as VacancyProfile);
  const gate = passesHardGate(c, v);
  assert.equal(gate.reasons.financePassed, false, "finance should fail when vacancy has no max salary");
})();

// 9) Position: "Receptionist" matches "Senior Receptionist" (contains fallback)
(function testPositionContainsFallback() {
  const c = baseCandidate({ primaryPosition: "Receptionist", availableToWork: true });
  const v = baseVacancy({ positionTitle: "Senior Receptionist" });
  assert.equal(matchPosition(c, v), true);
  const v2 = baseVacancy({ positionTitle: "Receptionist" });
  assert.equal(matchPosition(c, v2), true);
})();

// 10) Candidate listing must not depend on match table — exercised by for-candidate API (no INNER JOIN on Match).
// Gate logic is symmetric: same passesHardGate used for candidate->vacancy; no 60% filter for candidate view.
console.log("matchCalculation tests passed");

