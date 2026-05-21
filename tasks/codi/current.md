## Agent Result
Status: (✅ Done / ⚠️ Partial / ❌ Blocked)
Completed:
Deviations:
Blockers:
Rate limit: (N/A — Codi is a Hermes agent)

---

# Phase 2 — Planner Core: Tasks 1–5

**Branch:** `feat/phase2-planner-core`
**Repo:** `/Users/ianxie/GitHub/Horizon`
**Reference plan:** `docs/superpowers/plans/2026-05-21-phase2-planner-core.md`

Run tasks in order. Run `npm run build` after every task. Do not commit if build fails.

---

## Pre-flight

```bash
cd /Users/ianxie/GitHub/Horizon
git checkout main
git pull origin main
git checkout -b feat/phase2-planner-core
```

---

## Task 1: Extend planner engine — scenario presets + pension income

Replace the entire contents of `lib/planner.ts`:

```ts
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
```

Add these two tests to `tests/planner.test.ts` after the existing test:

```ts
test("SCENARIO_PRESETS has base, optimistic, and stress keys with correct ordering", () => {
  assert.ok("base" in SCENARIO_PRESETS);
  assert.ok("optimistic" in SCENARIO_PRESETS);
  assert.ok("stress" in SCENARIO_PRESETS);
  assert.ok(SCENARIO_PRESETS.stress.annualReturnRate < SCENARIO_PRESETS.base.annualReturnRate);
  assert.ok(SCENARIO_PRESETS.optimistic.annualReturnRate > SCENARIO_PRESETS.base.annualReturnRate);
});

test("pensionIncome reduces yearsToGoal", () => {
  const base = calculateHorizonDay1({
    age: 30, city: "Shanghai", maritalStatus: "single",
    currentSavings: 100000, monthlyIncome: 20000, monthlyExpenses: 12000,
    monthlyTargetSpendAtRetirement: 15000,
    annualReturnRate: 0.06, annualInflationRate: 0.02, multiplier: 25
  });
  const withPension = calculateHorizonDay1({
    age: 30, city: "Shanghai", maritalStatus: "single",
    currentSavings: 100000, monthlyIncome: 20000, monthlyExpenses: 12000,
    monthlyTargetSpendAtRetirement: 15000,
    annualReturnRate: 0.06, annualInflationRate: 0.02, multiplier: 25,
    pensionIncome: 3000
  });
  assert.ok(
    withPension.yearsToGoal < base.yearsToGoal,
    `expected pension to shorten timeline: base=${base.yearsToGoal} pension=${withPension.yearsToGoal}`
  );
});
```

Also update the import at the top of `tests/planner.test.ts` to include `SCENARIO_PRESETS`:

```ts
import { calculateHorizonDay1, SCENARIO_PRESETS } from "../lib/planner";
```

Run tests:
```bash
npm run test
```

Expected: all 3 tests pass.

```bash
git add lib/planner.ts tests/planner.test.ts
git commit -m "feat: add SCENARIO_PRESETS and pensionIncome to planner engine"
```

---

## Task 2: Update budget presets and copy strings

Replace the entire contents of `lib/data/budgets.ts`:

```ts
export type BudgetMode = "low" | "balanced" | "full";

export const BUDGETS: Record<BudgetMode, {
  low: number;
  save: number;
  spend: number;
  monthlyIncome: number;
  monthlyExpenses: number;
}> = {
  low:      { low: 1, save: 1800, spend: 2100, monthlyIncome: 8000,  monthlyExpenses: 6200  },
  balanced: { low: 0, save: 2400, spend: 2800, monthlyIncome: 12000, monthlyExpenses: 9600  },
  full:     { low: 0, save: 3400, spend: 3800, monthlyIncome: 18000, monthlyExpenses: 14600 },
};
```

In `lib/copy/cn.ts`, add these 16 fields to the `Copy` type (before the closing `}`):

```ts
  currentSavings: string;
  monthlyIncome: string;
  monthlyExpenses: string;
  nestEgg: string;
  monthlySurplus: string;
  monthlyGap: string;
  horizonDate: string;
  scenarioLabel: string;
  scenarioBase: string;
  scenarioOptimistic: string;
  scenarioStress: string;
  assumptionsTitle: string;
  returnRateLabel: string;
  inflationRateLabel: string;
  multiplierLabel: string;
  pensionIncome: string;
```

Add the corresponding values to `CN_COPY` (before the closing `}`):

