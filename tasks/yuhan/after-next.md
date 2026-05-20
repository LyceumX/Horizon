## Agent Result
Status: (✅ Done / ⚠️ Partial / ❌ Blocked)
Completed:
Deviations:
Blockers:

---

# Task C: Root cleanup + migration file + open PR

**Branch:** `refactor/cn-global-split`
**Prerequisite:** Tasks A and B done. `localhost:4000/cn` and `localhost:4000/global` both work.

---

## 1. Simplify `app/layout.tsx`

Replace the entire file contents with:

```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
```

---

## 2. Convert `app/page.tsx` to a redirect

Replace the entire file contents with:

```tsx
import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/global");
}
```

---

## 3. Create migration file

Create `supabase/migrations/20260520_add_site_column.sql`:

```sql
ALTER TABLE planner_profiles
  ADD COLUMN IF NOT EXISTS site TEXT NOT NULL DEFAULT 'global'
    CHECK (site IN ('cn', 'global'));

COMMENT ON COLUMN planner_profiles.site IS 'Which Horizon site this profile belongs to';
```

Do NOT apply this migration. Do NOT run any supabase commands. Just create the file.

---

## 4. Verify

- `npm run build` must pass
- `localhost:4000/` redirects to `localhost:4000/global`
- `localhost:4000/cn` and `localhost:4000/global` still work

---

## 5. Commit and open draft PR

```bash
git add .
git commit -m "refactor: CN/Global architecture split — Steps 1-5"
git push origin refactor/cn-global-split
```

Open a **draft** PR on GitHub: `refactor/cn-global-split` → `main`
- Title: `refactor: CN/Global dual-site architecture split`
- Label: `needs-architect`
- Note in the body: middleware rewrite (Step 3) is handled separately by Ian
