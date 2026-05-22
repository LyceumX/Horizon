# US country unlock + SS projection polish

**Branch:** `main` (work directly on main, build must pass before committing)
**Repo:** `/Users/ianxie/GitHub/Horizon`

Two tasks. Run `npm run build` after each. Do not commit if build fails. Do not push — the planner handles all pushes.

---

## Pre-flight

```bash
cd /Users/ianxie/GitHub/Horizon
git pull origin main
npm run build   # should be green before you start
```

---

## Task A: Unlock US country end-to-end

The Social Security estimator (`country === "us"` branch) and 401k/healthcare sections are already coded but unreachable because US is blocked. This task unlocks the full US flow.

### A1 — `lib/data/regions-global.ts`: update US label

Find:
```ts
  {
    value: "us",
    label: { en: "United States (coming soon)", zh: "美国（即将上线）" },
```

Replace with:
```ts
  {
    value: "us",
    label: { en: "United States", zh: "美国" },
```

Also add three more states to the US entry (currently only California + New York). Find the US provinces array and add after the New York entry:

```ts
      { value: "texas", label: { en: "Texas", zh: "德克萨斯" }, cities: [
        { value: "houston", label: { en: "Houston", zh: "休斯顿" }, insurance: ins.us },
        { value: "austin",  label: { en: "Austin",  zh: "奥斯汀" }, insurance: ins.us },
      ]},
      { value: "illinois", label: { en: "Illinois", zh: "伊利诺伊" }, cities: [
        { value: "chicago", label: { en: "Chicago", zh: "芝加哥" }, insurance: ins.us },
      ]},
      { value: "washington", label: { en: "Washington", zh: "华盛顿州" }, cities: [
        { value: "seattle",  label: { en: "Seattle",  zh: "西雅图" }, insurance: ins.us },
        { value: "portland", label: { en: "Portland", zh: "波特兰" }, insurance: ins.us },
      ]},
```

### A2 — `lib/retirement.ts`: add US retirement age (FRA 67)

Find the null-return guard near line 131:
```typescript
  if (region === "us" || region === "uk") {
    return null;
  }
```

Replace with (keep UK coming soon, unlock US):
```typescript
  if (region === "uk") {
    return null;
  }
```

Then add `us: 67` to the `RETIRE_AGE_MALE` map. Find:
```typescript
  const RETIRE_AGE_MALE: Partial<Record<Region, number>> = {
    au: 67, jp: 65, kr: 63, ca: 65, nz: 65, my: 60,
```

Replace with:
```typescript
  const RETIRE_AGE_MALE: Partial<Record<Region, number>> = {
    us: 67,
    au: 67, jp: 65, kr: 63, ca: 65, nz: 65, my: 60,
```

### A3 — `app/global/page.tsx`: three changes

**A3a — Remove US from COMING_SOON_COUNTRIES (line ~57):**

Find:
```tsx
const COMING_SOON_COUNTRIES = new Set(["us", "uk"]);
```

Replace with:
```tsx
const COMING_SOON_COUNTRIES = new Set(["uk"]);
```

**A3b — Update the region-coverage-note text (line ~514).**

Find:
```tsx
            <div className="region-coverage-note">
              <strong>📍 Currently covers:</strong> China, Hong Kong, Macau, Taiwan, Singapore, Malaysia, Australia, Japan, Korea, Canada, New Zealand, and 15 European / Middle East / Africa markets.<br />
              <strong>United States and United Kingdom</strong> — full Social Security &amp; pension integration coming soon.
            </div>
```

Replace with:
```tsx
            <div className="region-coverage-note">
              <strong>📍 Currently covers:</strong> United States, China, Hong Kong, Macau, Taiwan, Singapore, Malaysia, Australia, Japan, Korea, Canada, New Zealand, and 15 European / Middle East / Africa markets.<br />
              <strong>United Kingdom</strong> — pension integration coming soon.
            </div>
```

**A3c — Gate the 401(k) / IRA section to US only (line ~877).**

Find:
```tsx
          {/* ── 401(k) / IRA Projection ── */}
          <div className="accounts-section">
```

Replace with:
```tsx
          {/* ── 401(k) / IRA Projection (US only) ── */}
          {country === "us" && <div className="accounts-section">
```

Then find the closing `</div>` that ends the accounts-section (it's one `</div>` after `{show401k && (...)}`) and change it to:
```tsx
          </div>}
```

The healthcare-bridge block that follows is already conditional on `healthcareBridge.yearsToMedicare > 0` — wrap it additionally:

Find:
```tsx
          {healthcareBridge.yearsToMedicare > 0 && (
```

Replace with:
```tsx
          {country === "us" && healthcareBridge.yearsToMedicare > 0 && (
```

### A4 — Build + commit

```bash
npm run build
```

Expected: zero errors.

```bash
git add lib/data/regions-global.ts lib/retirement.ts app/global/page.tsx
git commit -m "feat: unlock US country — FRA 67, SS estimator live, 401k/healthcare gated to US"
```

---

## Task B: Fix projectionVersion for SS inputs

The flip animation on the projection card uses `projectionVersion` as a React key. It currently doesn't include the SS state variables, so the card won't re-animate when the user changes salary, years worked, or claim age.

### B1 — Update `projectionVersion` useMemo (~line 267)

Find:
```tsx
  const projectionVersion = useMemo(
    () => `${dob}|${country}|${province}|${city}|${currentSavings}|${monthlyIncome}|${monthlyExpenses}|${spend}|${scenario}|${lang}`,
    [dob, country, province, city, currentSavings, monthlyIncome, monthlyExpenses, spend, scenario, lang]
  );
```

Replace with:
```tsx
  const projectionVersion = useMemo(
    () => `${dob}|${country}|${province}|${city}|${currentSavings}|${monthlyIncome}|${monthlyExpenses}|${spend}|${scenario}|${lang}|${annualSalary}|${yearsWorked}|${ssClaimAge}`,
    [dob, country, province, city, currentSavings, monthlyIncome, monthlyExpenses, spend, scenario, lang, annualSalary, yearsWorked, ssClaimAge]
  );
```

### B2 — Build + commit

```bash
npm run build
```

```bash
git add app/global/page.tsx
git commit -m "fix: include SS state in projectionVersion so flip animation triggers on SS input changes"
```

---

## Agent Result
Status: (✅ Done / ⚠️ Partial / ❌ Blocked)
Completed:
Deviations:
Blockers:
Rate limit: N/A — Codi is a Hermes agent
