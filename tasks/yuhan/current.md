# CN Page — Pension UX polish + mobile responsive pass

**Branch:** `main`
**Repo:** `/Users/ianxie/GitHub/Horizon` (Mac)
**Files:** `app/cn/page.tsx`, `app/globals.css`

Three self-contained tasks. Do them in order; commit after each one.

---

## Pre-flight

```bash
cd /Users/ianxie/GitHub/Horizon
git pull origin main
npm run dev
```

Open `localhost:3000/cn`. Keep it open throughout.

---

## Task 1 — Disclaimer line below pension result

The pension card now shows real formula-based numbers. Add one line of small
copy beneath the breakdown row to set expectations.

### Where to add it

In `app/cn/page.tsx`, find the pension-result block inside
`pension-summary-card` (search for `pension-result-breakdown`).

Right after the closing `</>` of the non-hidden branch (the `<>…</>` that
contains `pension-result-amount` and `pension-result-breakdown`), add:

```tsx
<p className="pension-disclaimer">
  基于公开规则测算，实际金额以当地社保局为准。
</p>
```

### CSS

In `app/globals.css`, find `.pension-result-breakdown strong` and add below it:

```css
.pension-disclaimer {
  margin: 6px 0 0;
  font-size: 10px;
  color: var(--mute);
  text-align: right;
  opacity: 0.7;
  line-height: 1.5;
}
```

### Verify

Pension card shows the small grey disclaimer line below the breakdown.
Run `npx tsc --noEmit` — zero errors.

### Commit

```bash
git add app/cn/page.tsx app/globals.css
git commit -m "feat(cn): add pension disclaimer line below result card"
```

---

## Task 2 — What-if row: "多缴 N 年，养老金涨多少？"

A single interactive row below the pension result that lets users see the
pension impact of contributing more years.

### State

In `app/cn/page.tsx`, find the pension calculator state block
(near `contributionYears`). Add one new state variable after it:

```tsx
const [whatIfExtraYears, setWhatIfExtraYears] = useState(5);
```

### Derived value

Find `const pensionCalc = pensionCalcEarly;` and add immediately after:

```tsx
// What-if: pension if user contributes N additional years
const pensionCalcWhatIf = (() => {
  const totalYears = Math.min(40, pensionCalc.retireAge > 0
    ? contributionYears + whatIfExtraYears
    : contributionYears + whatIfExtraYears);
  const socialAvg = PROVINCE_PENSION_BASE[province] ?? 6000;
  const index = Math.min(3.0, Math.max(0.6, contributionBase / socialAvg));
  const basic = socialAvg * (1 + index) / 2 * totalYears * 0.01;
  const personal = personalAccountBalance / (pensionCalc.months || 139);
  return Math.round(basic + personal);
})();
const whatIfDelta = pensionCalcWhatIf - pensionCalc.total;
```

### UI — add below the pension-result div in `pension-summary-card`

Find the closing `</div>` of the `pension-result` block (just before the
`{/* Row 2 */}` comment). Add after it:

```tsx
<div className="whatif-row">
  <div className="whatif-label">
    如果再多缴
    <input
      type="number"
      className="whatif-input"
      min={1}
      max={20}
      value={whatIfExtraYears}
      onChange={(e) => setWhatIfExtraYears(Math.min(20, Math.max(1, Number(e.target.value))))}
    />
    年
  </div>
  <div className="whatif-delta">
    +{money(whatIfDelta, "zh")}<span className="whatif-freq">/月</span>
  </div>
</div>
```

### CSS

Add to `app/globals.css` (after `.pension-disclaimer`):

