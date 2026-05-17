# Integrations

## Vercel

Set environment variables in your Vercel project:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (optional for current MVP)
- `SUPABASE_TABLE_NAME` (default `planner_profiles`)

## Supabase

1. Open SQL editor and run `supabase-schema.sql`.
2. Confirm table name matches `SUPABASE_TABLE_NAME`.
3. Confirm row-level security policy settings if using anon inserts.

## Local

Copy `.env.example` to `.env.local` and fill values from your existing integration settings.

Note:

The external path `C:\\Users\\ianxi\\Obsidian\\Lyceum\\3_CODING\\GitHub\\Horizon\\Supabase.md` is not directly accessible from this Linux dev container, so values must be copied into `.env.local` or Vercel manually.
