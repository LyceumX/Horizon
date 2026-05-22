# Horizon Roadmap

## Phase Status

| Phase | Status | Completed |
|-------|--------|-----------|
| 1 — Infrastructure | ✅ Done | 2026-05-21 |
| 2 — Planner Core | ✅ Done | 2026-05-22 |
| 3 — Algorithm Depth | 🔄 In Progress | — |
| 4 — UX Polish & Growth | ⬜ Next | — |
| 5 — Community & Sharing | ⬜ Planned | — |

---

## Phase 1 — Infrastructure ✅

- [x] Next.js 14 App Router, TypeScript, custom CSS (no Tailwind)
- [x] CN / Global dual-site routing — middleware subdomain rewrites
- [x] Separate `app/cn/` and `app/global/` entry points
- [x] Monte Carlo simulation engine (`lib/monte-carlo.ts`)
- [x] Supabase schema — `planner_profiles` (+ `site` column), lookup tables
- [x] Vercel production — `horizone.cc.cd` + `cn.horizone.cc.cd` live
- [x] Multi-agent dev infrastructure — task handoff via `tasks/[agent]/current.md`
- [x] Codi cron automation: morning standup, branch pulse, task pickup, evening wrap

---

## Phase 2 — Planner Core ✅

- [x] FIRE planner engine (`lib/planner.ts`) — deterministic Day1 with portfolio simulation
- [x] Scenario presets — base / optimistic / stress with different return/inflation/multiplier
- [x] CN pension calculator — full formula, province wage base, gender/category retirement age
- [x] Continuous 缴费指数 from 缴费基数 ÷ 社平工资 (replaces 3-bucket dropdown)
- [x] 2025 CN retirement reform — correct statutory age by DOB + gender category
- [x] CN pension percentile vs province average
- [x] CN what-if row — "再多缴 N 年 → +¥X/月"
- [x] CN mobile responsive pass (860px / 680px)
- [x] SG CPF estimator — full year-by-year simulation (2026 rates, payout lookup)
- [x] HK MPF estimator
- [x] AU Superannuation estimator
- [x] US Social Security estimator (62 / FRA 67 / 70 claim ages, bend-point formula)
- [x] US 401(k)/IRA projection with employer match
- [x] US healthcare bridge (pre-Medicare cost estimate)
- [x] US country fully unlocked — 9 states, FRA 67 statutory age
- [x] Budget templates — low / balanced / full with expandable detail
- [x] EN/ZH bilingual toggle on global site
- [x] Share card — anonymised snapshot text + social channel links
- [x] Local browser save (no sign-in required) + Clerk cloud save
- [x] Eye toggle to show/hide pension amounts
- [x] Flip animation keyed on value change
- [x] Hero callout with static Example/示例 label

---

## Phase 3 — Algorithm Depth 🔄

### High priority
- [ ] **SG: CPF plan selector** — let user choose Standard / Escalating / Basic; show monthly delta
- [ ] **SG: CPF existing balance inputs** — OA/SA/MA fields to seed simulation from actual balances
- [ ] **SG: Deferral bonus UI** — show +7%/yr for each year past 65 start age
- [ ] **CN: 公积金 (housing fund) balance** — add to nest egg projection as lump-sum input
- [ ] **HK: MPF fund-type selector** — conservative / balanced / equity return rate choice
- [ ] **AU: Super fund return selector** — conservative / balanced / growth
- [ ] **Monte Carlo integration into UI** — probability cone, confidence score display
- [ ] **Sequence risk stress inputs** — market crash in year 1/5/10 scenarios

### Medium priority
- [ ] Provincial wage base annual update mechanism (CN pension stays accurate)
- [ ] CPF contribution rate table version management (update when CPF Board publishes)
- [ ] UK pension integration (State Pension — currently "coming soon")
- [ ] Japan / Korea pension estimators (currently statutory age only)

---

## Phase 4 — UX Polish & Growth ⬜

- [ ] Supabase RLS policies — required before public launch
- [ ] Profile comparison — "what if I moved province?" side-by-side
- [ ] Day1 trajectory chart — portfolio growth line
- [ ] Multi-profile household planning
- [ ] CN: stories localisation and expansion
- [ ] Progressive onboarding — reduce initial form friction
- [ ] Analytics baseline — Day1 completion rate, scenario rerun rate, share rate

---

## Phase 5 — Community & Sharing ⬜

- [ ] Anonymised profile cards (beyond text share)
- [ ] Community leaderboard / benchmarks (opt-in)
- [ ] WeChat / 小红书 optimised share templates
- [ ] Cohort tracking — return users after 30/90 days

---

## Open Dependencies

- [ ] Supabase RLS policies (currently disabled — block on public launch)
- [ ] CN provincial wage base cadence — update annually from official 人力资源和社会保障部 data
- [ ] CPF Board rate table monitoring — update if Jan 2027 changes published
- [ ] Clerk production keys for cloud save (optional feature, gracefully disabled if absent)

---

## Known Issues / Tech Debt

- `calculateHorizonDay1()` receives `age` parameter but does not use it in the math — intentional (FIRE date is portfolio-only, not age-gated), but misleading API; consider removing the param
- SS estimator Years-worked slider state resets when claim-age buttons clicked (noted in Ian's QA)
- 401(k) balance slider does not update display value (noted in Ian's QA)
- Supabase RLS not enforced on `planner_profiles` — must fix before public launch
