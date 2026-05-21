import test from "node:test";
import assert from "node:assert/strict";
import { calculateHorizonDay1, SCENARIO_PRESETS } from "../lib/planner";

test("calculateHorizonDay1 returns expected shape and positive timeline", () => {
  const result = calculateHorizonDay1({
    age: 29,
    city: "Shenzhen",
    maritalStatus: "Single",
    currentSavings: 150000,
    monthlyIncome: 22000,
    monthlyExpenses: 12000,
    monthlyTargetSpendAtRetirement: 14000,
    annualReturnRate: 0.06,
    annualInflationRate: 0.02,
    multiplier: 25
  });

  assert.ok(result.horizonDay1.length === 10);
  assert.ok(result.yearsToGoal >= 0);
  assert.ok(result.requiredNestEgg > 0);
});

test("SCENARIO_PRESETS has base, optimistic, and stress keys with correct ordering", () => {
  assert.ok("base" in SCENARIO_PRESETS);
  assert.ok("optimistic" in SCENARIO_PRESETS);
  assert.ok("stress" in SCENARIO_PRESETS);
  assert.ok(SCENARIO_PRESETS.stress.annualReturnRate < SCENARIO_PRESETS.base.annualReturnRate);
  assert.ok(SCENARIO_PRESETS.optimistic.annualReturnRate > SCENARIO_PRESETS.base.annualReturnRate);
});

test("pensionIncome reduces yearsToGoal", () => {
  const base = calculateHorizonDay1({
    age: 30, city: "Shanghai", maritalStatus: "single",
    currentSavings: 100000, monthlyIncome: 20000, monthlyExpenses: 12000,
    monthlyTargetSpendAtRetirement: 15000,
    annualReturnRate: 0.06, annualInflationRate: 0.02, multiplier: 25
  });
  const withPension = calculateHorizonDay1({
    age: 30, city: "Shanghai", maritalStatus: "single",
    currentSavings: 100000, monthlyIncome: 20000, monthlyExpenses: 12000,
    monthlyTargetSpendAtRetirement: 15000,
    annualReturnRate: 0.06, annualInflationRate: 0.02, multiplier: 25,
    pensionIncome: 3000
  });
  assert.ok(
    withPension.yearsToGoal < base.yearsToGoal,
    `expected pension to shorten timeline: base=${base.yearsToGoal} pension=${withPension.yearsToGoal}`
  );
});
