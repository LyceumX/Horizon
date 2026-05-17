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

1. Docs split complete (`README`, `docs/PRD.md`, `docs/ROADMAP.md`)
2. App scaffold complete (Next.js + TypeScript)
3. Planner engine complete (`lib/planner.ts`)
4. Supabase persistence endpoint complete (`app/api/profiles/route.ts`)
5. Vercel deployment ready with env-based config

## Open Dependencies

- Confirm Supabase schema and table name in `Supabase.md`
- Confirm Vercel project environment variables
- Confirm China policy data source update cadence

## Backlog (Post-MVP)

- Monte Carlo engine
- Day1 trajectory chart
- Multi-profile household planning
- Chinese/English bilingual UI toggle
- WeChat-friendly share templates
