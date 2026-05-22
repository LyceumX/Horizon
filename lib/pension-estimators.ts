/**
 * Government pension estimators for SG, HK, and AU.
 *
 * Each function returns an estimated monthly pension income in the country's
 * local currency. All formulas are based on published contribution rates and
 * official payout tables / approximations.
 *
 * "yearsToRetire" is always calculated as (statutory pension age - current age),
 * computed independently of the user's planned early-retirement date so the
 * pension estimate reflects what the government will actually pay.
 */

// ── Singapore: CPF Life — Full Algorithm (2026) ──────────────────────────────
//
// Full year-by-year simulation: contributions → account accumulation → CPF LIFE
// payout lookup. Implements 2026 rates, age-banded allocation ratios, tiered
// interest, and official payout reference table.
//
// Model:
//  1. Simulate OA/SA/MA from career start to age 55 using age-banded rates.
//  2. At 55: SA → RA (capped at cohort FRS). Record ra55.
//  3. Continue OA/RA/MA simulation 55→65.
//  4. Piecewise-linear interpolation on CPF Board's official payout table (key = ra55).
//  5. Apply plan modifier and gender factor.
//
// Honest boundary: CPF Board does not publish the internal actuarial formula for
// CPF LIFE; the payout table is the official reference. This function is therefore
// an estimate based on the published lookup — as are all third-party CPF tools.
//
// Refs:
//   cpf.gov.sg/employer/making-cpf-contributions/contribution-rates
//   data.gov.sg dataset d_98ffa142ae0dec40391f78f81d26aca9 (contribution rates)
//   data.gov.sg dataset d_97ec9a2ce15cbf253128e48779a3fba0 (allocation ratios)
//   cpf.gov.sg/member/retirement-income/cpf-life (payout estimates table)

// ---- 2026 rate tables -------------------------------------------------------

// Total contribution rate (employer + employee) by age band, SC/PR ≥3yr, salary >$750
const _CPF_CONTRIB: Array<{ lo: number; hi: number; total: number }> = [
  { lo:  0, hi: 55,  total: 0.370 },
  { lo: 55, hi: 60,  total: 0.340 },
  { lo: 60, hi: 65,  total: 0.250 },
  { lo: 65, hi: 70,  total: 0.165 },
  { lo: 70, hi: 999, total: 0.125 },
];

// Allocation ratios for age <55 (SA active). OA = remainder.
const _CPF_ALLOC_SA: Array<{ lo: number; hi: number; sa: number; ma: number }> = [
  { lo:  0, hi: 35, sa: 0.1621, ma: 0.2162 },
  { lo: 35, hi: 45, sa: 0.1891, ma: 0.2432 },
  { lo: 45, hi: 50, sa: 0.2162, ma: 0.2702 },
  { lo: 50, hi: 55, sa: 0.3108, ma: 0.2837 },
];

// Allocation ratios for age ≥55 (RA replaces SA). OA = remainder.
const _CPF_ALLOC_RA: Array<{ lo: number; hi: number; ra: number; ma: number }> = [
  { lo: 55, hi: 60,  ra: 0.3382, ma: 0.3088 },
  { lo: 60, hi: 65,  ra: 0.4400, ma: 0.4200 },
  { lo: 65, hi: 70,  ra: 0.3030, ma: 0.6363 },
  { lo: 70, hi: 999, ra: 0.0800, ma: 0.8400 },
];

// Official CPF LIFE payout lookup — Standard Plan, male, start age 65.
// Key: RA balance at age 55 (before 55→65 growth). Source: cpf.gov.sg payout estimator.
const _CPF_LIFE_TBL: Array<{ ra55: number; payout: number }> = [
  { ra55:       0, payout:     0 },
  { ra55:  50_000, payout:   490 },
  { ra55: 110_200, payout:   950 },  // BRS 2026
  { ra55: 220_400, payout: 1_780 },  // FRS 2026
  { ra55: 440_800, payout: 3_440 },  // ERS 2026
];

const _CPF_OW_CAP   = 8_000;    // Ordinary Wage ceiling/month (2026)
const _CPF_ANN_LIM  = 37_740;   // Max total CPF contribution/year
const _CPF_FRS_2026 = 220_400;  // Full Retirement Sum, cohort turning 55 in 2026
const _CPF_FRS_GR   = 0.03;     // ~3%/yr FRS growth (inflation + wage-level adjustments)

// ---- helpers ----------------------------------------------------------------

function _cpfRate(age: number): number {
  return _CPF_CONTRIB.find(b => age >= b.lo && age < b.hi)?.total ?? 0.125;
}
function _cpfSA(age: number): { sa: number; ma: number } {
  return _CPF_ALLOC_SA.find(b => age >= b.lo && age < b.hi) ?? { sa: 0.3108, ma: 0.2837 };
}
function _cpfRA(age: number): { ra: number; ma: number } {
  return _CPF_ALLOC_RA.find(b => age >= b.lo && age < b.hi) ?? { ra: 0.08, ma: 0.84 };
}