```ts
  currentSavings: "当前储蓄",
  monthlyIncome: "月税后收入",
  monthlyExpenses: "月支出",
  nestEgg: "目标本金",
  monthlySurplus: "月结余",
  monthlyGap: "每月差额",
  horizonDate: "自由日期",
  scenarioLabel: "情景",
  scenarioBase: "基准",
  scenarioOptimistic: "乐观",
  scenarioStress: "压力",
  assumptionsTitle: "计算假设",
  returnRateLabel: "年化收益率",
  inflationRateLabel: "年通胀率",
  multiplierLabel: "安全倍数",
  pensionIncome: "社保/公积金预计月收入（可选）",
```

In `lib/copy/global.ts`, add the same 16 fields to the `Copy` type, and add to `GLOBAL_COPY`:

```ts
  currentSavings: "Current savings",
  monthlyIncome: "Monthly after-tax income",
  monthlyExpenses: "Monthly expenses",
  nestEgg: "Required nest egg",
  monthlySurplus: "Monthly surplus",
  monthlyGap: "Monthly savings gap",
  horizonDate: "Day 1 date",
  scenarioLabel: "Scenario",
  scenarioBase: "Base",
  scenarioOptimistic: "Optimistic",
  scenarioStress: "Stress",
  assumptionsTitle: "Assumptions",
  returnRateLabel: "Annual return rate",
  inflationRateLabel: "Annual inflation rate",
  multiplierLabel: "Safe withdrawal multiple",
  pensionIncome: "Expected monthly pension / social security (optional)",
```

```bash
npm run build
```

Expected: build succeeds.

```bash
git add lib/data/budgets.ts lib/copy/cn.ts lib/copy/global.ts
git commit -m "feat: add income/expense budget breakdown and Phase 2 copy strings"
```

**⚠️ Push now so Ian can start Task 6:**
```bash
git push origin feat/phase2-planner-core
```

---

## Task 3: Wire CN page to planner engine

File: `app/cn/page.tsx`

### 3a — Add import

After the existing imports at the top of the file, add:

```tsx
import { calculateHorizonDay1, SCENARIO_PRESETS } from "@/lib/planner";
```

### 3b — Add 16 new fields to the inline Copy type

The inline `Copy` type is defined at the top of the file (around lines 49–119). Before its closing `}`, add:

```tsx
  currentSavings: string;
  monthlyIncome: string;
  monthlyExpenses: string;
  nestEgg: string;
  monthlySurplus: string;
  monthlyGap: string;
  horizonDate: string;
  scenarioLabel: string;
  scenarioBase: string;
  scenarioOptimistic: string;
  scenarioStress: string;
  assumptionsTitle: string;
  returnRateLabel: string;
  inflationRateLabel: string;
  multiplierLabel: string;
  pensionIncome: string;
```

### 3c — Replace state variables

Find:
```tsx
const [save, setSave] = useState(1800);
const [spend, setSpend] = useState(2400);
```

Replace with:
```tsx
const [currentSavings, setCurrentSavings] = useState(150000);
const [monthlyIncome, setMonthlyIncome] = useState(12000);
const [monthlyExpenses, setMonthlyExpenses] = useState(9600);
const [spend, setSpend] = useState(2800);
const [scenario, setScenario] = useState<"base" | "optimistic" | "stress">("base");
const [pensionIncome, setPensionIncome] = useState(0);
```

### 3d — Delete the inline calcProjection function

Delete this entire function (around lines 131–147):

```tsx
function calcProjection(input: { age: number; save: number; spend: number }) {
  const target = input.spend * 12 * 25;
  const monthlyRate = 0.05 / 12;
  let balance = 0;
  let months = 0;

  while (balance < target && months < 12 * 80) {
    balance = balance * (1 + monthlyRate) + input.save;
    months += 1;
  }

  const years = Number((months / 12).toFixed(1));
  const date = new Date();
  date.setMonth(date.getMonth() + months);

  return { years, date, target: Math.round(target) };
}
```

### 3e — Replace the projection useMemo

Find:
```tsx
const projection = useMemo(() => calcProjection({ age, save, spend }), [age, save, spend]);
```

Replace with:
```tsx
const plannerResult = useMemo(() => calculateHorizonDay1({
  age,
  city,
  maritalStatus: "single",
  currentSavings,
  monthlyIncome,
  monthlyExpenses,
  monthlyTargetSpendAtRetirement: spend,
  annualReturnRate: SCENARIO_PRESETS[scenario].annualReturnRate,
  annualInflationRate: SCENARIO_PRESETS[scenario].annualInflationRate,
  multiplier: SCENARIO_PRESETS[scenario].multiplier,
  pensionIncome: pensionIncome > 0 ? pensionIncome : undefined,
}), [age, city, currentSavings, monthlyIncome, monthlyExpenses, spend, scenario, pensionIncome]);
```

