# Responsive CSS for new US sections

**Branch:** `main`
**Repo:** `/Users/ianxie/GitHub/Horizon` (Mac)
**File to edit:** `app/globals.css` only

New UI sections (Social Security estimator, 401k panel, healthcare bridge, sticky freedom strip) were added by automated agents. Their CSS was appended **after** the existing `@media` blocks, so none of it is responsive yet. This task adds the missing breakpoint rules.

---

## Pre-flight

```bash
cd /Users/ianxie/GitHub/Horizon
git pull origin main
npm run dev
```

Open `localhost:3000/global`, select United States, open the 401k section. Resize the browser window to confirm the issues this task fixes.

---

## Context: CSS file structure

`app/globals.css` ends like this:

```
... component rules (lines 1–1589) ...
@media (max-width: 980px) { ... }   ← line 1589
... scenario + assumptions CSS ...
@media (max-width: 860px) { ... }   ← line 1747
@media (max-width: 680px) { ... }   ← line 1753, ends ~1775
... NEW agent-added CSS (region-coverage-note, freedom-strip, ss-*, accounts-*, healthcare-*) ...
```

Because the new CSS sits **after** the existing `@media` blocks, adding rules to those earlier blocks would be cascade-unsafe (base rules appearing later in the file would override them). **Add all responsive overrides as new `@media` blocks at the very end of the file**, after the last existing rule.

---

## Step 1 — Identify the four problem areas

### 1a — SS claim-age picker (`.ss-benefit-row`)
Base rule: `grid-template-columns: repeat(3, 1fr)` with `padding: 10px 6px` per button.  
On ≤ 480px: three columns is too cramped. The amount text gets truncated.

### 1b — Sticky freedom strip (`.freedom-strip`)
Base rule: `position: fixed; bottom: 0; padding: 10px var(--x)`.  
On ≤ 680px: `--x` can be as small as 20px, which is fine, but the strip height and font sizes should be slightly tighter so it doesn't eat screen real estate.

### 1c — Accounts projection rows (`.accounts-proj-row`)
Base rule: `display: flex; justify-content: space-between`. This is already fine at all widths. No change needed.

### 1d — Stories grid with 7 cards
The base `.stories-grid` uses `repeat(auto-fill, …)` or a fixed column count. With 7 cards the bottom row may have a lone card on desktop. Verify visually — adjust only if it looks bad.

---

## Step 2 — Add responsive blocks at the end of `app/globals.css`

Open `app/globals.css`. Scroll to the very last line. Append the following (do not insert into existing `@media` blocks):

```css

/* ── Responsive: new US sections ─────────────────────────────── */

@media (max-width: 860px) {
  /* Freedom strip: slightly smaller on tablets */
  .freedom-strip {
    padding: 8px var(--x);
    font-size: 0.8rem;
  }

  .freedom-strip-date {
    font-size: 1rem;
  }
}

@media (max-width: 680px) {
  /* SS claim-age picker: stack 3 buttons into a single column */
  .ss-benefit-row {
    grid-template-columns: 1fr;
    gap: 6px;
  }

  /* Each claim option becomes a horizontal row instead of a vertical card */
  .ss-claim-opt {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 10px 14px;
    gap: 12px;
  }

  .ss-claim-age {
    font-size: 0.8rem;
  }

  .ss-claim-amt {
    font-size: 0.95rem;
  }

  /* SS tag repositions: inline instead of absolute top badge */
  .ss-claim-tag {
    position: static;
    margin-left: auto;
  }

  /* Freedom strip: compact on phones */
  .freedom-strip {
    padding: 7px var(--x);
    font-size: 0.75rem;
  }

  .freedom-strip-date {
    font-size: 0.9rem;
  }

  /* Region coverage note: tighter text on phones */
  .region-coverage-note {
    font-size: 0.75rem;
  }
}
```

---

## Step 3 — Stories grid visual check

With 7 story cards, check desktop (≥ 1200px) layout:
- If the grid shows 4 columns with the 7th card left-aligned on a second row looking odd, change the stories grid to 3 columns on desktop (or auto-fill with `min-width: 260px`).
- Check what the existing `.stories-grid` base rule looks like. If it's `repeat(4, 1fr)` or `repeat(auto-fill, minmax(240px, 1fr))` and 7 cards look fine, leave it.
- Only make a change if it looks wrong. If you do change it, put the rule in the existing component section (before the `@media` blocks), not inside a breakpoint.

---

## Step 4 — Dark mode spot check

Switch to dark mode (◐ button in nav) with United States selected and the 401k panel open. Verify:
- [ ] `.ss-estimator-card` background (`var(--accent-soft)`) renders correctly in dark
- [ ] `.ss-claim-opt` background (`var(--paper)`) reads cleanly against dark background
- [ ] `.freedom-strip` backdrop blur looks right in dark mode
- [ ] `.region-coverage-note` border and background visible in dark

All these use CSS custom properties that already have dark-mode overrides in `:root[data-theme="dark"]`, so they should work automatically. Note any that don't.

---

## Step 5 — Build + commit

```bash
npm run build
```

Expected: zero errors.

```bash
git add app/globals.css
git commit -m "style: responsive rules for SS estimator, freedom strip, and coverage note"
```

Do not push — the planner handles all pushes.

---

## Agent Result
Status: (✅ Done / ⚠️ Partial / ❌ Blocked)
Completed:
Deviations:
Blockers:
Rate limit: (X% used, resets at HH:MM)
