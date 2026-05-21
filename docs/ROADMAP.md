# Horizon Zero Roadmap

## Phase Plan

### Week 1: Research and Benchmark

- Audit global and China-focused retirement/FIRE tools
- Build methodology and policy source library
- Finalize baseline assumption ranges

Deliverables:

- Competitor matrix
- Assumptions v1
- Reuse decision memo

### Week 2-3: Content and Planning System

- Build onboarding questionnaire and profile schema
- Draft educational guidance for low-budget vs full-budget freedom
- Lock deterministic Day1 logic for MVP

Deliverables:

- Profile schema v1
- Copy deck v1
- Planner formulas v1

### Week 4: MVP Calculator Release

- Publish web MVP with profile form and Day1 output
- Add scenario presets (optimistic/base/stress)
- Add explainability panel for assumptions

Deliverables:

- MVP web app
- User test script
- Baseline analytics events

### Week 5: Simulation Upgrade

- Add Monte Carlo simulation mode
- Add stress test inputs (inflation, health shock, return drawdown)
- Add confidence score display

Deliverables:

- Simulation engine v1
- Confidence output in UI

### Week 6: China Localization and Compliance

- Add China pension context (社保/公积金/企业年金)
- Add city-tier presets and healthcare assumptions
- Review disclaimers and financial language compliance

Deliverables:

- China assumptions pack v1
- Compliance checklist v1

### Week 7: Community and Sharing

- Add anonymized Day1 share cards
- Define moderation and anti-misleading rules
- Launch closed community pilot channel

Deliverables:

- Share card generator
- Community guidelines v1

### Week 8: Pilot and Iteration

- Run pilot cohort
- Analyze behavior and model fit
- Lock V1 scope and post-pilot backlog

Deliverables:

- Pilot report
- V1 requirements freeze

## Technical Milestones

### Phase 1 — Infrastructure Sprint (✅ Complete · 2026-05-21)

- [x] Docs split complete (`README`, `docs/PRD.md`, `docs/ROADMAP.md`)
- [x] App scaffold complete (Next.js 14 + TypeScript + Tailwind)
- [x] CN / Global dual-site routing — middleware rewrites by subdomain
- [x] Separate `app/cn/` and `app/global/` page entry points
- [x] Monte Carlo simulation engine (`lib/monte-carlo.ts`) — Box-Muller, merged to main
- [x] Supabase schema deployed — `planner_profiles` (+ `site` column), `user_preferences`, lookup tables
- [x] Vercel production deployment — `horizone.cc.cd` + `cn.horizone.cc.cd` domains live
- [x] Multi-agent dev infrastructure — Codi (Hermes), Ian VSCode, Yuhan VSCode
- [x] Task handoff protocol — `tasks/[agent]/current.md` in repo

### Phase 2 — Planner Core (Next)

- [ ] Planner engine (`lib/planner.ts`) — deterministic Day1 logic
- [ ] Profile form UI — onboarding questionnaire (inputs per PRD §5)
- [ ] Day1 output view — date, nest egg, gap, action summary
- [ ] Supabase persistence endpoint (`app/api/profiles/route.ts`)
- [ ] Scenario presets — base / optimistic / stress
- [ ] Assumption explainability panel
- [ ] China localization pass — 社保/公积金/企业年金 inputs, city presets

### Phase 3 — Simulation Upgrade

- [ ] Monte Carlo integration into UI — confidence score, probability cone
- [ ] Sequence risk stress inputs
- [ ] Dynamic spending policy options

### Phase 4 — Community and Sharing

- [ ] Anonymized share card generator
- [ ] Pilot cohort run + analytics baseline

## Open Dependencies

- [ ] Vercel environment variables — `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` confirmed for Horizon project
- [ ] China policy data source cadence confirmed
- [ ] RLS policies for Supabase tables (currently disabled — needed before public launch)

## Backlog (Post-MVP)

- Monte Carlo engine
- Day1 trajectory chart
- Multi-profile household planning
- Chinese/English bilingual UI toggle
- WeChat-friendly share templates