### 3f — Update all references from projection to plannerResult

Replace every occurrence of:

| Find | Replace with |
|---|---|
| `projection.years` | `plannerResult.yearsToGoal` |
| `projection.date` | `new Date(plannerResult.horizonDay1)` |
| `projection.target` | `plannerResult.requiredNestEgg` |

Update the `yearsSaved` useMemo. Find the block referencing `projection.years` in yearsSaved and replace with `plannerResult.yearsToGoal`:

```tsx
const yearsSaved = useMemo(() => {
  if (defaultRetireAge === null) {
    return 0;
  }
  const saved = defaultRetireAge - (age + plannerResult.yearsToGoal);
  return Math.max(0, Number(saved.toFixed(1)));
}, [defaultRetireAge, age, plannerResult.yearsToGoal]);
```

Update `projectionVersion` useMemo:

```tsx
const projectionVersion = useMemo(
  () => `${dob}|${country}|${province}|${city}|${currentSavings}|${monthlyIncome}|${monthlyExpenses}|${spend}|${scenario}|"zh"|${hideSensitive ? "hide" : "show"}`,
  [dob, country, province, city, currentSavings, monthlyIncome, monthlyExpenses, spend, scenario, hideSensitive]
);
```

### 3g — Update applyBudgetMode

Find:
```tsx
function applyBudgetMode(mode: BudgetMode) {
  setBudgetMode(mode);
  const preset = BUDGETS[mode];
  setSave(preset.save);
  setSpend(preset.spend);
}
```

Replace with:
```tsx
function applyBudgetMode(mode: BudgetMode) {
  setBudgetMode(mode);
  const preset = BUDGETS[mode];
  setMonthlyIncome(preset.monthlyIncome);
  setMonthlyExpenses(preset.monthlyExpenses);
  setSpend(preset.spend);
}
```

### 3h — Update saveLocal

Find:
```tsx
window.localStorage.setItem("horizon-local-profile", JSON.stringify({ dob, country, province, city, gender, employmentType, save, spend, budgetMode }));
```

Replace with:
```tsx
window.localStorage.setItem("horizon-local-profile", JSON.stringify({ dob, country, province, city, gender, employmentType, currentSavings, monthlyIncome, monthlyExpenses, spend, pensionIncome, budgetMode }));
```

### 3i — Update localStorage restore useEffect

Find the parsed type annotation inside the try block:
```tsx
const parsed = JSON.parse(savedProfile) as {
  dob: string;
  country: string;
  province: string;
  city: string;
  gender?: GenderCategory;
  employmentType?: EmploymentType;
  save: number;
  spend: number;
  budgetMode: BudgetMode;
};
```

Replace with:
```tsx
const parsed = JSON.parse(savedProfile) as {
  dob: string;
  country: string;
  province: string;
  city: string;
  gender?: GenderCategory;
  employmentType?: EmploymentType;
  currentSavings?: number;
  monthlyIncome?: number;
  monthlyExpenses?: number;
  spend: number;
  pensionIncome?: number;
  budgetMode: BudgetMode;
};
```

Remove `setSave(parsed.save)` and replace with:
```tsx
if (parsed.currentSavings !== undefined) setCurrentSavings(parsed.currentSavings);
if (parsed.monthlyIncome !== undefined) setMonthlyIncome(parsed.monthlyIncome);
if (parsed.monthlyExpenses !== undefined) setMonthlyExpenses(parsed.monthlyExpenses);
if (parsed.pensionIncome !== undefined) setPensionIncome(parsed.pensionIncome);
```

### 3j — Replace save slider with new inputs; add scenario toggle and pension input

In the `calc-form` section, find the save slider:
```tsx
<div className="field">
  <div className="lbl"><span>{copy.save}</span><span className="val">{money(save, "zh")}</span></div>
  <input type="range" min={200} max={8000} step={100} value={save} onChange={(e) => setSave(Number(e.target.value))} />
</div>
```