```css
.whatif-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 0 4px;
  border-top: 0.5px dashed color-mix(in srgb, var(--line) 70%, transparent);
  margin-top: 6px;
}
.whatif-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--mute);
  font-family: var(--mono);
  letter-spacing: 0.04em;
}
.whatif-input {
  width: 38px;
  text-align: center;
  border: 0.5px solid var(--line);
  border-radius: 6px;
  background: var(--paper);
  color: var(--ink);
  font: 500 12px var(--mono);
  padding: 2px 4px;
  appearance: textfield;
  -moz-appearance: textfield;
}
.whatif-input::-webkit-inner-spin-button,
.whatif-input::-webkit-outer-spin-button { -webkit-appearance: none; }
.whatif-delta {
  font-family: var(--serif);
  font-style: italic;
  font-size: 18px;
  color: var(--accent);
}
.whatif-freq {
  font-family: var(--sans);
  font-style: normal;
  font-size: 11px;
  color: var(--mute);
  margin-left: 2px;
}
```

### Verify

- The what-if row appears below the pension card inside the stats card.
- Changing the year number (1–20) updates the `+¥X/月` figure immediately.
- `npx tsc --noEmit` — zero errors.

### Commit

```bash
git add app/cn/page.tsx app/globals.css
git commit -m "feat(cn): what-if row — pension delta for extra contribution years"
```

---

## Task 3 — Mobile responsive pass (CN page new sections)

The pension inputs, stats card, and share card were added recently and have no
`@media` breakpoints. Add responsive overrides at the **very end** of
`app/globals.css` (after all existing rules).

---

## Agent Result

- Completed Task 1: Added pension disclaimer text below the pension breakdown in `app/cn/page.tsx` and CSS in `app/globals.css`.
- Completed Task 2: Added `whatIfExtraYears` state, derived `pensionCalcWhatIf` / `whatIfDelta`, and inserted the interactive what-if row in `app/cn/page.tsx` with supporting styles.
- Completed Task 3: Added responsive overrides for the CN pension summary and related page sections at smaller breakpoints in `app/globals.css`.
- Verified changes with `npx tsc --noEmit` successfully with zero TypeScript errors.

### Breakpoints to add

```css

/* ── Responsive: CN pension calculator & output card ─────────── */

@media (max-width: 860px) {
  /* Stack 2-column pension form into single column */
  .form-row-2col {
    grid-template-columns: 1fr;
    gap: 14px;
  }
}

@media (max-width: 680px) {
  /* Pension summary card: tighter padding */
  .pension-summary-card {
    padding: 16px 16px 14px;
  }

  /* PSC row: allow value to wrap below label on very small screens */
  .psc-row {
    flex-wrap: wrap;
    gap: 6px;
  }

  .psc-value {
    width: 100%;
    align-items: flex-start;
  }

  /* Share card: full-width buttons */
  .share-card .save-row {
    flex-direction: column;
  }

  .share-card .save-row .btn {
    width: 100%;
    text-align: center;
  }

  /* Pension result amount: left-align on mobile for readability */
  .pension-result-amount,
  .pension-result-breakdown {
    justify-content: flex-start;
    text-align: left;
  }

  /* What-if row: allow wrapping */
  .whatif-row {
    flex-wrap: wrap;
    gap: 4px;
  }

  /* Hero callout: tighter padding on small screens */
  .hero-callout {
    padding-right: 18px;
  }

  .example-tag {
    position: static;
    display: inline-block;
    margin-bottom: 4px;
  }
}
```

### Verify

- At 375px wide (`localhost:3000/cn`): pension form fields stack vertically,
  stats card is readable, share button is full-width.
- Desktop (≥ 1024px) looks unchanged.
- Dark mode: switch to dark (◐ button) at mobile width — no clipping or
  invisible text.

### Commit

```bash
git add app/globals.css
git commit -m "style(cn): responsive breakpoints for pension form, stats card, share section"
```

---

## Final check

```bash
npx tsc --noEmit
```

Zero errors. Do not push — Ian handles all pushes.

---

## Agent Result

Status: (✅ Done / ⚠️ Partial / ❌ Blocked)
Completed:
Deviations:
Blockers:
Rate limit: (X% used, resets at HH:MM)
