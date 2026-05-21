# Phase 2 — Planner Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the full deterministic planner engine into both CN and Global pages, adding real financial inputs (current savings, income, expenses), a Day1 output view, scenario presets, an assumption explainability panel, and a pension income input for the CN site.

**Architecture:** `lib/planner.ts` owns all calculation logic; the pages consume it via a single `useMemo` call. Scenario presets live in the planner lib as constants. Copy strings are extended in `lib/copy/cn.ts` and `lib/copy/global.ts`. No new files needed.

**Tech Stack:** Next.js 14, TypeScript, React 18, Node.js built-in test runner (`tsx --test`), Tailwind CSS

---

## File Map

| File | Action | What changes |
|---|---|---|
| `lib/planner.ts` | Modify | Add `ScenarioPreset` type, `SCENARIO_PRESETS` constant, `pensionIncome` optional input, update calc to use pension in nest egg reduction |
| `lib/data/budgets.ts` | Modify | Add `monthlyIncome` + `monthlyExpenses` to each preset |
| `lib/copy/cn.ts` | Modify | Add 14 new `Copy` fields + Chinese strings |
| `lib/copy/global.ts` | Modify | Add same 14 fields + English strings |
| `app/cn/page.tsx` | Modify | Import planner, swap inline calc, add state/inputs, update output card, add scenario toggle, add assumptions panel, add pension income input, update save payloads |
| `app/global/page.tsx` | Modify | Mirror all cn page changes with English strings |
| `tests/planner.test.ts` | Modify | Add 2 tests: scenario presets shape, pensionIncome reduces years |

---

## Task 1: Extend Planner Engine — Scenario Presets + Pension Income

**Files:**
- Modify: `lib/planner.ts`
- Modify: `tests/planner.test.ts`

### Step 1.1: Write failing tests

Open `tests/planner.test.ts` and add these two tests after the existing test:

```ts
test("SCENARIO_PRESETS has base, optimistic, and stress keys", () => {
  const { SCENARIO_PRESETS } = require("../lib/planner");
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
  assert.ok(withPension.yearsToGoal < base.yearsToGoal,
    `expected pension to shorten timeline: base=${base.yearsToGoal} pension=${withPension.yearsToGoal}`);
});
```

- [ ] Add the two tests above to `tests/planner.test.ts`

### Step 1.2: Run tests to confirm they fail

```bash
cd /Users/ianxie/GitHub/Horizon && npm run test
```

Expected: FAIL — `SCENARIO_PRESETS` not found, second test fails because `pensionIncome` is not yet supported.

- [ ] Confirm tests fail as expected

### Step 1.3: Implement scenario presets and pensionIncome in planner

Replace the entire contents of `lib/planner.ts` with:

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

- [ ] Replace `lib/planner.ts` with the code above

### Step 1.4: Run tests to confirm they pass

```bash
cd /Users/ianxie/GitHub/Horizon && npm run test
```

Expected: PASS — all 3 tests pass.

- [ ] Confirm all tests pass

### Step 1.5: Commit

```bash
git add lib/planner.ts tests/planner.test.ts
git commit -m "feat: add SCENARIO_PRESETS and pensionIncome to planner engine"
```

- [ ] Commit

---

## Task 2: Update Budget Presets + Copy Strings

**Files:**
- Modify: `lib/data/budgets.ts`
- Modify: `lib/copy/cn.ts`
- Modify: `lib/copy/global.ts`

### Step 2.1: Update budgets.ts to include income/expenses breakdown

Replace the contents of `lib/data/budgets.ts` with:

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

- [ ] Replace `lib/data/budgets.ts` with the code above

### Step 2.2: Extend Copy type and add CN strings

In `lib/copy/cn.ts`, find the `Copy` type definition (line 1). Add these 14 fields at the end of the type, before the closing `}`:

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

Then in the `CN_COPY` object (the exported constant), add the corresponding Chinese values at the end (before the closing `}`):

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

- [ ] Add the 16 new fields to the `Copy` type in `lib/copy/cn.ts`
- [ ] Add the 16 Chinese values to `CN_COPY` in `lib/copy/cn.ts`

### Step 2.3: Extend global copy

In `lib/copy/global.ts`, make the same additions to the `Copy` type (same 16 fields), then add to `GLOBAL_COPY`:

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

