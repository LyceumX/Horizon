/**
 * SSA Social Security benefit estimator (US only).
 * Uses 2026 AIME bend points and PIA formula.
 * Simplified: assumes steady career earnings at the provided annual salary.
 */

/** 2026 bend points (monthly) */
const BEND_1 = 1226;
const BEND_2 = 7391;

/**
 * Estimate Average Indexed Monthly Earnings from salary + years worked.
 * Simplified: assumes all years at the same real (inflation-adjusted) salary.
 * SSA credits at most 35 years; extra years don't help.
 */
export function estimateAIME(annualSalary: number, yearsWorked: number): number {
  const creditedYears = Math.min(35, Math.max(0, yearsWorked));
  const totalEarnings = annualSalary * creditedYears;
  return totalEarnings / (35 * 12);
}

/**
 * Primary Insurance Amount (PIA) from AIME.
 * 90% of AIME up to first bend point,
 * 32% of AIME between bend points,
 * 15% of AIME above second bend point.
 */
export function calcPIA(aime: number): number {
  let pia = 0;
  if (aime <= BEND_1) {
    pia = aime * 0.9;
  } else if (aime <= BEND_2) {
    pia = BEND_1 * 0.9 + (aime - BEND_1) * 0.32;
  } else {
    pia = BEND_1 * 0.9 + (BEND_2 - BEND_1) * 0.32 + (aime - BEND_2) * 0.15;
  }
  return Math.round(pia);
}

/**
 * Monthly benefit at different claim ages.
 * FRA = 67 for birth year 1960+.
 * Claiming at 62: -30% reduction.
 * Claiming at 70: +24% delayed credit.
 */
export type SSBenefitEstimate = {
  at62: number;
  atFRA: number;  // age 67
  at70: number;
};

export function estimateSSBenefit(annualSalary: number, yearsWorked: number): SSBenefitEstimate {
  const aime = estimateAIME(annualSalary, yearsWorked);
  const pia = calcPIA(aime);
  return {
    at62: Math.round(pia * 0.70),
    atFRA: pia,
    at70: Math.round(pia * 1.24),
  };
}
