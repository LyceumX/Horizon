# Horizon / 早早退休

Retirement and life-design platform. Computes `Horizon Day1` — the practical date when spending, savings, and lifestyle goals align with sustainable freedom.

两站双语退休规划平台，计算 `Day1`：支出、储蓄与生活目标真正对齐、能稳定支持自由生活的日期。

---

## Sites

| URL | Entry | Audience |
|-----|-------|----------|
| `horizone.cc.cd` | `app/global/page.tsx` | Global (EN/ZH toggle) |
| `cn.horizone.cc.cd` | `app/cn/page.tsx` | China-specific (ZH) |

Routing handled by `middleware.ts` — subdomain → Next.js rewrite.

---

## Document Map

| Doc | Purpose |
|-----|---------|
| `docs/PRD.md` | Product vision, goals, user journey |
| `docs/ROADMAP.md` | Phase status, completed work, next priorities |
| `docs/ARCHITECTURE.md` | Tech stack, file structure, key patterns |
| `docs/ALGORITHMS.md` | Pension formulas, FIRE planner logic |
| `docs/TEAM.md` | Agent roster, LLM models, task assignment rules |
| `docs/DEV-STANDARDS.md` | Coding conventions, CSS system, commit format |
| `docs/INTEGRATIONS.md` | Supabase, Clerk, Vercel env vars |

---

## Build Status

### Phase 1 — Infrastructure ✅ Complete (2026-05-21)
- CN / Global dual-site routing via Next.js middleware
- Separate `app/cn/` and `app/global/` page entry points
- Monte Carlo simulation engine (`lib/monte-carlo.ts`)
- Supabase schema live (`planner_profiles` with `site` column, lookup tables)
- Vercel production deployment — both domains live
- Multi-agent dev infrastructure with task handoff protocol

### Phase 2 — Planner Core ✅ Substantially Complete (2026-05-22)
- FIRE planner engine (`lib/planner.ts`) — deterministic Day1 with portfolio simulation
- CN pension calculator — full formula with 2025 reform retirement age, province wage base, what-if row
- Singapore CPF estimator — full year-by-year simulation with 2026 rates and payout lookup table
- HK MPF and AU Super estimators
- US Social Security estimator + 401(k) projection + healthcare bridge
- Bilingual UI (EN/ZH toggle on global site)
- Budget templates (low / balanced / full)
- Scenario presets (base / optimistic / stress)
- Share card with anonymised snapshot
- Local browser save + optional Supabase cloud save (Clerk auth)
- US country fully unlocked (FRA 67, SS live, 9 states)

### Phase 3 — Next Priorities
See `docs/ROADMAP.md` for detailed backlog.

---

## Local Development

```bash
npm install
npm run dev        # localhost:3000 → global site
                   # localhost:3000/cn → CN site
```

TypeScript check:
```bash
npx tsc --noEmit
```

Production build:
```bash
npm run build
```

---

## Environment Variables

Copy `.env.example` → `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # optional
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY= # optional — auth disabled gracefully if absent
CLERK_SECRET_KEY=
```

See `docs/INTEGRATIONS.md` for full setup.

---

## Team

Managed by Ian. See `docs/TEAM.md` for agent roster and task assignment protocol.

| Agent | Model | Device |
|-------|-------|--------|
| Ian | GPT-5.2 Codex | Mac |
| Yuhan | Haiku | Windows |
| Codi | GLM 5.1 | Mac |