- [ ] Add the 16 new fields to `Copy` type in `lib/copy/global.ts`
- [ ] Add the 16 English values to `GLOBAL_COPY` in `lib/copy/global.ts`

### Step 2.4: Verify build passes

```bash
cd /Users/ianxie/GitHub/Horizon && npm run build
```

Expected: Build succeeds. TypeScript will catch any missing fields on `CN_COPY` or `GLOBAL_COPY`.

- [ ] Confirm build passes

### Step 2.5: Commit

```bash
git add lib/data/budgets.ts lib/copy/cn.ts lib/copy/global.ts
git commit -m "feat: add budget income/expense breakdown and new copy strings for Phase 2 planner UI"
```

- [ ] Commit

---

## Task 3: Wire CN Page to Planner Engine

**Files:**
- Modify: `app/cn/page.tsx`

This task replaces the inline `calcProjection` function with `calculateHorizonDay1`, adds the three new financial inputs (currentSavings, monthlyIncome, monthlyExpenses), updates the output card, and removes the now-unused `save` state.

### Step 3.1: Add imports and update the inline Copy type

At the top of `app/cn/page.tsx`, after the existing imports, add:

```tsx
import { calculateHorizonDay1, SCENARIO_PRESETS } from "@/lib/planner";
```

In the inline `Copy` type definition (lines 49–119), add the 16 new fields at the end before the closing `}`:

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

- [ ] Add import for `calculateHorizonDay1` and `SCENARIO_PRESETS`
- [ ] Add 16 new fields to the inline `Copy` type

### Step 3.2: Replace state variables

In the `HomePage` function body, find the existing state declarations around line 289–299:

```tsx
const [save, setSave] = useState(1800);
const [spend, setSpend] = useState(2400);
```

Replace them with:

```tsx
const [currentSavings, setCurrentSavings] = useState(150000);
const [monthlyIncome, setMonthlyIncome] = useState(12000);
const [monthlyExpenses, setMonthlyExpenses] = useState(9600);
const [spend, setSpend] = useState(2800);
```

Note: `save` state is removed; `spend` default updated to match balanced preset.

- [ ] Replace `save` state with `currentSavings`, `monthlyIncome`, `monthlyExpenses`

### Step 3.3: Remove inline calcProjection function

Find and delete the `calcProjection` function (lines 131–147):

```tsx
function calcProjection(input: { age: number; save: number; spend: number }) {
  ...
}
```

Delete the entire function.

- [ ] Delete `calcProjection` function

### Step 3.4: Replace the projection useMemo

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
  annualReturnRate: SCENARIO_PRESETS.base.annualReturnRate,
  annualInflationRate: SCENARIO_PRESETS.base.annualInflationRate,
  multiplier: SCENARIO_PRESETS.base.multiplier,
}), [age, city, currentSavings, monthlyIncome, monthlyExpenses, spend]);
```

- [ ] Replace `projection` useMemo with `plannerResult` useMemo

### Step 3.5: Update all references from projection to plannerResult

Find and replace these occurrences throughout the file:

| Old | New |
|---|---|
| `projection.years` | `plannerResult.yearsToGoal` |
| `projection.date` | `new Date(plannerResult.horizonDay1)` |
| `projection.target` | `plannerResult.requiredNestEgg` |

Also update `yearsSaved` useMemo (find the block referencing `projection.years`):

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
  () => `${dob}|${country}|${province}|${city}|${currentSavings}|${monthlyIncome}|${monthlyExpenses}|${spend}|"zh"|${hideSensitive ? "hide" : "show"}`,
  [dob, country, province, city, currentSavings, monthlyIncome, monthlyExpenses, spend, hideSensitive]
);
```

- [ ] Replace all `projection.years`, `projection.date`, `projection.target` references
- [ ] Update `yearsSaved` and `projectionVersion` useMemos

### Step 3.6: Update applyBudgetMode to use new state

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

- [ ] Update `applyBudgetMode`

### Step 3.7: Update saveLocal and the localStorage restore useEffect

Find the `saveLocal` function:
```tsx
function saveLocal() {
  window.localStorage.setItem("horizon-local-profile", JSON.stringify({ dob, country, province, city, gender, employmentType, save, spend, budgetMode }));
```

