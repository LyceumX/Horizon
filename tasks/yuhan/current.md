## Agent Result
Status: ✅ Done
Completed: Created `supabase/migrations/20260520_add_site_column.sql` with the requested migration SQL.
Deviations: None.
Blockers: None.
Rate limit: (X% used, resets at HH:MM)

---

# Task: Write DB migration SQL file

**Branch:** `refactor/cn-global-split`
**File to create:** `supabase/migrations/20260520_add_site_column.sql`
**Do NOT apply this migration** — write the file only. Ian will apply it via Supabase dashboard.

Do NOT touch any other files. Do NOT modify `.vscode/`, `tasks.json`, or any config files.

---

## Step 1: Create the migrations folder if it doesn't exist

```bash
mkdir -p supabase/migrations
```

## Step 2: Create `supabase/migrations/20260520_add_site_column.sql` with this exact content

```sql
-- Migration: add site column to planner_profiles
-- Date: 2026-05-20
-- Purpose: track whether a user profile belongs to the CN or Global site
-- DO NOT apply manually — applied via Supabase MCP by Ian

ALTER TABLE planner_profiles
ADD COLUMN IF NOT EXISTS site TEXT NOT NULL DEFAULT 'global'
CHECK (site IN ('cn', 'global'));
```

## Step 3: Commit

```bash
git add supabase/migrations/20260520_add_site_column.sql
git commit -m "chore: add site column migration SQL"
git push origin refactor/cn-global-split
```

Write Agent Result (including rate limit %) when done.
