import test from "node:test";
import assert from "node:assert/strict";
import { runMonteCarlo } from "../lib/monte-carlo";

function deterministicYears({
  monthlySavings,
  monthlySpend,
  currentSavings,
  meanAnnualReturn,
  maxYears
}: {
  monthlySavings: number;
  monthlySpend: number;
  currentSavings: number;
  meanAnnualReturn: number;
  maxYears: number;
}) {
  const target = monthlySpend * 12 * 25;
  let balance = currentSavings;
  let months = 0;
  const maxMonths = maxYears * 12;

  while (balance < target && months < maxMonths) {
    const monthlyReturn = meanAnnualReturn / 12;
    balance = balance * (1 + monthlyReturn) + monthlySavings;
    months += 1;
  }

  return balance >= target ? months / 12 : Number.POSITIVE_INFINITY;
}

function withSeededRandom<T>(seed: number, fn: () => T): T {
  const originalRandom = Math.random;
  let state = seed >>> 0;
  Math.random = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 2 ** 32;
  };

  try {
    return fn();
  } finally {
    Math.random = originalRandom;
  }
}

test("deterministic std=0 matches deterministic projection", () => {
  const input = {
    monthlySavings: 2000,
    monthlySpend: 3000,
    currentSavings: 10000,
    meanAnnualReturn: 0.06,
    stdDevAnnualReturn: 0,
    simulations: 50,
    maxYears: 50
  };

  const expected = deterministicYears({
    monthlySavings: input.monthlySavings,
    monthlySpend: input.monthlySpend,
    currentSavings: input.currentSavings,
    meanAnnualReturn: input.meanAnnualReturn,
    maxYears: input.maxYears
  });

  const result = runMonteCarlo(input);
  assert.equal(result.successRate, 1);
  assert.equal(result.p50Years, expected);
});

test("successRate is 1 when target is easy to reach", () => {
  const result = runMonteCarlo({
    monthlySavings: 8000,
    monthlySpend: 2000,
    currentSavings: 50000,
    meanAnnualReturn: 0.08,
    stdDevAnnualReturn: 0,
    simulations: 20,
    maxYears: 20
  });

  assert.equal(result.successRate, 1);
});

test("successRate is 0 when maxYears is 0", () => {
  const result = runMonteCarlo({
    monthlySavings: 1000,
    monthlySpend: 3000,
    currentSavings: 0,
    meanAnnualReturn: 0.05,
    stdDevAnnualReturn: 0.1,
    simulations: 10,
    maxYears: 0
  });

  assert.equal(result.successRate, 0);
  assert.equal(result.p50Years, Number.POSITIVE_INFINITY);
});

test("percentiles are ordered with stochastic returns", () => {
  const result = withSeededRandom(42, () =>
    runMonteCarlo({
      monthlySavings: 2000,
      monthlySpend: 4000,
      currentSavings: 20000,
      meanAnnualReturn: 0.06,
      stdDevAnnualReturn: 0.15,
      simulations: 200,
      maxYears: 50
    })
  );

  assert.ok(result.p10Years < result.p50Years);
  assert.ok(result.p50Years < result.p90Years);
});

test("p50 is close to deterministic when variance is small", () => {
  const result = withSeededRandom(7, () =>
    runMonteCarlo({
      monthlySavings: 2500,
      monthlySpend: 3500,
      currentSavings: 15000,
      meanAnnualReturn: 0.05,
      stdDevAnnualReturn: 0.001,
      simulations: 300,
      maxYears: 50
    })
  );

  const expected = deterministicYears({
    monthlySavings: 2500,
    monthlySpend: 3500,
    currentSavings: 15000,
    meanAnnualReturn: 0.05,
    maxYears: 50
  });

  assert.ok(Math.abs(result.p50Years - expected) < 0.5);
  assert.equal(result.targetCapital, 3500 * 12 * 25);
});
