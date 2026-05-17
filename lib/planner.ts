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

export function calculateHorizonDay1(input: PlannerInput): PlannerResult {
  const now = new Date();
  const monthlySurplus = input.monthlyIncome - input.monthlyExpenses;
  const annualTargetSpend = input.monthlyTargetSpendAtRetirement * 12;

  // Inflate retirement target in projection loop to keep a conservative real-value target.
  let target = annualTargetSpend * input.multiplier;
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

  const requiredContribution = target > portfolio && months >= maxMonths
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
