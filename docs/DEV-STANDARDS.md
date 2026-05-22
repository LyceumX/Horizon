# Dev Standards

Rules and conventions for all agents. Follow these on every task.

---

## TypeScript

- **`npx tsc --noEmit` must pass on every commit.** No exceptions. Fix type errors before committing.
- Use strict mode (already set in `tsconfig.json`). Do not add `// @ts-ignore` or `any` casts.
- Prefer explicit return types on exported functions.
- `useMemo` and `useCallback` dependency arrays must be complete — TypeScript + React exhaustive-deps will catch omissions.
- Named exports only in `lib/` files. No default exports from library modules.

---

## React / Next.js

- All page state lives in the page component (`app/cn/page.tsx`, `app/global/page.tsx`). No separate state files or context providers unless the feature clearly warrants it.
- `useMemo` for derived values that depend on multiple state variables. Do not re-compute in the render body.
- Flip animation pattern: `<span key={value} className="flip-number">` — the `key` prop triggers re-mount and animation only when the value changes. Do not use arbitrary `key` values.
- No `useEffect` for computed values — use `useMemo`.
- Server components are not used on the main page routes (all client-side interactivity). `"use client"` is implicit via `useState` usage.

---

## CSS

- **One file:** `app/globals.css`. No module CSS, no inline styles, no Tailwind classes.
- Use CSS custom properties (`var(--token)`) for all colours, font families, and spacing that appears more than once.
- New component blocks: add a `/* ── BlockName ── */` comment header. Place the block in the logical section (CN-specific near the CN section, Global-specific near Global, shared components in the shared section).
- Responsive media queries go **at the very end** of `globals.css`, never inline in component sections.
- Button style: always ghost/outlined (`--btn-bg: transparent`). Do not add solid filled buttons without discussing with Ian.
- Do not add `!important`. Fix specificity issues properly.
- Dark mode: test every new component in dark mode. All colours must use `var(--token)` so dark mode overrides work automatically.

---

## Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| CSS class | kebab-case | `.pension-result-breakdown` |
| React state | camelCase | `contributionBase` |
| React setter | `set` + PascalCase | `setContributionBase` |
| Constants | SCREAMING_SNAKE | `PROVINCE_PENSION_BASE` |
| useMemo aliases | camelCase | `pensionCalc` |
| Exported functions | camelCase | `estimateCPFLife` |
| Types | PascalCase | `GenderCategory` |

---

## File Editing Rules

- **Read before editing.** Always read the target section of a file before making changes, even if the task spec includes the expected content.
- **Surgical edits.** Change only what the task specifies. Do not reformat, re-indent, or "clean up" surrounding code.
- **No accidental deletions.** When adding a block inside JSX, verify the JSX tree is still balanced after your edit.
- **`git add [specific files]` only.** Never `git add .` or `git add -A`. The `.env.local` and `tsconfig.tsbuildinfo` must never be committed.

---

## Pension / Algorithm Updates

When updating a pension formula or rate table:
1. Update the formula/constants in the source file.
2. Update `docs/ALGORITHMS.md` to reflect the change.
3. Add the data source and effective date in a code comment near the constant.
4. Note the change in the commit message (e.g. `data(sg): update CPF OW ceiling to $8,500 from Jan 2027`).

---

## Disclaimer Language

Every pension output must carry a disclaimer. Approved patterns:

**CN:**
> 基于公开规则测算，实际金额以当地社保局为准。

**SG:**
> Estimate based on CPF Board reference figures, subject to adjustment.
> Full CPF simulation: 2026 contribution rates, age-banded allocation, tiered interest. Estimate ±10–15%.

**General:**
> Educational planning tool only — not investment, tax, or legal advice.

Do not add new pension output displays without a disclaimer line.

---

## Build Gate

Before every commit:
```bash
npm run build       # zero errors required
npx tsc --noEmit    # zero type errors required
```

If `npm run build` fails, do not commit. Fix the error first. Note the failure in `Agent Result` if blocked.

---

## What Agents Must Never Do

- `git push` — Ian handles all pushes
- `git add .` or `git add -A`
- Skip `npm run build` before committing
- Add `// @ts-ignore` or `as any`
- Add `!important` in CSS
- Modify `.env.local` or any secret file
- Change `next.config.ts` or `tsconfig.json` without explicit instruction
- Reformat code outside the task scope