Replace with:
```tsx
function saveLocal() {
  window.localStorage.setItem("horizon-local-profile", JSON.stringify({ dob, country, province, city, gender, employmentType, currentSavings, monthlyIncome, monthlyExpenses, spend, budgetMode }));
```

Find the localStorage restore useEffect (the `try { const parsed = JSON.parse(savedProfile) as { ... }` block). Update the type annotation and restore calls:

Old type annotation:
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

New type annotation:
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
  budgetMode: BudgetMode;
};
```

Replace `setSave(parsed.save)` with:
```tsx
if (parsed.currentSavings !== undefined) setCurrentSavings(parsed.currentSavings);
if (parsed.monthlyIncome !== undefined) setMonthlyIncome(parsed.monthlyIncome);
if (parsed.monthlyExpenses !== undefined) setMonthlyExpenses(parsed.monthlyExpenses);
```

- [ ] Update `saveLocal`
- [ ] Update localStorage restore useEffect type annotation and restore calls

### Step 3.8: Replace save slider with three new inputs; add surplus display

In the `calc-form` section, find the save slider:
```tsx
<div className="field">
  <div className="lbl"><span>{copy.save}</span><span className="val">{money(save, "zh")}</span></div>
  <input type="range" min={200} max={8000} step={100} value={save} onChange={(e) => setSave(Number(e.target.value))} />
