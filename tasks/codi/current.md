## Agent Result
Status: (✅ Done / ⚠️ Partial / ❌ Blocked)
Completed:
Deviations:
Blockers:
Rate limit: (N/A — Codi is a Hermes agent)

---

# Phase 2 follow-up: Bug fix + CN brand rename + Global page

**Branch:** `feat/phase2-planner-core`
**Repo:** `/Users/ianxie/GitHub/Horizon`

Three tasks. Run them in order. Run `npm run build` after each. Do not commit if build fails.

---

## Pre-flight

```bash
cd /Users/ianxie/GitHub/Horizon
git checkout feat/phase2-planner-core
git pull origin feat/phase2-planner-core
```

---

## Task A: Fix JSX syntax error in app/cn/page.tsx

The build is currently broken. In `app/cn/page.tsx` around lines 849–866, the gap metric card was incorrectly nested inside the `hideSensitive` ternary without a fragment wrapper. Replace that block.

Find this exact block:

```tsx
                  {hideSensitive ? null : (
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
                  )}
```

Replace with:

```tsx
                  {hideSensitive ? null : (
                    <>
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
                    </>
                  )}
```

```bash
npm run build
```

Expected: build succeeds.

```bash
git add app/cn/page.tsx
git commit -m "fix: wrap CN page capital+gap cards in fragment inside hideSensitive conditional"
git push origin feat/phase2-planner-core
```

---

## Task B: Rename CN brand to 早早退休

The CN product name changes from "Horizon" to "早早退休". Update all CN-facing strings only. Global site is untouched.

### B1 — lib/copy/cn.ts (6 changes)

**1.** Find:
```ts
  brand: "锁定你的自由之日。",
```
Replace with:
```ts
  brand: "早早退休",
```

**2.** Find:
```ts
  slogan: "Horizon 把复杂的地区规则变成极简方案，并实时更新。先看自由日期，再用每月选择把它提前。",
```
Replace with:
```ts
  slogan: "早早退休 把复杂的地区规则变成极简方案，并实时更新。先看自由日期，再用每月选择把它提前。",
```

**3.** Find:
```ts
  interest: "丢掉 Excel，参考最佳实践，看到使用 Horizon 节省的年数，与同路人一起坚持。",
```
Replace with:
```ts
  interest: "丢掉 Excel，参考最佳实践，看到使用 早早退休 节省的年数，与同路人一起坚持。",
```

**4.** Find:
```ts
  summaryTitle: "为什么选择 Horizon Day 1",
```
Replace with:
```ts
  summaryTitle: "为什么选择 早早退休",
```

**5.** Find:
```ts
  yearsSavedLabel: "使用 Horizon 节省年数",
```
Replace with:
```ts
  yearsSavedLabel: "使用 早早退休 节省年数",
```

**6.** Find:
```ts
      text: "Horizon 把模糊目标变成了日期，再变成了我能坚持的计划。",
```
Replace with:
```ts
      text: "早早退休 把模糊目标变成了日期，再变成了我能坚持的计划。",
```

### B2 — app/cn/page.tsx (1 change)

In the `summaryCards` function around line 268, find:
```tsx
        { key: "save", title: "提前年数", value: "显示使用 Horizon 可节省多少年", details: ["默认退休日期对比你的计划。", "每次调整都可实时看到变化。"], accent: "#2f4a6b" },
```
Replace with:
```tsx
        { key: "save", title: "提前年数", value: "显示使用 早早退休 可节省多少年", details: ["默认退休日期对比你的计划。", "每次调整都可实时看到变化。"], accent: "#2f4a6b" },
```

### B3 — Verify and commit

```bash
npm run build
```

Expected: build succeeds.

```bash
git add lib/copy/cn.ts app/cn/page.tsx
git commit -m "feat: rename CN brand to 早早退休 across all user-facing copy"
git push origin feat/phase2-planner-core
```

---

## Task C: Wire Global page to calculateHorizonDay1

This mirrors what was done to `app/cn/page.tsx` in Tasks 3–5 of Phase 2. The logic is identical — only the language direction differs (English strings, `"en"` locale).

### C1 — Add import

At the top of `app/global/page.tsx`, after the existing imports, add:

```tsx
import { calculateHorizonDay1, SCENARIO_PRESETS } from "@/lib/planner";
```

### C2 — Add 16 new fields to the inline Copy type

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

### C3 — Replace state variables

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

### C4 — Delete the inline calcProjection function

Delete the entire `calcProjection` function (the one that uses hardcoded 5% return, around lines 131–147).

### C5 — Replace the projection useMemo

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

### C6 — Replace all projection references

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

### C7 — Update applyBudgetMode

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

### C8 — Update saveLocal

Find:
```tsx
window.localStorage.setItem("horizon-local-profile", JSON.stringify({ dob, country, province, city, gender, employmentType, save, spend, budgetMode }));
```

Replace with:
```tsx
window.localStorage.setItem("horizon-local-profile", JSON.stringify({ dob, country, province, city, gender, employmentType, currentSavings, monthlyIncome, monthlyExpenses, spend, pensionIncome, budgetMode }));
```

### C9 — Update localStorage restore useEffect

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

### C10 — Replace save slider; add scenario toggle, new inputs, pension input

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

### C11 — Update output card metrics

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

### C12 — Add assumptions panel

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

### C13 — Update saveCloud payload

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

### C14 — Build check and commit

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

Write Agent Result when all three tasks are done.
