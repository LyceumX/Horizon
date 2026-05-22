# Algorithms

Reference for all formulas used in Horizon. Keep this file updated whenever a formula changes.

---

## 1. FIRE Planner — `lib/planner.ts`

### `calculateHorizonDay1(input)`

Deterministic month-by-month portfolio simulation. The portfolio grows by investment return each month, the target grows by inflation, and surplus is added. Day1 = when portfolio ≥ target.

```
annualTargetSpend      = monthlyTargetSpendAtRetirement × 12
netAnnualTargetSpend   = max(0, annualTargetSpend − pensionIncome × 12)
target₀                = netAnnualTargetSpend × multiplier

monthlyReturn          = (1 + annualReturnRate)^(1/12) − 1
monthlyInflation       = (1 + annualInflationRate)^(1/12) − 1

each month:
  portfolio = portfolio × (1 + monthlyReturn) + monthlySurplus
  target    = target × (1 + monthlyInflation)
  until portfolio ≥ target

yearsToGoal = months / 12
```

**Scenario presets:**

| Scenario | Return | Inflation | Multiplier |
|----------|--------|-----------|------------|
| Base | 6% | 3% | 25× |
| Optimistic | 8% | 2% | 25× |
| Stress | 4% | 4% | 30× |

**Important constraint:** `age` is accepted as input but **not used** in the formula. Day1 is a pure portfolio-sufficiency date, not age-gated. The statutory retirement date (`getDefaultRetireDate`) is calculated separately and shown alongside.

---

## 2. CN Pension Formula — `app/cn/page.tsx`

### Source

China 2024 national pension formula. Two-component structure:
- 基础养老金 (Basic pension) — linked to province social average wage and contribution index
- 个人账户养老金 (Personal account pension) — personal savings ÷ disbursement months

### Formula

```
socialAvg = PROVINCE_PENSION_BASE[province]   // 2024 provincial monthly average wage (计发基数)
index     = clamp(contributionBase / socialAvg, 0.6, 3.0)  // 缴费指数 (contribution index)

basic     = socialAvg × (1 + index) / 2 × contributionYears × 0.01
personal  = personalAccountBalance / disbursementMonths

total     = round(basic + personal)
```

`index` is a continuous value (no bucket rounding), derived directly from the user's actual `contributionBase` (月缴费基数) divided by the province social average wage. This reflects how 缴费档次 actually works: it is a ratio, not a discrete tier.

### Disbursement Months (计发月数)

| Retirement age | Months |
|---------------|--------|
| 45 | 216 |
| 50 | 195 |
| 55 | 170 |
| 60 | 139 |
| 65 | 101 |

### Retirement Age by Gender/Category

| Category | Age |
|----------|-----|
| male | 60 |
| female_pro (干部/管理/专业) | 55 |
| female_worker (工人/蓝领) | 50 |
| special_male (特殊工种) | 55 |
| special_female (特殊工种) | 45 |

Note: 2025 reform gradually increases these ages. `lib/retirement.ts` → `getCnRetireDate()` handles the reform schedule (DOB-specific transition table). The formula above uses the display retirement age as the disbursement months key.

### Province Data

`PROVINCE_PENSION_BASE` — 2024 provincial monthly 计发基数 (social average wage for pension calculation). Source: 人力资源和社会保障部 (MOHRSS) annual publication.

`PROVINCE_AVG_PENSION` — 2024 provincial average monthly pension. Used for percentile ranking only, not for formula.

**Update cadence:** Both maps should be updated annually after the MOHRSS April/May release.

### Pension Percentile

```
ratio      = pensionCalc.total / avgPensionForProvince
percentile = round(50 + 50 × tanh(ratio − 1))
```

### What-If Delta

```
totalYears = min(40, contributionYears + whatIfExtraYears)
// re-run basic formula with totalYears, same index and personalAccountBalance
whatIfDelta = pensionCalcWhatIf − pensionCalc.total
```

---

## 3. Singapore CPF — `lib/pension-estimators.ts`

### `estimateCPFLife(monthlyGross, yearsWorked, _, currentAge, gender, plan)`

Full year-by-year CPF simulation. Key: all outputs are expressed in SGD. Reference year: 2026.

### Step 1: Contribution (per year of career)

```
cappedWage  = min(monthlyGross, OW_CEILING)   // $8,000/mo (2026)
annualCPF   = min(totalRate(age) × cappedWage × 12, CPF_ANNUAL_LIMIT)  // $37,740/yr cap
```

**Total contribution rates by age band:**

| Age | Total rate |
|-----|-----------|
| <55 | 37% |
| 55–59 | 34% |
| 60–64 | 25% |
| 65–69 | 16.5% |
| ≥70 | 12.5% |

### Step 2: Allocation (remainder method — MA first, then SA/RA, OA = remainder)

**Age <55 (SA active):**

| Age band | OA | SA | MA |
|---------|----|----|-----|
| <35 | 62.17% | 16.21% | 21.62% |
| 35–44 | 56.77% | 18.91% | 24.32% |
| 45–49 | 51.36% | 21.62% | 27.02% |
| 50–54 | 40.55% | 31.08% | 28.37% |

