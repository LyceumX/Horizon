## Agent Result
Status: (✅ Done / ⚠️ Partial / ❌ Blocked)
Completed:
Deviations:
Blockers:
Rate limit: N/A

---

# Phase 2 — Planner Core: Task 6 (Global page)

**Branch:** `feat/phase2-planner-core`
**Repo:** `C:\Users\ianxi\GitHub\Horizon` (Windows)
**⚠️ Start ONLY after `tasks/codi/current.md` shows Status: ✅ Done AND Tasks 1+2 committed**

This task mirrors the CN page changes onto `app/global/page.tsx`. The logic is identical — only the language direction differs (English strings, `"en"` locale, `false` for CN guards).

---

## Pre-flight

```bash
git checkout feat/phase2-planner-core
git pull origin feat/phase2-planner-core
```

---

## Step 1 — Add import

At the top of `app/global/page.tsx`, after the existing imports, add:

```tsx
import { calculateHorizonDay1, SCENARIO_PRESETS } from "@/lib/planner";
```

---

## Step 2 — Add 16 new fields to the inline Copy type

The inline `Copy` type is defined near the top of the file (around lines 49–119). Before its closing `}`, add:

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

---

## Step 3 — Replace state variables

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

---

## Step 4 — Delete the inline calcProjection function

Delete the entire `calcProjection` function (the one that uses hardcoded 5% return, around lines 131–147).

---

## Step 5 — Replace the projection useMemo

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

---

## Step 6 — Replace all projection references

Replace every occurrence of:

| Find | Replace with |
|---|---|
| `projection.years` | `plannerResult.yearsToGoal` |
| `projection.date` | `new Date(plannerResult.horizonDay1)` |
| `projection.target` | `plannerResult.requiredNestEgg` |

Update `yearsSaved` useMemo:

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
  () => `${dob}|${country}|${province}|${city}|${currentSavings}|${monthlyIncome}|${monthlyExpenses}|${spend}|${scenario}|"en"|${hideSensitive ? "hide" : "show"}`,
  [dob, country, province, city, currentSavings, monthlyIncome, monthlyExpenses, spend, scenario, hideSensitive]
);
```

---

## Step 7 — Update applyBudgetMode

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

---

## Step 8 — Update saveLocal

Find:
```tsx
window.localStorage.setItem("horizon-local-profile", JSON.stringify({ dob, country, province, city, gender, employmentType, save, spend, budgetMode }));
```

Replace with:
```tsx
window.localStorage.setItem("horizon-local-profile", JSON.stringify({ dob, country, province, city, gender, employmentType, currentSavings, monthlyIncome, monthlyExpenses, spend, pensionIncome, budgetMode }));
```

---

## Step 9 — Update localStorage restore useEffect

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

---

## Step 10 — Replace save slider; add scenario toggle, new inputs, pension input

Find the save slider in the `calc-form` section:
```tsx
<div className="field">
  <div className="lbl"><span>{copy.save}</span><span className="val">{money(save, "en")}</span></div>
  <input type="range" min={200} max={8000} step={100} value={save} onChange={(e) => setSave(Number(e.target.value))} />
</div>
```

Replace with:
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
  <div className="lbl"><span>{copy.currentSavings}</span><span className="val">{money(currentSavings, "en")}</span></div>
  <input type="range" min={0} max={3000000} step={10000} value={currentSavings} onChange={(e) => setCurrentSavings(Number(e.target.value))} />
</div>

<div className="field">
  <div className="lbl"><span>{copy.monthlyIncome}</span><span className="val">{money(monthlyIncome, "en")}</span></div>
  <input type="range" min={3000} max={80000} step={500} value={monthlyIncome} onChange={(e) => setMonthlyIncome(Number(e.target.value))} />
</div>

<div className="field">
  <div className="lbl"><span>{copy.monthlyExpenses}</span><span className="val">{money(monthlyExpenses, "en")}</span></div>
  <input type="range" min={1000} max={40000} step={500} value={monthlyExpenses} onChange={(e) => setMonthlyExpenses(Number(e.target.value))} />
</div>

<div className="field">
  <div className="lbl">
    <span>{copy.pensionIncome}</span>
    <span className="val">{pensionIncome > 0 ? money(pensionIncome, "en") : "$0"}</span>
  </div>
  <input type="range" min={0} max={10000} step={100} value={pensionIncome} onChange={(e) => setPensionIncome(Number(e.target.value))} />
</div>
```

---

## Step 11 — Update output card metrics

Find the capital metric card in the `projection-grid`:
```tsx
<div className="metric-card">
  <span className="metric-icon">💰</span>
  <div>
    <small>{copy.projectionCapital}</small>
    <strong><span key={`${projectionVersion}-capital`} className="flip-number">{money(projection.target, "en")}</span></strong>
  </div>
</div>
```

Replace with:
```tsx
<div className="metric-card">
  <span className="metric-icon">💰</span>
  <div>
    <small>{copy.nestEgg}</small>
    <strong><span key={`${projectionVersion}-capital`} className="flip-number">{money(plannerResult.requiredNestEgg, "en")}</span></strong>
  </div>
</div>
{plannerResult.monthlyGapToSave > 0 ? (
  <div className="metric-card">
    <span className="metric-icon">⚠️</span>
    <div>
      <small>{copy.monthlyGap}</small>
      <strong><span key={`${projectionVersion}-gap`} className="flip-number">{money(plannerResult.monthlyGapToSave, "en")}</span></strong>
    </div>
  </div>
) : null}
```

---

## Step 12 — Add assumptions panel

In the `calc-out` section, after the `share-card` closing div, add:

```tsx
<details className="assumptions-fold">
  <summary>
    <span className="fold-label">{copy.assumptionsTitle}</span>
    <span className="fold-hint">{"Click to expand"}</span>
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

---

## Step 13 — Update saveCloud payload

Find the `saveCloud` async function. Replace the `body: JSON.stringify(...)` call with:

```tsx
body: JSON.stringify({
  profile: {
    dob, age, country, province, city, gender, employmentType,
    currentSavings, monthlyIncome, monthlyExpenses, spend, pensionIncome,
    budgetMode, language: "en", theme, insurance
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

---

## Step 14 — Build check and commit

```bash
npm run build
```

Fix any TypeScript errors. Then:

```bash
git add app/global/page.tsx
git commit -m "feat: wire Global page to calculateHorizonDay1, add inputs for income/expenses/savings/pension/scenario"
git push origin feat/phase2-planner-core
```

---

Write Agent Result when done.
