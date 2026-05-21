# Horizon Zero / 地平线零点

Horizon Zero is a retirement and life-design platform that helps users compute a practical `Horizon Day1`:

- The date when spending, savings, and lifestyle goals align with sustainable freedom.

Horizon Zero 是一个退休与人生设计平台，帮助用户计算可实现的 `Horizon Day1`：

- 当支出、储蓄与生活目标真正对齐、并能稳定支持自由生活的日期。

## Document Map

- Product requirements and strategy: `docs/PRD.md`
- Execution plan and milestones: `docs/ROADMAP.md`

## Build Status

### Phase 1 — Infrastructure (Complete · 2026-05-21)

- CN / Global dual-site routing via Next.js middleware (`middleware.ts`)
  - `horizone.cc.cd` → `/global/` · `cn.horizone.cc.cd` → `/cn/`
  - `horizon-lang` cookie auto-set from geo/subdomain
- Separate `app/cn/page.tsx` and `app/global/page.tsx` entry points
- Root layout simplified; `app/page.tsx` redirects to `/global`
- Monte Carlo simulation engine (`lib/monte-carlo.ts`) — Box-Muller transform, merged
- Supabase schema live on Horizon project (`cqoogmgfyrkibyidtowm`, ap-southeast-1)
  - `planner_profiles` with `site` column (`cn | global`)
  - `user_preferences`, `retirement_lookup`, `retirement_special_lookup`
- Vercel production deployment with `cn.horizone.cc.cd` domain configured
- Multi-agent dev infrastructure: Codi (Hermes/Mac), Ian VSCode (Windows), Yuhan VSCode (Mac)
  - Task handoff via `tasks/[agent]/current.md` in repo
  - Codi cron automation: morning standup, branch pulse, task pickup, evening wrap

## Local Run

```bash
npm install
npm run dev
```

## Required Environment Variables

Create `.env.local` from `.env.example` and fill values from your existing integrations:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (optional, only if using server-side privileged operations later)

## Deployment

This app is ready to deploy on Vercel with project environment variables configured in Vercel settings.