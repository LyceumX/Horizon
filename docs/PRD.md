# Horizon PRD

## Vision

Horizon helps users plan `Horizon Day1`: the practical date when they can start a sustainable, liberated lifestyle based on spending needs, savings trajectory, and life priorities.

**Core thesis:** Freedom is date-based, not vanity-net-worth based.

---

## Product Principles

1. **Explainable math** — every output traces to a visible formula. No black boxes.
2. **User autonomy** — change any assumption and see the impact instantly.
3. **Honest boundaries** — clearly label estimates vs guarantees. Pension outputs are reference-quality estimates from official data; actuarial internals are not published by governments.
4. **Privacy-first** — anonymised sharing defaults, local save without sign-in.
5. **Compliance-safe language** — educational planning tool, not investment/tax/legal advice. No guarantee language.
6. **Localisation depth** — not a translation layer on a Western product. CN site understands 社保/公积金/缴费档次 natively; SG site runs real CPF simulation.

---

## Problem Statement

People understand retirement as an abstract number but cannot answer:

- When can I actually stop compulsory work?
- How does my city, pension system, and lifestyle change my target?
- What specific actions move my timeline forward?

Horizon provides a specific date, a traceable plan, and an interactive what-if layer.

---

## Target Users

**Primary — CN site**
- China-based professionals and creators, any income band
- Users familiar with 社保 who want to connect their pension reality to a FIRE date

**Primary — Global site**
- Singapore, Hong Kong, Australia, US knowledge workers
- Chinese diaspora using the ZH toggle
- FIRE-adjacent users who want a country-aware calculator rather than a generic spreadsheet

**Secondary — Both sites**
- Users who want community proof: "what did people in my situation actually do?" (Stories section)

---

## User Journey

1. Land on hero → see a realistic static example (labeled Example/示例)
2. Enter DOB, location, gender → statutory retirement age auto-computed
3. Enter income, expenses, spend target, savings → Day1 date and nest egg instantly
4. Explore pension calculator (CN: 缴费年限/基数/余额; SG: years worked/salary)
5. Adjust scenarios (base/optimistic/stress) → see confidence range
6. Review budget templates (low/balanced/full) → commit to a path
7. Share anonymised snapshot or save to account
8. Return monthly to re-run with updated numbers

---

## Core Inputs

**Required (both sites)**
- Date of birth
- Country / province / city
- Gender / retirement category
- Current savings
- Monthly after-tax income
- Monthly expenses
- Desired monthly spend at retirement

**CN-specific**
- 缴费年限 (contribution years)
- 缴费基数 (contribution base — monthly salary subject to pension)
- 个人账户余额 (personal pension account balance)
- Province → auto-pulls 社平工资 for pension index calculation

**SG-specific**
- Years worked to date
- Monthly salary → CPF contribution rates derived automatically

**US-specific**
- Annual salary (for SS benefit estimate)
- Years worked (for SS eligibility)
- Claim age (62 / FRA 67 / 70)
- 401(k) balance, annual contribution, employer match rate

---

## Core Outputs

- **Day1 date** — month + year when portfolio reaches nest egg target
- **Required nest egg** — target × multiplier (default 25×, stress 30×)
- **Years saved vs statutory** — how many years earlier than legal retirement
- **Monthly surplus / gap** — what needs to change to hit the date
- **Pension estimate** — monthly government pension at statutory retirement age
- **Percentile rank** — pension vs province/city average
- **What-if delta** — how extra contribution years change the monthly pension
- **Share card** — anonymised text snapshot for social posting

---

## Feature Inventory (as of 2026-05-22)

### CN Site (`app/cn/page.tsx`)
- [x] Statutory retirement date — 2025 reform, age by gender/category
- [x] Province-aware pension formula (基础养老金 + 个人账户养老金)
- [x] Continuous 缴费指数 derived from 缴费基数 ÷ 社平工资 (no 3-bucket dropdown)
- [x] Pension percentile vs province average (tanh-based)
- [x] What-if row — extra N years → +¥X/月
- [x] Pension disclaimer line
- [x] Eye toggle to hide/show pension amount
- [x] Budget templates (low/balanced/full)
- [x] Share card with city + pension percentile
- [x] Mobile responsive (860px / 680px breakpoints)
- [x] Flip animation keyed on value change only
- [x] Local browser save + Clerk cloud save

### Global Site (`app/global/page.tsx`)
- [x] 30+ countries with statutory retirement age
- [x] SG: full CPF year-by-year simulation (2026 rates, RA55 payout lookup)
- [x] HK: MPF estimator
- [x] AU: Superannuation estimator
- [x] US: Social Security estimator (62/FRA/70 claim ages)
- [x] US: 401(k)/IRA projection with employer match
- [x] US: Healthcare bridge cost (pre-Medicare gap)
- [x] EN/ZH bilingual toggle
- [x] Example/示例 hero callout (static, labeled)
- [x] Budget templates + scenario presets
- [x] Share card

---

## Non-Goals (permanent)

- Brokerage execution or product sales
- Personalised tax or legal advice
- Guaranteed-return claims
- Real-time market data or portfolio tracking

---

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Policy changes stale pension formulas | Data versioned in constants; province data source documented in `ALGORITHMS.md` |
| Users interpret estimates as guarantees | Disclaimer lines on all pension outputs; "estimate ±10–15%" language |
| Oversimplified assumptions mislead | Assumption transparency panel; scenario presets expose the range |
| CN RLS not yet enforced | Supabase RLS policies needed before public launch (tracked in ROADMAP) |
