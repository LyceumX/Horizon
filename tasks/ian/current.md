## Agent Result
Status: (✅ Done / ⚠️ Partial / ❌ Blocked)
Completed:
Deviations:
Blockers:
Rate limit: (X% used, resets at HH:MM)

---

# Ian's Tasks (run in order)

---

## Pre-flight: Clean working tree

The working tree has uncommitted changes on main including feature files that must NOT go to main. Run these in order, no confirmation needed:

```bash
# Create the feature branch from current state (captures all uncommitted changes)
git checkout -b refactor/cn-global-split

# Commit only the layout files Yuhan created
git add app/cn/layout.tsx app/global/layout.tsx
git commit -m "refactor: add cn and global layout files"

# Stash everything else so the tree is clean for Task 1
git stash

# Switch to the Monte Carlo branch for Task 1
git checkout feat/monte-carlo-engine
```

After Task 1 is complete, return here:
```bash
git checkout refactor/cn-global-split
git stash pop
```

---

## Task 1: Open Monte Carlo PR

**Branch:** `feat/monte-carlo-engine`

`lib/monte-carlo.ts` is complete. Open a PR:

```bash
git add lib/monte-carlo.ts
git status  # confirm tests/monte-carlo.test.ts is also staged if it exists
git commit -m "feat: Monte Carlo simulation engine" --allow-empty
git push origin feat/monte-carlo-engine
```

Then open PR on GitHub: `feat/monte-carlo-engine` → `main`
- Title: `feat: Monte Carlo simulation engine`
- Label: `needs-review`
- Body: reference spec at `C:\Users\ianxi\Obsidian\Lyceum\5_Horizon\Specs\2026-05-20-monte-carlo-engine.md`

---

## Task 2: Middleware rewrite (⚠️ Start ONLY after Codi confirms she has pushed app/cn/page.tsx and app/global/page.tsx)

**Branch:** `refactor/cn-global-split`
**Risk:** HIGH — controls all URL routing. Test all three local routes before committing.

```bash
git checkout refactor/cn-global-split
git pull origin refactor/cn-global-split
```

Replace the entire contents of `middleware.ts`:

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SKIP_PREFIXES = ["/api", "/_next", "/assets", "/favicon"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (SKIP_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/cn") || pathname.startsWith("/global")) {
    return NextResponse.next();
  }

  const host = request.headers.get("host") ?? "";
  const isCNSubdomain = host.startsWith("cn.");

  const response = NextResponse.rewrite(
    new URL(isCNSubdomain ? `/cn${pathname}` : `/global${pathname}`, request.url)
  );

  if (!request.cookies.get("horizon-lang")) {
    const country =
      request.geo?.country ?? request.headers.get("x-vercel-ip-country") ?? "";
    const language = country.toUpperCase() === "CN" || isCNSubdomain ? "zh" : "en";
    response.cookies.set("horizon-lang", language, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
```

Verify all three before committing:
- `localhost:4000/` → redirects to `/global`
- `localhost:4000/cn` → CN page loads
- `localhost:4000/global` → Global page loads

If all pass:
```bash
git add middleware.ts
git commit -m "feat: subdomain routing middleware"
git push origin refactor/cn-global-split
```
