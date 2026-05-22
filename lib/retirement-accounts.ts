/**
 * Retirement account projection utilities.
 * Pure math — no side effects.
 */

export type AccountProjection = {
  /** Total value at retirement */
  projectedValue: number;
  /** Total employee + employer contributions over period */
  totalContributions: number;
  /** Growth from compound returns */
  totalGrowth: number;
};

/**
 * Project a tax-advantaged account (401k/IRA) to a future date.
 * @param currentBalance  Current account balance in USD
 * @param annualContribution  Employee annual contribution
 * @param employerMatchRate  Employer match as a fraction of salary (e.g. 0.04 = 4%)
 * @param annualSalary  Annual salary for employer match calculation
 * @param yearsToRetirement  Years until retirement
 * @param annualReturnRate  Expected annual return rate (e.g. 0.07)
 */
export function projectAccount(
  currentBalance: number,
  annualContribution: number,
  employerMatchRate: number,
  annualSalary: number,
  yearsToRetirement: number,
  annualReturnRate: number
): AccountProjection {
  if (yearsToRetirement <= 0) {
    return { projectedValue: currentBalance, totalContributions: 0, totalGrowth: 0 };
  }

  const employerMatch = Math.min(annualContribution, annualSalary * employerMatchRate);
  const totalAnnualContribution = annualContribution + employerMatch;

  let balance = currentBalance;
  let totalContributions = 0;

  for (let year = 0; year < yearsToRetirement; year++) {
    balance = balance * (1 + annualReturnRate) + totalAnnualContribution;
    totalContributions += totalAnnualContribution;
  }

  return {
    projectedValue: Math.round(balance),
    totalContributions: Math.round(totalContributions),
    totalGrowth: Math.round(balance - currentBalance - totalContributions),
  };
}

/**
 * Estimate ACA marketplace premium for early retirees (pre-Medicare).
 * Rough age-indexed approximation — actual premiums vary by state and plan.
 * Based on 2025 benchmark Silver plan premiums for a non-smoker.
 */
export function estimateACAMonthlyPremium(age: number): number {
  // Rough approximation: $350/mo base at 40, scaling up ~$20/yr of age
  if (age < 30) return 280;
  if (age < 40) return 320;
  if (age < 50) return 420;
  if (age < 55) return 560;
  if (age < 60) return 720;
  if (age < 65) return 900;
  return 0; // Medicare at 65
}

export type HealthcareBridge = {
  yearsToMedicare: number;
  estimatedMonthlyPremium: number;
  totalBridgeCost: number;
};

/**
 * Calculate the healthcare cost bridge between early retirement and Medicare.
 * @param retirementAge  Planned retirement age
 * @param currentAge  Current age (for premium estimation)
 */
export function calcHealthcareBridge(retirementAge: number, currentAge: number): HealthcareBridge {
  if (retirementAge >= 65) {
    return { yearsToMedicare: 0, estimatedMonthlyPremium: 0, totalBridgeCost: 0 };
  }

  const yearsToMedicare = 65 - retirementAge;
  const avgAge = (retirementAge + 65) / 2;
  const estimatedMonthlyPremium = estimateACAMonthlyPremium(avgAge);
  const totalBridgeCost = Math.round(estimatedMonthlyPremium * 12 * yearsToMedicare);

  return { yearsToMedicare, estimatedMonthlyPremium, totalBridgeCost };
}
