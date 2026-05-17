# Horizon Zero / 地平线零点

Horizon Zero is a retirement and life-design platform that helps users compute a practical `Horizon Day1`:

- The date when spending, savings, and lifestyle goals align with sustainable freedom.

Horizon Zero 是一个退休与人生设计平台，帮助用户计算可实现的 `Horizon Day1`：

- 当支出、储蓄与生活目标真正对齐、并能稳定支持自由生活的日期。

## Document Map

- Product requirements and strategy: `docs/PRD.md`
- Execution plan and milestones: `docs/ROADMAP.md`

## Build Status

Initial MVP web app is included in this repository:

- Form-based Day1 planner
- Deterministic date projection
- Optional Supabase persistence via environment variables
- Bilingual EN/CN toggle in the UI

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