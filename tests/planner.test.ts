import test from "node:test";
import assert from "node:assert/strict";
import { calculateHorizonDay1 } from "../lib/planner";

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
