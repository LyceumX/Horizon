## Agent Result
Status: (✅ Done / ⚠️ Partial / ❌ Blocked)
Completed:
Deviations:
Blockers:
Rate limit: (N/A — Codi is a Hermes agent)

---

# Phase 2 follow-up: Bug fix + CN brand rename

**Branch:** `feat/phase2-planner-core`
**Repo:** `/Users/ianxie/GitHub/Horizon`

Two tasks. Run them in order. Run `npm run build` after each. Do not commit if build fails.

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

Write Agent Result when both tasks are done.
