# US data expansion + QA pass

**Branch:** `main`
**Repo:** `/Users/ianxie/GitHub/Horizon`
**Depends on:** Codi's task (US unlock) — pull after Codi commits.

Two tasks. Task A is mechanical data entry in one file. Task B is a browser QA checklist — no code required, just note any issues.

---

## Pre-flight

```bash
cd /Users/ianxie/GitHub/Horizon
git pull origin main
npm run dev   # confirm site loads at localhost:3000
```

---

## Task A: Expand US state + city data

Open `lib/data/regions-global.ts`. Find the US entry (value: "us"). After Codi's task it will have California, New York, Texas, Illinois, Washington (5 states). Add these four more:

```ts
      { value: "florida", label: { en: "Florida", zh: "佛罗里达" }, cities: [
        { value: "miami",  label: { en: "Miami",  zh: "迈阿密" }, insurance: ins.us },
        { value: "tampa",  label: { en: "Tampa",  zh: "坦帕"   }, insurance: ins.us },
      ]},
      { value: "massachusetts", label: { en: "Massachusetts", zh: "马萨诸塞" }, cities: [
        { value: "boston", label: { en: "Boston", zh: "波士顿" }, insurance: ins.us },
      ]},
      { value: "colorado", label: { en: "Colorado", zh: "科罗拉多" }, cities: [
        { value: "denver", label: { en: "Denver", zh: "丹佛" }, insurance: ins.us },
      ]},
      { value: "georgia", label: { en: "Georgia", zh: "佐治亚" }, cities: [
        { value: "atlanta", label: { en: "Atlanta", zh: "亚特兰大" }, insurance: ins.us },
      ]},
```

Insert them between the Washington entry and the closing `],` of the US provinces array.

Also expand California (currently San Francisco + Los Angeles only). Add two more cities to the California entry:

```ts
        { value: "san-diego", label: { en: "San Diego",       zh: "圣地亚哥" }, insurance: ins.us },
        { value: "san-jose",  label: { en: "San Jose",        zh: "圣何塞"   }, insurance: ins.us },
```

And expand New York (currently only NYC). Add:

```ts
        { value: "buffalo",  label: { en: "Buffalo",  zh: "布法罗" }, insurance: ins.us },
        { value: "albany",   label: { en: "Albany",   zh: "奥尔巴尼"}, insurance: ins.us },
```

**Build check:**

```bash
npm run build
```

**Commit:**

```bash
git add lib/data/regions-global.ts
git commit -m "data: expand US states and cities (9 states, 16 cities total)"
```

---

## Task B: US flow QA checklist

Open the dev server (`npm run dev`) and run through this checklist on the global site (localhost:3000/global). Note any visual bugs, copy issues, or broken interactions.

### B1 — Country selection
- [ ] United States appears in the Country dropdown and is selectable (not greyed out)
- [ ] Selecting US shows state + city selectors
- [ ] Retirement category shows Male / Female (not Chinese labor-law labels)
- [ ] The `region-coverage-note` mentions US as supported, UK as coming soon
- [ ] The `field-hint` below the Country selector disappears after Codi's task (previously said "US rules coming soon")

### B2 — Social Security estimator
- [ ] With US selected, the pension income slider is replaced by the SS estimator card
- [ ] Salary slider: $80k, 20 yrs worked → FRA benefit should be ~$1,400–1,800/mo (reasonable range)
- [ ] Claim-age buttons work: clicking 62 / 67 / 70 changes the selected amount and updates the projected year + nest egg
- [ ] The projection card Row 2 shows the SS offset amount in the subtitle when SS > 0
- [ ] The Required Nest Egg drops when SS benefit increases (e.g., compare 10 yrs worked vs 30 yrs)
- [ ] Flip animation triggers when claim age changes (after Codi's projectionVersion fix)

### B3 — 401(k) / IRA section
- [ ] Section is visible only when country = US (not visible for China, Germany, etc.)
- [ ] Toggle expands/collapses correctly
- [ ] Sliders for balance, contribution, match % all update the projection numbers
- [ ] "Compound growth" line shows in accent colour
- [ ] Numbers are plausible: $50k balance + $6k/yr + 4% match on $100k salary + 7% return over 15 years ≈ $260k–$290k projected

### B4 — Healthcare bridge
- [ ] Only appears when projected retirement age < 65
- [ ] Adjust spend upward until yearsToGoal is low enough that retirement age < 65 — bridge panel should appear
- [ ] ACA premium estimate and total bridge cost display correctly
- [ ] Set country to Germany — bridge should NOT appear (gated to US)

### B5 — Sticky freedom strip
- [ ] Visible at bottom on desktop and mobile
- [ ] Updates when sliders move
- [ ] Doesn't overlap nav

### B6 — Stories grid
- [ ] All 7 stories display (4 Asia + 3 US)
- [ ] No layout overflow on mobile (stories should stack)

**Outcome:** Write up any issues found as bullet points below. If all checks pass, note that.

### QA notes:
(fill in after running the checklist)

---

## Agent Result
Status: (✅ Done / ⚠️ Partial / ❌ Blocked)
Completed:
Issues found:
