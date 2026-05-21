## Agent Result
Status: (✅ Done / ⚠️ Partial / ❌ Blocked)
Completed:
Deviations:
Blockers:
Rate limit: (X% used, resets at HH:MM)

---

# Phase 2 follow-up: CSS for new UI elements

**Branch:** `feat/phase2-planner-core`
**Repo:** `/Users/ianxie/GitHub/Horizon` (Mac)
**⚠️ Start ONLY after `tasks/codi/current.md` shows Status: ✅ Done**

Phase 2 added a scenario toggle, new input fields, and an assumptions panel to both the CN and Global pages. These elements have no CSS yet. This task adds the styles to `app/globals.css`.

---

## Pre-flight

```bash
git checkout feat/phase2-planner-core
git pull origin feat/phase2-planner-core
```

---

## Overview of new classes needed

| Class | What it is |
|---|---|
| `.scenario-toggle` | Flex row container holding 3 scenario buttons |
| `.scenario-btn` | Individual scenario button (ghost pill, inactive state) |
| `.scenario-btn-active` | Active scenario button (filled dark) |
| `.assumptions-fold` | Collapsible `<details>` panel — same pattern as `.insurance-fold` |
| `.assumptions-grid` | 3-column grid inside the fold showing return rate / inflation / multiplier |
| `.assumption-item` | Single row: label on left, bold value on right |

---

## Step 1 — Add CSS to `app/globals.css`

Open `app/globals.css`. Locate the `@media (max-width: 680px)` block near the bottom of the file (currently last block). Insert the following CSS block **immediately before** that `@media` block.

```css
/* ── Scenario toggle ──────────────────────────────────────────── */

.scenario-toggle {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.scenario-btn {
  appearance: none;
  border: 0.5px solid var(--line);
  border-radius: 999px;
  background: transparent;
  color: var(--ink);
  padding: 9px 16px;
  font: 500 11px var(--mono);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
  transition: transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease, background 140ms ease, color 140ms ease;
}

.scenario-btn:hover,
.scenario-btn:focus-visible {
  border-color: color-mix(in srgb, var(--btn-ghost-border) 70%, var(--accent));
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(36, 30, 20, 0.10);
}

.scenario-btn-active {
  background: var(--ink);
  color: var(--paper);
  border-color: var(--ink);
  box-shadow: 0 6px 16px rgba(36, 30, 20, 0.18);
}

.scenario-btn-active:hover,
.scenario-btn-active:focus-visible {
  transform: translateY(-1px);
  box-shadow: 0 10px 22px rgba(36, 30, 20, 0.22);
}


/* ── Assumptions fold ─────────────────────────────────────────── */

.assumptions-fold {
  border: 0.5px solid var(--line);
  border-radius: 18px;
  padding: 16px 18px;
  background: color-mix(in srgb, var(--paper-2) 72%, transparent);
  margin-top: 12px;
}

.assumptions-fold summary {
  list-style: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.assumptions-fold summary::-webkit-details-marker {
  display: none;
}

.assumptions-fold .fold-label,
.assumptions-fold .fold-hint {
  display: block;
  font: 500 10px var(--mono);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--mute);
}

.assumptions-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px 16px;
  margin-top: 14px;
}

.assumption-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.assumption-item span {
  font: 400 10px var(--mono);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--mute);
}

.assumption-item strong {
  font-family: var(--serif);
  font-style: italic;
  font-size: 18px;
  color: var(--ink);
}
```

---

## Step 2 — Add responsive rules inside the existing `@media (max-width: 860px)` block

Find the existing `@media (max-width: 860px)` block. Inside it, at the end (before its closing `}`), add:

```css
  .assumptions-grid {
    grid-template-columns: repeat(3, 1fr);
  }
```

---

## Step 3 — Build check

```bash
npm run build
```

Expected: build succeeds with no new errors.

---

## Step 4 — Commit and push

```bash
git add app/globals.css
git commit -m "feat: add CSS for scenario toggle and assumptions panel"
git push origin feat/phase2-planner-core
```

---

Write Agent Result when done.