</div>
```

Replace it with these three inputs:
```tsx
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
```

- [ ] Replace save slider with the three new inputs

### Step 3.9: Update output card metric cards

In the projection card, find the `projection-grid` div containing the four metric cards. The existing cards reference `projection.years`, `age + projection.years`, rank, and `projection.target`. Update the capital metric card label and add a monthlySurplus card:

Find the capital metric card:
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

- [ ] Update capital metric card and add gap card

### Step 3.10: Update saveCloud payload

Find `saveCloud` async function. Update the `body` JSON to replace `save` with the new fields:

```tsx
body: JSON.stringify({
  profile: {
    dob, age, country, province, city, gender, employmentType,
    currentSavings, monthlyIncome, monthlyExpenses, spend,
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

- [ ] Update `saveCloud` payload

### Step 3.11: Verify build passes

```bash
cd /Users/ianxie/GitHub/Horizon && npm run build
```

Expected: Build succeeds with no TypeScript errors.

- [ ] Confirm build passes

### Step 3.12: Commit

```bash
git add app/cn/page.tsx
git commit -m "feat: wire CN page to calculateHorizonDay1, add currentSavings/income/expenses inputs"
```

- [ ] Commit

---

## Task 4: Add Scenario Toggle + Assumptions Panel to CN Page

**Files:**
- Modify: `app/cn/page.tsx`

### Step 4.1: Add scenario state

In the `HomePage` function, add this state after the existing state declarations:

```tsx
const [scenario, setScenario] = useState<"base" | "optimistic" | "stress">("base");
```

- [ ] Add `scenario` state

### Step 4.2: Wire scenario to plannerResult

Update the `plannerResult` useMemo to use the active scenario's assumptions instead of the hardcoded base values:

Find:
```tsx
const plannerResult = useMemo(() => calculateHorizonDay1({
  age,
  city,
  maritalStatus: "single",
  currentSavings,
  monthlyIncome,
  monthlyExpenses,
  monthlyTargetSpendAtRetirement: spend,
  annualReturnRate: SCENARIO_PRESETS.base.annualReturnRate,
  annualInflationRate: SCENARIO_PRESETS.base.annualInflationRate,
  multiplier: SCENARIO_PRESETS.base.multiplier,
}), [age, city, currentSavings, monthlyIncome, monthlyExpenses, spend]);
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
}), [age, city, currentSavings, monthlyIncome, monthlyExpenses, spend, scenario]);
```

Also add `scenario` to the `projectionVersion` dependency key:
```tsx
const projectionVersion = useMemo(
  () => `${dob}|${country}|${province}|${city}|${currentSavings}|${monthlyIncome}|${monthlyExpenses}|${spend}|${scenario}|"zh"|${hideSensitive ? "hide" : "show"}`,
  [dob, country, province, city, currentSavings, monthlyIncome, monthlyExpenses, spend, scenario, hideSensitive]
);
```

- [ ] Update `plannerResult` to use `SCENARIO_PRESETS[scenario]`
- [ ] Add `scenario` to `projectionVersion` key

### Step 4.3: Add scenario toggle UI

In the form section (`calc-form`), add the scenario toggle above the currentSavings input. Insert after the profile-grid div and before the currentSavings field:

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
```

- [ ] Add scenario toggle UI to form

### Step 4.4: Add assumptions panel

In the `calc-out` section, after the `share-card` div, add:

```tsx
<details className="assumptions-fold">
  <summary>
    <span className="fold-label">{copy.assumptionsTitle}</span>
    <span className="fold-hint">{true ? "点击展开" : "Click to expand"}</span>
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

- [ ] Add assumptions panel

### Step 4.5: Verify build passes

```bash
cd /Users/ianxie/GitHub/Horizon && npm run build
```

Expected: Build succeeds.

- [ ] Confirm build passes

### Step 4.6: Commit

```bash
git add app/cn/page.tsx
git commit -m "feat: add scenario preset toggle and assumptions panel to CN page"
```

- [ ] Commit

---

## Task 5: Add Pension Income Input to CN Page

**Files:**
- Modify: `app/cn/page.tsx`

### Step 5.1: Add pensionIncome state

```tsx
const [pensionIncome, setPensionIncome] = useState(0);
```

Add after the `scenario` state declaration.

- [ ] Add `pensionIncome` state

### Step 5.2: Wire pensionIncome to plannerResult

Update the `plannerResult` useMemo to pass `pensionIncome`:

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

- [ ] Pass `pensionIncome` to `calculateHorizonDay1`

### Step 5.3: Add pension income input to form

In the form section, after the `spend` slider and before the `save-row`, add:

```tsx
<div className="field">
  <div className="lbl">
    <span>{copy.pensionIncome}</span>
    <span className="val">{pensionIncome > 0 ? money(pensionIncome, "zh") : (true ? "不填则视为零" : "0 if blank")}</span>
  </div>
  <input
    type="range"
    min={0}
    max={10000}
    step={100}
    value={pensionIncome}
    onChange={(e) => setPensionIncome(Number(e.target.value))}
  />
</div>
```

- [ ] Add pension income slider to form

### Step 5.4: Update saveLocal and saveCloud to include pensionIncome

In `saveLocal`:
```tsx
window.localStorage.setItem("horizon-local-profile", JSON.stringify({
  dob, country, province, city, gender, employmentType,
  currentSavings, monthlyIncome, monthlyExpenses, spend, pensionIncome,
  budgetMode
}));
```

In the localStorage restore useEffect, add `pensionIncome?: number` to the parsed type and:
```tsx
if (parsed.pensionIncome !== undefined) setPensionIncome(parsed.pensionIncome);
```

In `saveCloud`, add `pensionIncome` to the profile payload:
```tsx
profile: {
  dob, age, country, province, city, gender, employmentType,
  currentSavings, monthlyIncome, monthlyExpenses, spend, pensionIncome,
  budgetMode, language: "zh", theme, insurance
},
```

- [ ] Update `saveLocal`, restore useEffect, and `saveCloud` to include `pensionIncome`

### Step 5.5: Verify build passes

```bash
cd /Users/ianxie/GitHub/Horizon && npm run build
```

Expected: Build succeeds.

- [ ] Confirm build passes

### Step 5.6: Commit

```bash
git add app/cn/page.tsx
git commit -m "feat: add pension income input (社保/公积金) to CN planner"
```

- [ ] Commit

---

## Task 6: Wire Global Page (Mirror Tasks 3–5)

**Files:**
- Modify: `app/global/page.tsx`

The global page is structurally identical to the CN page. Apply the exact same changes from Tasks 3, 4, and 5, with these differences:
- The `money` formatter uses `"en"` not `"zh"` throughout
- The pension income field is labeled with `copy.pensionIncome` (English string: "Expected monthly pension / social security (optional)")
- The `maritalStatus: "single"` in `calculateHorizonDay1` call is the same

### Step 6.1: Apply Task 3 changes to global page

Repeat every sub-step from Task 3 on `app/global/page.tsx`:
- Add import for `calculateHorizonDay1`, `SCENARIO_PRESETS`
- Add 16 new fields to inline `Copy` type
- Replace `save` state with `currentSavings`, `monthlyIncome`, `monthlyExpenses`
- Delete `calcProjection` function
- Replace `projection` useMemo with `plannerResult` useMemo (using `SCENARIO_PRESETS.base` initially)
- Replace all `projection.*` references
- Update `yearsSaved`, `projectionVersion`
- Update `applyBudgetMode`
- Update `saveLocal` and restore useEffect
- Replace save slider with three new inputs
- Update output card capital metric + add gap card
- Update `saveCloud` payload

- [ ] Apply all Task 3 changes to `app/global/page.tsx`

### Step 6.2: Apply Task 4 changes to global page

Repeat every sub-step from Task 4 on `app/global/page.tsx`:
- Add `scenario` state
- Update `plannerResult` useMemo to use `SCENARIO_PRESETS[scenario]`
- Add `scenario` to `projectionVersion`
- Add scenario toggle UI (using `false` for CN locale guards, `"en"` language)
- Add assumptions panel

- [ ] Apply all Task 4 changes to `app/global/page.tsx`

### Step 6.3: Apply Task 5 changes to global page

Repeat every sub-step from Task 5 on `app/global/page.tsx`:
- Add `pensionIncome` state
- Pass to `calculateHorizonDay1`
- Add pension income slider to form
- Update `saveLocal`, restore useEffect, `saveCloud`

- [ ] Apply all Task 5 changes to `app/global/page.tsx`

### Step 6.4: Verify build passes

```bash
cd /Users/ianxie/GitHub/Horizon && npm run build
```

Expected: Build succeeds.

- [ ] Confirm build passes

### Step 6.5: Commit

```bash
git add app/global/page.tsx
git commit -m "feat: wire Global page to calculateHorizonDay1, add scenario/assumptions/pension inputs"
```

- [ ] Commit

---

## Self-Review

### Spec Coverage

Checking Phase 2 ROADMAP items:

| Item | Tasks |
|---|---|
| Planner engine `lib/planner.ts` — deterministic Day1 logic | Task 1 ✅ |
| Profile form UI — onboarding questionnaire (inputs per PRD §5) | Tasks 3+5 (currentSavings, income, expenses, pension) ✅ |
| Day1 output view — date, nest egg, gap, action summary | Task 3 step 3.9 ✅ |
| Supabase persistence endpoint | Already exists; payload updated in Tasks 3+5 ✅ |
| Scenario presets — base / optimistic / stress | Tasks 1+4 ✅ |
| Assumption explainability panel | Task 4 step 4.4 ✅ |
| China localization pass — 社保/公积金/企业年金 inputs | Task 5 ✅ |

**PRD §5 inputs status:**
- Age (via DOB) ✅ existing
- City ✅ existing
- Sex ✅ existing (CN)
- Marital status — hardcoded `"single"`, not a user input yet (deferred to post-MVP)
- Dependents — deferred
- Current savings ✅ Task 3
- Monthly after-tax income ✅ Task 3
- Monthly expenses ✅ Task 3
- Housing status — deferred
- Desired lifestyle budget ✅ existing (spend slider)
- Risk tolerance → mapped to scenario preset ✅ Task 4
- Optional pension income ✅ Task 5

Remaining deferred PRD §5 inputs (marital status, dependents, housing status) are intentionally out of Phase 2 scope per ROADMAP.

### Placeholder Scan

No TBD/TODO items. All code blocks are complete. Types are consistent: `plannerResult.yearsToGoal` used throughout after Task 3.2+.

### Type Consistency Check

- `calculateHorizonDay1` input uses `monthlyIncome` + `monthlyExpenses` — consistent across Tasks 1, 3, 4, 5, 6 ✅
- `plannerResult.yearsToGoal` — named consistently throughout ✅
- `SCENARIO_PRESETS[scenario]` — `scenario` type is `"base" | "optimistic" | "stress"` which matches `SCENARIO_PRESETS` record keys ✅
- `pensionIncome` passed as `undefined` when 0 — `PlannerInput.pensionIncome` is `number | undefined` ✅
- `BUDGETS[mode].monthlyIncome` — added to `BUDGETS` type in Task 2.1, used in `applyBudgetMode` in Tasks 3.6 and 6.1 ✅
