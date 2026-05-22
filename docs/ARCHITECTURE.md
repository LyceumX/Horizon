# Architecture

## Tech Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | Next.js 14 (App Router) | No Pages Router — all routes under `app/` |
| Language | TypeScript (strict) | `npx tsc --noEmit` must pass on every commit |
| Styling | Custom CSS (`app/globals.css`) | **No Tailwind.** CSS custom properties for theming |
| Auth | Clerk (optional) | Gracefully disabled if `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` absent |
| Database | Supabase (Postgres) | `planner_profiles` table, ap-southeast-1 region |
| Deployment | Vercel | Auto-deploy from `main` branch |
| Runtime | Node.js 24 (Vercel default) | No Edge functions |

---

## Repo Structure

```
Horizon/
├── app/
│   ├── cn/
│   │   └── page.tsx          ← CN site entry point (all CN logic here)
│   ├── global/
│   │   └── page.tsx          ← Global site entry point
│   ├── api/
│   │   └── profiles/
│   │       └── route.ts      ← Supabase save endpoint (Clerk-gated)
│   ├── layout.tsx            ← Root layout (ClerkProvider, fonts)
│   ├── page.tsx              ← Redirect → /global
│   └── globals.css           ← ALL styles. One file, sections delimited by comments.
│
├── lib/
│   ├── planner.ts            ← calculateHorizonDay1() — FIRE engine
│   ├── retirement.ts         ← getDefaultRetireDate() — statutory retirement by country/DOB/gender
│   ├── monte-carlo.ts        ← Box-Muller Monte Carlo simulation engine
│   ├── pension-estimators.ts ← estimateCPFLife / estimateMPF / estimateSuper
│   ├── copy/
│   │   ├── cn.ts             ← CN_COPY: all Chinese UI strings + Copy type
│   │   └── global.ts         ← GLOBAL_COPY: all English/bilingual UI strings
│   └── data/
│       ├── regions-cn.ts     ← CN provinces, cities, insurance presets
│       └── regions-global.ts ← 30+ countries, provinces, cities
│
├── docs/                     ← All documentation (this folder)
├── tasks/
│   ├── ian/current.md        ← Task queue for Ian (GPT-5.2 Codex, Windows VSC)
│   ├── yuhan/current.md      ← Task queue for Yuhan (Haiku, VSC)
│   └── codi/current.md       ← Task queue for Codi (GLM 5.1, Hermes)
│
├── middleware.ts             ← Subdomain → route rewrite
├── next.config.ts
├── tsconfig.json
└── .env.example
```

---

## Dual-Site Routing

```
Request: cn.horizone.cc.cd/*
  └─ middleware.ts detects subdomain "cn"
     └─ rewrites to /cn/*
        └─ app/cn/page.tsx renders

Request: horizone.cc.cd/*
  └─ middleware.ts (no subdomain / "www")
     └─ rewrites to /global/*
        └─ app/global/page.tsx renders
```

The `horizon-lang` cookie is auto-set from subdomain: `cn` → `zh`, otherwise `en`. The global site has a manual EN/ZH toggle that overwrites this cookie.

---

## CSS System

All styles live in `app/globals.css`. No component-level CSS files. Structure:

```css
/* ── Tokens / Custom Properties ─── */
:root { --ink: ...; --paper: ...; --accent: ...; --line: ...; --mute: ...; }
[data-theme="dark"] { /* overrides */ }

/* ── Reset + Base ─── */
/* ── Layout (grid, hero, aside) ─── */
/* ── Component blocks (card, btn, field, ...) ─── */
/* ── CN-specific blocks ─── */
/* ── Global-specific blocks ─── */
/* ── Animations ─── */
/* ── Responsive (media queries at the END) ─── */
```

**Key tokens:**

| Token | Purpose |
|-------|---------|
| `--ink` | Primary text |
| `--paper` | Background |
| `--paper-2` | Card background |
| `--accent` | Primary highlight (warm orange/gold) |
| `--accent-soft` | Hover tint |
| `--mute` | Secondary/label text |
| `--line` | Borders |
| `--mono` | Monospace font |
| `--serif` | Serif font (used for large numbers) |
| `--sans` | UI font |

**Button convention:** All buttons use ghost/outlined style.
```css
--btn-bg: transparent;
--btn-text: var(--ink);
--btn-border: var(--line);
--btn-hover-bg: var(--accent-soft);
```

---

## Key Data Flow

### CN Page
```
User inputs (DOB, province, gender, income, expenses, spend,
            contributionYears, contributionBase, personalAccountBalance)
        │
        ├─► pensionCalcEarly (useMemo)
        │     └─► { total, basic, personal, retireAge, months, index }
        │
        ├─► calculateHorizonDay1() (useMemo)
        │     └─► { horizonDay1, requiredNestEgg, yearsToGoal, monthlySurplus }
        │
        ├─► getDefaultRetireDate() (useMemo)
        │     └─► statutory retirement date from 2025 CN reform
        │
        └─► pensionCalcWhatIf (derived from pensionCalcEarly + whatIfExtraYears)
              └─► whatIfDelta = pensionCalcWhatIf - pensionCalc.total
```

### Global Page
```
User inputs (DOB, country, gender, income, expenses, spend,
            yearsWorked, [US: annualSalary, ssClaimAge, 401k inputs])
        │
        ├─► estimateCPFLife / estimateMPF / estimateSuper / estimateSSBenefit
        │     └─► sgPension / hkPension / auPension / ssMonthly
        │
        ├─► effectivePensionIncome = routed by country
        │
        └─► calculateHorizonDay1(... pensionIncome: effectivePensionIncome)
              └─► Day1 date, nest egg, gap
```

---

## Pension Architecture Separation

**CN pension** lives entirely in `app/cn/page.tsx` as constants + useMemo hooks:
- Province wage base map (`PROVINCE_PENSION_BASE`)
- Province average pension map (`PROVINCE_AVG_PENSION`)
- Gender→retire age map (`GENDER_RETIRE_AGE`)
- Retire age→disbursement months map (`DISBURSEMENT_MONTHS`)

**Non-CN pension estimators** live in `lib/pension-estimators.ts`:
- `estimateCPFLife()` — Singapore
- `estimateMPF()` — Hong Kong
- `estimateSuper()` — Australia
- `estimateSSBenefit()` — United States (in `app/global/page.tsx` currently)

**Statutory retirement dates** live in `lib/retirement.ts`:
- `getDefaultRetireDate(country, dob, gender, employmentType)`
- Supports CN, SG, HK, AU, JP, KR, CA, NZ, MY, US, and more

---

## State Persistence

**Local save** — `localStorage` key `horizon-local-profile`. Serialises all user inputs as JSON. No sign-in required.

**Cloud save** — `POST /api/profiles` with Clerk JWT. Writes to Supabase `planner_profiles` with `clerk_user_id` and `site` columns.

**URL state** — not currently implemented (all state is in-memory React state).

---

## Environment Flags

| Variable | Effect if absent |
|----------|-----------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Auth disabled; cloud save hidden; "cloud save requires sign-in" shown |
| `NEXT_PUBLIC_SUPABASE_URL` | Save endpoint returns error gracefully |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same |