**Age ≥55 (RA replaces SA):**

| Age band | OA (remainder) | RA | MA |
|---------|---------------|----|----|
| 55–59 | 33.3% | 33.82% | 30.88% |
| 60–64 | 14% | 44% | 42% |
| 65–69 | 6.07% | 30.3% | 63.63% |
| ≥70 | 8% | 8% | 84% |

OA is always computed as `annualCPF − MA_credit − SA/RA_credit` (remainder rule to avoid rounding drift).

### Step 3: Interest (annual, simplified)

```
OA:   2.5% base + extra 1% on first $20K of OA balance
SA/MA: 4% base + extra 1% on their share of the remaining ($60K − $20K OA) bucket
RA:   4% base + same $60K bucket extra + additional 1% on first $30K combined (post-55 only)
```

### Step 4: Age-55 event

```
ra55 = min(SA_balance, cohortFRS)     // SA → RA; capped at FRS for user's cohort
cohortFRS = FRS_2026 × (1.03)^max(0, 55 − currentAge)    // project FRS forward at +3%/yr
FRS_2026 = $220,400
```

After the transfer, post-55 RA contributions fill to cohortFRS then overflow to OA.

### Step 5: Payout lookup (CPF LIFE Standard Plan, male, start age 65)

Piecewise linear interpolation on the official CPF Board reference table keyed by `ra55`:

| RA@55 | Monthly payout |
|-------|---------------|
| $0 | $0 |
| $50,000 | $490 |
| $110,200 (BRS) | $950 |
| $220,400 (FRS) | $1,780 |
| $440,800 (ERS) | $3,440 |

Above ERS: extrapolate using the last-segment slope.

### Step 6: Modifiers

```
if plan == "escalating": payout × 0.80  (first month; +2%/yr compounding thereafter)
if plan == "basic":      payout × 0.87  (approximate; later slides as RA depletes)
if gender == "F":        payout × 0.97  (female life expectancy adjustment)
deferral bonus:          payout × (1.07)^max(0, startAge − 65)
```

### Honest boundaries

CPF Board does not publish the actuarial formula for CPF LIFE. The payout table is the official published reference. This function matches any third-party CPF planning tool's approach — estimate based on official lookup, clearly labeled as an estimate.

**Data source for update:** `data.gov.sg` datasets:
- Contribution rates: `d_98ffa142ae0dec40391f78f81d26aca9`
- Allocation ratios: `d_97ec9a2ce15cbf253128e48779a3fba0`
- FRS/BRS/ERS: CPF Board annual announcement (members turning 55)

---

## 4. Hong Kong MPF — `lib/pension-estimators.ts`

### `estimateMPF(monthlyGross, yearsWorked, yearsToRetire)`

```
effectiveSalary = clamp(monthlyGross, HKD 7,100, HKD 30,000)
yearlyContrib   = effectiveSalary × 10% × 12   // 5% employee + 5% employer
ANNUAL_RETURN   = 5% (conservative balanced fund)
DRAWDOWN_MONTHS = 240 (20-year drawdown assumption)

existingMPF = yearlyContrib × yearsWorked × (1 + r)^(yearsWorked/2)
futureMPF   = yearlyContrib × [(1+r)^yearsToRetire − 1] / r

totalMPF = existingMPF × (1+r)^yearsToRetire + futureMPF
monthly  = round(totalMPF / 240)
```

MPF has no government annuity — it is a lump-sum DC scheme. The 20-year drawdown is the Horizon convention for monthly display.

---

## 5. Australia Superannuation — `lib/pension-estimators.ts`

### `estimateSuper(annualGross, yearsWorked, yearsToRetire)`

```
yearlyContrib = annualGross × 11.5%   // Super Guarantee FY2024-25
ANNUAL_RETURN = 7%                    // balanced fund long-run APRA median
SWR           = 4%                    // safe withdrawal rate

existingSuper = yearlyContrib × yearsWorked × (1+r)^(yearsWorked/2)
futureSuper   = yearlyContrib × [(1+r)^yearsToRetire − 1] / r

totalSuper = existingSuper × (1+r)^yearsToRetire + futureSuper
monthly    = round((totalSuper × SWR) / 12)
```

---

## 6. Statutory Retirement Dates — `lib/retirement.ts`

### `getDefaultRetireDate(country, dob, gender, employmentType)`

Returns a `Date` (first day of retirement month) based on country-specific rules.

**CN:** Implements the 2025 reform transition schedule. Ages transition gradually based on DOB:
- Male: 60 → 63 (phased by birth month, 2025–2039)
- Female professional: 55 → 58
- Female worker: 50 → 55
- Special male: 55 → 58
- Special female: 45 → 48

**SG:** 65 (CPF LIFE start age; re-employment age 67 is separate)

**HK:** 65

**AU:** 67 (Age Pension; Super preservation age 60 is separate)

**US:** 67 (Full Retirement Age, born 1960+)

**JP:** 65, **KR:** 63, **CA:** 65, **NZ:** 65, **MY:** 60

Returns `null` for unsupported countries (UK, etc.).
