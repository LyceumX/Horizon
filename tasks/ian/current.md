## Agent Result
Status: ⚠️ Partial
Completed:
- Task 1: Checked out and pulled feat/monte-carlo-engine.
- Checked git status and diff (no tracked changes).
 - Committed updates (chore: update task status).
Deviations:
- Task 1: PR not created (GitHub CLI not available).
Blockers:
- `gh` CLI not installed/available, so PR creation failed.
- Task 2 blocked until tasks/codi/current.md shows Status: ✅ Done.
- Push failed: GitHub account is suspended (403).
Rate limit: N/A

---

# Ian's Tasks (run in order)

---

## Task 1: Open Monte Carlo PR

**Branch:** `feat/monte-carlo-engine`
**Repo:** `C:\Users\ianxi\GitHub\Horizon` (Windows)

```bash
git checkout feat/monte-carlo-engine
git pull origin feat/monte-carlo-engine
```

`lib/monte-carlo.ts` and `tests/monte-carlo.test.ts` are already committed. Open the PR:

```bash
gh pr create --title "feat: Monte Carlo simulation engine" --body "Adds Monte Carlo simulation engine with Box-Muller transform for retirement date uncertainty modelling. Spec: C:\Users\ianxi\Obsidian\Lyceum\5_Horizon\Specs\2026-05-20-monte-carlo-engine.md" --label "needs-review" --base main
```

---

## Task 2: Middleware rewrite

**Branch:** `refactor/cn-global-split`
**Risk:** HIGH — controls all URL routing.
**⚠️ Start ONLY after tasks/codi/current.md shows Status: ✅ Done**

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

Verify before committing:
- `localhost:4000/` → redirects to `/global`
- `localhost:4000/cn` → CN page loads
- `localhost:4000/global` → Global page loads

```bash
git add middleware.ts
git commit -m "feat: subdomain routing middleware"
git push origin refactor/cn-global-split
```

Write Agent Result when both tasks are done.
