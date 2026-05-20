export type MonteCarloInput = {
  monthlySavings: number;
  monthlySpend: number;
  currentSavings?: number;
  meanAnnualReturn: number;
  stdDevAnnualReturn: number;
  simulations?: number;
  maxYears?: number;
};

export type MonteCarloResult = {
  successRate: number;
  p10Years: number;
  p25Years: number;
  p50Years: number;
  p75Years: number;
  p90Years: number;
  targetCapital: number;
};

export const CN_DEFAULTS = {
  meanAnnualReturn: 0.06,
  stdDevAnnualReturn: 0.12
};

export const GLOBAL_DEFAULTS = {
  meanAnnualReturn: 0.07,
  stdDevAnnualReturn: 0.15
};

function sampleNormal(mean: number, std: number): number {
  const u1 = Math.random() || Number.EPSILON;
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + std * z;
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) {
    return Number.POSITIVE_INFINITY;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.floor(p * (sorted.length - 1));
  return sorted[index];
}

export function runMonteCarlo(input: MonteCarloInput): MonteCarloResult {
  const simulations = input.simulations ?? 1000;
  const maxYears = input.maxYears ?? 50;
  const currentSavings = input.currentSavings ?? 0;
  const targetCapital = input.monthlySpend * 12 * 25;
  const maxMonths = Math.max(0, Math.floor(maxYears * 12));

  const results: number[] = [];
  let successes = 0;

  for (let i = 0; i < simulations; i += 1) {
    let balance = currentSavings;
    let months = 0;

    while (balance < targetCapital && months < maxMonths) {
      const annualReturn = sampleNormal(input.meanAnnualReturn, input.stdDevAnnualReturn);
      const monthlyReturn = annualReturn / 12;
      balance = balance * (1 + monthlyReturn) + input.monthlySavings;
      months += 1;
    }

    if (balance >= targetCapital) {
      successes += 1;
      results.push(months / 12);
    } else {
      results.push(Number.POSITIVE_INFINITY);
    }
  }

  return {
    successRate: simulations === 0 ? 0 : successes / simulations,
    p10Years: percentile(results, 0.1),
    p25Years: percentile(results, 0.25),
    p50Years: percentile(results, 0.5),
    p75Years: percentile(results, 0.75),
    p90Years: percentile(results, 0.9),
    targetCapital
  };
}