// Annual interest with CPF's tiered extra-1% bonuses.
//  • OA: 2.5% base + extra 1% on first $20K of OA
//  • SA/MA: 4% base + extra 1% on their share of first $60K combined (after OA's $20K)
//  • RA 55+: 4% base + same $60K extra + additional 1% on first $30K combined
function _cpfInterest(
  oa: number, sa: number, ma: number, ra: number, age: number,
): { oa: number; sa: number; ma: number; ra: number } {
  const oaCap     = Math.min(oa, 20_000);          // OA's slice of extra-1% bucket
  const saMaRa    = sa + ma + ra;
  const saMaRaCap = Math.min(saMaRa, 60_000 - oaCap); // remaining of $60K for SA/MA/RA

  const saX = saMaRa > 0 ? saMaRaCap * (sa / saMaRa) * 0.01 : 0;
  const maX = saMaRa > 0 ? saMaRaCap * (ma / saMaRa) * 0.01 : 0;
  const raX = saMaRa > 0 ? saMaRaCap * (ra / saMaRa) * 0.01 : 0;

  // Post-55 extra: additional 1% on first $30K (RA priority)
  const raX2 = age >= 55 ? Math.min(ra, Math.max(0, 30_000 - oaCap)) * 0.01 : 0;

  return {
    oa: oa * 1.025 + oaCap * 0.01,
    sa: sa * 1.04  + saX,
    ma: ma * 1.04  + maX,
    ra: ra * 1.04  + raX + raX2,
  };
}

// Piecewise-linear interpolation on the CPF LIFE payout table.
function _cpfPayout(ra55: number): number {
  const tbl = _CPF_LIFE_TBL;
  if (ra55 <= 0) return 0;
  const last = tbl[tbl.length - 1];
  if (ra55 >= last.ra55) {
    const prev = tbl[tbl.length - 2];
    const slope = (last.payout - prev.payout) / (last.ra55 - prev.ra55);
    return Math.round(last.payout + slope * (ra55 - last.ra55));
  }
  for (let i = 1; i < tbl.length; i++) {
    if (ra55 <= tbl[i].ra55) {
      const t = (ra55 - tbl[i - 1].ra55) / (tbl[i].ra55 - tbl[i - 1].ra55);
      return Math.round(tbl[i - 1].payout + t * (tbl[i].payout - tbl[i - 1].payout));
    }
  }
  return 0;
}

// ---- main export ------------------------------------------------------------

export function estimateCPFLife(
  monthlyGross: number,      // SGD — monthly ordinary wage
  yearsWorked: number,       // career years already contributed (0–43)
  _yearsToRetire: number,    // kept for call-site compatibility; not used
  currentAge: number = 35,   // current age — needed for accurate age-band simulation
  gender: "M" | "F" = "M",  // affects payout (female life expectancy ≈ −3%)
  plan: "standard" | "escalating" | "basic" = "standard",
): number {
  const cappedWage  = Math.min(monthlyGross, _CPF_OW_CAP);
  const careerStart = Math.max(22, Math.round(currentAge - yearsWorked));

  // Cohort FRS: project FRS forward to the year this user turns 55
  const yearsTo55 = Math.max(0, 55 - currentAge);
  const cohortFRS = _CPF_FRS_2026 * Math.pow(1 + _CPF_FRS_GR, yearsTo55);

  let oa = 0, sa = 0, ma = 0, ra = 0;
  let ra55 = 0;
  let at55 = false;

  for (let a = careerStart; a < 65; a++) {
    const annualCPF = Math.min(_cpfRate(a) * cappedWage * 12, _CPF_ANN_LIM);

    if (a < 55) {
      // Pre-55: OA / SA / MA
      const alloc = _cpfSA(a);
      const maCr  = Math.round(alloc.ma * annualCPF);
      const saCr  = Math.round(alloc.sa * annualCPF);
      oa += annualCPF - maCr - saCr;
      sa += saCr;
      ma += maCr;
    } else {
      // At 55: SA → RA (one-time, capped at cohort FRS)
      if (!at55) {
        ra    = Math.min(sa, cohortFRS);
        ra55  = ra;   // ← payout table key
        sa    = 0;
        at55  = true;
      }
      // Post-55: OA / RA / MA; RA fills to FRS then overflow → OA
      const alloc   = _cpfRA(a);
      const maCr    = Math.round(alloc.ma * annualCPF);
      const raCr    = Math.round(alloc.ra * annualCPF);
      const oaCr    = annualCPF - maCr - raCr;
      const raSpace = Math.max(0, cohortFRS - ra);
      const raActual = Math.min(raCr, raSpace);
      oa += oaCr + (raCr - raActual);
      ra += raActual;
      ma += maCr;
    }

    ({ oa, sa, ma, ra } = _cpfInterest(oa, sa, ma, ra, a));
  }

  // Edge case: user already ≥55 but simulation never triggered at55 block
  // (careerStart ≥55 — very late career start). Use SA proxy.
  if (!at55) ra55 = Math.min(sa, cohortFRS);

  // Lookup payout (Standard Plan, male base)
  let payout = _cpfPayout(ra55);

  // Plan modifiers
  if (plan === "escalating") payout = Math.round(payout * 0.80);
  if (plan === "basic")      payout = Math.round(payout * 0.87);

  // Gender: female life expectancy longer → same RA → slightly lower monthly
  if (gender === "F") payout = Math.round(payout * 0.97);

  return payout;
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
