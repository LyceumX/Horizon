export type PlannerInput = {
  age: number;
  city: string;
  maritalStatus: string;
  currentSavings: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyTargetSpendAtRetirement: number;
  annualReturnRate: number;
  annualInflationRate: number;
  multiplier: number;
  pensionIncome?: number;
};

export type PlannerResult = {
  horizonDay1: string;
  requiredNestEgg: number;
  yearsToGoal: number;
  monthlySurplus: number;
  monthlyGapToSave: number;
  assumptions: {
    annualReturnRate: number;
    annualInflationRate: number;
    multiplier: number;
  };
};

export type ScenarioPreset = {
  label: string;
  labelZh: string;
  annualReturnRate: number;
  annualInflationRate: number;
  multiplier: number;
};

export const SCENARIO_PRESETS: Record<"base" | "optimistic" | "stress", ScenarioPreset> = {
  base: {
    label: "Base",
    labelZh: "基准",
    annualReturnRate: 0.06,
    annualInflationRate: 0.02,
    multiplier: 25
  },
  optimistic: {
    label: "Optimistic",
    labelZh: "乐观",
    annualReturnRate: 0.08,
    annualInflationRate: 0.015,
    multiplier: 25
  },
  stress: {
    label: "Stress",
    labelZh: "压力",
    annualReturnRate: 0.04,
    annualInflationRate: 0.03,
    multiplier: 30
  }
};

export function calculateHorizonDay1(input: PlannerInput): PlannerResult {
  const now = new Date();
  const monthlySurplus = input.monthlyIncome - input.monthlyExpenses;
  const annualTargetSpend = input.monthlyTargetSpendAtRetirement * 12;
  const annualPensionIncome = (input.pensionIncome ?? 0) * 12;
  const netAnnualTargetSpend = Math.max(0, annualTargetSpend - annualPensionIncome);

  let target = netAnnualTargetSpend * input.multiplier;
  let portfolio = input.currentSavings;

  const monthlyReturn = Math.pow(1 + input.annualReturnRate, 1 / 12) - 1;
  const monthlyInflation = Math.pow(1 + input.annualInflationRate, 1 / 12) - 1;

  let months = 0;
  const maxMonths = 80 * 12;

  while (portfolio < target && months < maxMonths) {
    portfolio = portfolio * (1 + monthlyReturn);
    if (monthlySurplus > 0) {
      portfolio += monthlySurplus;
    }
    target = target * (1 + monthlyInflation);
    months += 1;
  }

  const yearsToGoal = Number((months / 12).toFixed(1));
  const horizonDate = new Date(now);
  horizonDate.setMonth(horizonDate.getMonth() + months);

  const requiredContribution =
    target > portfolio && months >= maxMonths
      ? Math.max(0, (target - portfolio) / maxMonths)
      : 0;

  return {
    horizonDay1: horizonDate.toISOString().slice(0, 10),
    requiredNestEgg: Math.round(target),
    yearsToGoal,
    monthlySurplus,
    monthlyGapToSave: Math.round(requiredContribution),
    assumptions: {
      annualReturnRate: input.annualReturnRate,
      annualInflationRate: input.annualInflationRate,
      multiplier: input.multiplier
    }
  };
}
