/**
 * Government pension estimators for SG, HK, and AU.
 *
 * Each function returns an estimated monthly pension income in the country's
 * local currency. All formulas are based on 2024/25 published contribution
 * rates and official payout approximations.
 *
 * "yearsToRetire" is always calculated as (statutory pension age - current age),
 * computed independently of the user's planned early-retirement date so the
 * pension estimate reflects what the government will actually pay.
 */

// ── Singapore: CPF Life (Standard Plan) ──────────────────────────────────────
//
// Rules (2024):
// - Ordinary Wage Ceiling: SGD 6,800/month
// - SA contribution rate: simplified to 14% of capped monthly wage (age ≤ 55 band average)
// - SA earns 4% p.a. guaranteed
// - CPF Life Standard Plan payout ≈ 0.75% of Retirement Account balance per month
// - Payout starts at age 65
//
// Ref: cpf.gov.sg/member/growing-your-savings/cpf-interest-rates
//      cpf.gov.sg/member/retirement-income/cpf-life

export function estimateCPFLife(
  monthlyGross: number,    // SGD — user's monthly income
  yearsWorked: number,     // career years already contributed (0–40)
  yearsToRetire: number,   // years until age 65
): number {
  const OWC          = 6_800;   // Ordinary Wage Ceiling
  const SA_RATE      = 0.14;    // Special Account allocation (simplified)
  const SA_RETURN    = 0.04;    // 4% p.a. guaranteed interest
  const PAYOUT_RATE  = 0.0075;  // CPF Life Standard Plan: ~0.75%/month of RA

  const cappedSalary   = Math.min(monthlyGross, OWC);
  const yearlyContrib  = cappedSalary * SA_RATE * 12;

  // Existing SA: contributions made over past career, grown to today.
  // Approximation: treat as a lump sum at mid-career (yearsWorked / 2 average growth).
  const existingRA = yearlyContrib * yearsWorked * Math.pow(1 + SA_RETURN, yearsWorked / 2);

  // Future SA: FV of an annuity at SA_RETURN over remaining working years.
  const futureRA =
    yearsToRetire > 0
      ? yearlyContrib * ((Math.pow(1 + SA_RETURN, yearsToRetire) - 1) / SA_RETURN)
      : 0;

  const totalRA = existingRA * Math.pow(1 + SA_RETURN, yearsToRetire) + futureRA;
  return Math.round(totalRA * PAYOUT_RATE);
}

// ── Hong Kong: Mandatory Provident Fund (MPF) ────────────────────────────────
//
// Rules (2024):
// - Relevant income range: HKD 7,100 – 30,000/month
// - Employee contribution: 5% of relevant income (max HKD 1,500/mo)
// - Employer contribution: 5% of relevant income (max HKD 1,500/mo)
// - Total: 10% per month
// - Default investment return: 5% p.a. (conservative MPF balanced fund)
// - At 65: lump-sum payout; displayed as 20-year monthly drawdown (240 months)
//
// Ref: mpfa.org.hk/en/mpf-system/employees-and-self-employed/mpf-contributions

export function estimateMPF(
  monthlyGross: number,    // HKD — user's monthly income
  yearsWorked: number,     // career years already contributed
  yearsToRetire: number,   // years until age 65
): number {
  const MIN_RI        = 7_100;   // Minimum Relevant Income
  const MAX_RI        = 30_000;  // Maximum Relevant Income
  const TOTAL_RATE    = 0.10;    // 5% employee + 5% employer
  const ANNUAL_RETURN = 0.05;    // conservative MPF balanced fund
  const DRAWDOWN_MO   = 240;     // 20-year drawdown assumption

  const effectiveSalary = Math.min(Math.max(monthlyGross, MIN_RI), MAX_RI);
  const yearlyContrib   = effectiveSalary * TOTAL_RATE * 12;

  const existingMPF = yearlyContrib * yearsWorked * Math.pow(1 + ANNUAL_RETURN, yearsWorked / 2);
  const futureMPF   =
    yearsToRetire > 0
      ? yearlyContrib * ((Math.pow(1 + ANNUAL_RETURN, yearsToRetire) - 1) / ANNUAL_RETURN)
      : 0;

  const totalMPF = existingMPF * Math.pow(1 + ANNUAL_RETURN, yearsToRetire) + futureMPF;
  return Math.round(totalMPF / DRAWDOWN_MO);
}

// ── Australia: Superannuation (employer Super Guarantee) ─────────────────────
//
// Rules (2024-25):
// - Super Guarantee rate: 11.5% of ordinary time earnings
// - No income cap for SG contributions (contributions tax applies above $250k, ignored here)
// - Investment return: 7% p.a. (long-run balanced fund assumption, APRA median)
// - Preservation age: 60; Age Pension: 67 — we use 65 as the mid-point benchmark
// - Monthly drawdown: 4% SWR (consistent with the rest of the Horizon planner)
//
// Ref: ato.gov.au/individuals-and-families/super-for-individuals-and-families
//      apra.gov.au/superannuation-statistics

export function estimateSuper(
  annualGross: number,     // AUD — user's annual income (monthlyIncome × 12)
  yearsWorked: number,     // career years already contributed
  yearsToRetire: number,   // years until age 65
): number {
  const SG_RATE       = 0.115;  // 11.5% Super Guarantee FY2024-25
  const ANNUAL_RETURN = 0.07;   // balanced fund long-run return
  const SWR           = 0.04;   // 4% safe withdrawal rate

  const yearlyContrib = annualGross * SG_RATE;

  const existingSuper = yearlyContrib * yearsWorked * Math.pow(1 + ANNUAL_RETURN, yearsWorked / 2);
  const futureSuper   =
    yearsToRetire > 0
      ? yearlyContrib * ((Math.pow(1 + ANNUAL_RETURN, yearsToRetire) - 1) / ANNUAL_RETURN)
      : 0;

  const totalSuper = existingSuper * Math.pow(1 + ANNUAL_RETURN, yearsToRetire) + futureSuper;
  return Math.round((totalSuper * SWR) / 12);
}
