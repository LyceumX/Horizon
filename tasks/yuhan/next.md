## Agent Result
Status: (✅ Done / ⚠️ Partial / ❌ Blocked)
Completed:
Deviations:
Blockers:

---

# Task B: Create app/cn/page.tsx and app/global/page.tsx

**Branch:** `refactor/cn-global-split`
**Prerequisite:** `app/cn/layout.tsx` and `app/global/layout.tsx` must exist (Task A done).
**Verify:** `localhost:4000/cn` shows Mandarin. `localhost:4000/global` shows English. `npm run build` passes.

---

## Create `app/cn/page.tsx`

1. Copy the full contents of `app/page.tsx` into a new file `app/cn/page.tsx`
2. Remove these import lines:
   ```ts
   import { GLOBAL_REGIONS } from "@/lib/data/regions-global";
   import { GLOBAL_COPY } from "@/lib/copy/global";
   ```
3. Find and replace these two lines:
   ```ts
   const COPY: Record<Language, Copy> = { en: GLOBAL_COPY, zh: CN_COPY };
   const REGIONS: CountryOption[] = [...CN_REGIONS, ...GLOBAL_REGIONS];
   ```
   With:
   ```ts
   const copy = CN_COPY;
   const REGIONS: CountryOption[] = CN_REGIONS;
   ```
4. Find every `COPY[language]` in the file and replace with `copy`
5. Delete the language state: `const [language, setLanguage] = useState<"zh" | "en">("zh")`
6. Delete the `type Language = "en" | "zh"` line
7. Delete any language toggle button or `setLanguage` call in the JSX
8. Run `npm run build` — fix any TypeScript errors before continuing

---

## Create `app/global/page.tsx`

1. Copy the full contents of `app/page.tsx` into a new file `app/global/page.tsx`
2. Remove these import lines:
   ```ts
   import { CN_REGIONS } from "@/lib/data/regions-cn";
   import { CN_COPY } from "@/lib/copy/cn";
   ```
3. Find and replace these two lines:
   ```ts
   const COPY: Record<Language, Copy> = { en: GLOBAL_COPY, zh: CN_COPY };
   const REGIONS: CountryOption[] = [...CN_REGIONS, ...GLOBAL_REGIONS];
   ```
   With:
   ```ts
   const copy = GLOBAL_COPY;
   const REGIONS: CountryOption[] = GLOBAL_REGIONS;
   ```
4. Find every `COPY[language]` in the file and replace with `copy`
5. Delete the language state: `const [language, setLanguage] = useState<"zh" | "en">("zh")`
6. Delete the `type Language = "en" | "zh"` line
7. Delete any language toggle button or `setLanguage` call in the JSX
8. Run `npm run build` — fix any TypeScript errors
