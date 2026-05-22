# Integrations

## Vercel

**Project:** Horizon  
**Regions:** ap-southeast-1 (primary)

**Domains:**
- `horizone.cc.cd` → Global site (`app/global/page.tsx`)
- `cn.horizone.cc.cd` → CN site (`app/cn/page.tsx`)

**Environment variables (set in Vercel dashboard):**

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY          # optional — server-side privileged ops
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY  # optional — auth gracefully disabled if absent
CLERK_SECRET_KEY
```

Auto-deploys from `main` branch. Ian handles all pushes to `main`.

---

## Supabase

**Project:** Horizon (`cqoogmgfyrkibyidtowm`, ap-southeast-1)

**Tables:**

| Table | Purpose |
|-------|---------|
| `planner_profiles` | Saved user plans (keyed by `clerk_user_id`, `site` column = `cn\|global`) |
| `user_preferences` | Optional user settings |
| `retirement_lookup` | Static retirement age reference data |
| `retirement_special_lookup` | Special category overrides |

**Setup:**
1. Run `supabase-schema.sql` in the SQL editor
2. Confirm RLS policies — **currently disabled**, must be enabled before public launch
3. Confirm `SUPABASE_TABLE_NAME` env var matches table name (default: `planner_profiles`)

**Local development:** Copy `.env.example` → `.env.local` and fill from Supabase project settings (API → Project URL + anon key).

---

## Clerk

**Purpose:** Optional authentication for cloud save. The app works fully without Clerk — cloud save is hidden and the "requires sign-in" message is shown instead.

**Wiring:** `ClerkProvider` in `app/layout.tsx`. Save endpoint (`app/api/profiles/route.ts`) checks `auth()` from `@clerk/nextjs/server`.

**Required env vars:**
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
```

Standard redirect URLs:
```
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

---

## Local `.env.local`

```bash
cp .env.example .env.local
# Fill values from:
# Supabase: Project Settings → API
# Clerk: Dashboard → API Keys
# Vercel: Project → Settings → Environment Variables (for reference)
```

The `.env.local` file is gitignored. Never commit secrets.
