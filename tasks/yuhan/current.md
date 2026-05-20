## Agent Result
Status: (✅ Done / ⚠️ Partial / ❌ Blocked)
Completed:
Deviations:
Blockers:
Rate limit: (X% used, resets at HH:MM)

---

# Task: Root layout cleanup

**Branch:** `refactor/cn-global-split`
**Repo:** `/Users/ianxie/GitHub/Horizon` (Mac)
**⚠️ Start ONLY after tasks/codi/current.md shows Status: ✅ Done**

Pull latest before starting:
```bash
git checkout refactor/cn-global-split
git pull origin refactor/cn-global-split
```

---

## Step 1: Simplify `app/layout.tsx`

Replace the entire contents with:

```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
```

---

## Step 2: Convert `app/page.tsx` to a redirect

Replace the entire contents with:

```tsx
import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/global");
}
```

---

## Step 3: Verify and commit

```bash
npm run build
```

Fix any TypeScript errors. Then:

```bash
git add app/layout.tsx app/page.tsx
git commit -m "refactor: simplify root layout and redirect root to /global"
git push origin refactor/cn-global-split
```

Write Agent Result when done.