Replace it with:
```tsx
<div className="field">
  <div className="lbl"><span>{copy.scenarioLabel}</span></div>
  <div className="scenario-toggle">
    {(["base", "optimistic", "stress"] as const).map((key) => (
      <button
        key={key}
        type="button"
        className={`scenario-btn ${scenario === key ? "scenario-btn-active" : ""}`}
        onClick={() => setScenario(key)}
      >
        {key === "base" ? copy.scenarioBase : key === "optimistic" ? copy.scenarioOptimistic : copy.scenarioStress}
      </button>
    ))}
  </div>
</div>

<div className="field">
  <div className="lbl"><span>{copy.currentSavings}</span><span className="val">{money(currentSavings, "zh")}</span></div>
  <input type="range" min={0} max={3000000} step={10000} value={currentSavings} onChange={(e) => setCurrentSavings(Number(e.target.value))} />
</div>

<div className="field">
  <div className="lbl"><span>{copy.monthlyIncome}</span><span className="val">{money(monthlyIncome, "zh")}</span></div>
  <input type="range" min={3000} max={80000} step={500} value={monthlyIncome} onChange={(e) => setMonthlyIncome(Number(e.target.value))} />
</div>

<div className="field">
  <div className="lbl"><span>{copy.monthlyExpenses}</span><span className="val">{money(monthlyExpenses, "zh")}</span></div>
  <input type="range" min={1000} max={40000} step={500} value={monthlyExpenses} onChange={(e) => setMonthlyExpenses(Number(e.target.value))} />
</div>

<div className="field">
  <div className="lbl">
    <span>{copy.pensionIncome}</span>
    <span className="val">{pensionIncome > 0 ? money(pensionIncome, "zh") : "¥0"}</span>
  </div>
  <input type="range" min={0} max={10000} step={100} value={pensionIncome} onChange={(e) => setPensionIncome(Number(e.target.value))} />
</div>
```

### 3k — Update output card metrics

Find the capital metric card in the `projection-grid`:
```tsx
<div className="metric-card">
  <span className="metric-icon">💰</span>
  <div>
    <small>{copy.projectionCapital}</small>
    <strong><span key={`${projectionVersion}-capital`} className="flip-number">{money(projection.target, "zh")}</span></strong>
  </div>
</div>
```

Replace with:
```tsx
<div className="metric-card">
  <span className="metric-icon">💰</span>
  <div>
    <small>{copy.nestEgg}</small>
    <strong><span key={`${projectionVersion}-capital`} className="flip-number">{money(plannerResult.requiredNestEgg, "zh")}</span></strong>
  </div>
</div>
{plannerResult.monthlyGapToSave > 0 ? (
  <div className="metric-card">
    <span className="metric-icon">⚠️</span>
    <div>
      <small>{copy.monthlyGap}</small>
      <strong><span key={`${projectionVersion}-gap`} className="flip-number">{money(plannerResult.monthlyGapToSave, "zh")}</span></strong>
    </div>
  </div>
) : null}
```

### 3l — Add assumptions panel

In the `calc-out` section, after the `share-card` closing div, add:

```tsx
<details className="assumptions-fold">
  <summary>
    <span className="fold-label">{copy.assumptionsTitle}</span>
    <span className="fold-hint">{"点击展开"}</span>
  </summary>
  <div className="assumptions-grid">
    <div className="assumption-item">
      <span>{copy.returnRateLabel}</span>
      <strong>{(SCENARIO_PRESETS[scenario].annualReturnRate * 100).toFixed(1)}%</strong>
    </div>
    <div className="assumption-item">
      <span>{copy.inflationRateLabel}</span>
      <strong>{(SCENARIO_PRESETS[scenario].annualInflationRate * 100).toFixed(1)}%</strong>
    </div>
    <div className="assumption-item">
      <span>{copy.multiplierLabel}</span>
      <strong>{SCENARIO_PRESETS[scenario].multiplier}×</strong>
    </div>
  </div>
</details>
```

### 3m — Update saveCloud payload

Find the `saveCloud` async function body. Replace the `body: JSON.stringify(...)` call with:

```tsx
body: JSON.stringify({
  profile: {
    dob, age, country, province, city, gender, employmentType,
    currentSavings, monthlyIncome, monthlyExpenses, spend, pensionIncome,
    budgetMode, language: "zh", theme, insurance
  },
  projection: {
    horizonDay1: plannerResult.horizonDay1,
    years: plannerResult.yearsToGoal,
    year: new Date(plannerResult.horizonDay1).getFullYear(),
    requiredNestEgg: plannerResult.requiredNestEgg,
    monthlySurplus: plannerResult.monthlySurplus,
    monthlyGapToSave: plannerResult.monthlyGapToSave,
    rank: rank.rank,
    percentile: tier.percentile,
    retirementAge: Number((age + plannerResult.yearsToGoal).toFixed(1))
  }
})
```

### 3n — Build check

```bash
npm run build
```

Fix any TypeScript errors. Then:

```bash
git add app/cn/page.tsx
git commit -m "feat: wire CN page to calculateHorizonDay1, add inputs for income/expenses/savings/pension/scenario"
git push origin feat/phase2-planner-core
```

---

Write Agent Result when all tasks are done.
