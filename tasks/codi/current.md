## Agent Result
Status: (✅ Done / ⚠️ Partial / ❌ Blocked)
Completed:
Deviations:
Blockers:
Rate limit: (N/A — Codi is a Hermes agent)

---

# Codi Task 1: Create app/cn/page.tsx and app/global/page.tsx

**Branch:** `refactor/cn-global-split`
**Repo:** `/Users/ianxie/GitHub/Horizon`
**Protocol:** Ian has already approved this plan. Execute now.

Pull the branch first to pick up Yuhan's layouts:
```bash
git checkout refactor/cn-global-split
git pull origin refactor/cn-global-split
```

---

## Create `app/cn/page.tsx`

1. Copy full contents of `app/page.tsx` → new file `app/cn/page.tsx`
2. Remove: `import { GLOBAL_REGIONS } from "@/lib/data/regions-global"`
3. Remove: `import { GLOBAL_COPY } from "@/lib/copy/global"`
4. Replace:
   ```ts
   const COPY: Record<Language, Copy> = { en: GLOBAL_COPY, zh: CN_COPY };
   const REGIONS: CountryOption[] = [...CN_REGIONS, ...GLOBAL_REGIONS];
   ```
   With:
   ```ts
   const copy = CN_COPY;
   const REGIONS: CountryOption[] = CN_REGIONS;
   ```
5. Replace all `COPY[language]` → `copy`
6. Delete: `type Language = "en" | "zh"`
7. Delete: `const [language, setLanguage] = useState<"zh" | "en">("zh")`
8. Delete language toggle UI and `setLanguage` calls in JSX
9. Delete PreferenceSync component and its render call
10. Delete useEffect that reads/writes `horizon-language` from localStorage/cookie
11. Replace `language === "zh"` → `true`, `language === "en"` → `false`, then simplify ternaries
12. Replace `language` literal in projectionVersion string and saveCloud body → `"zh"`
13. Run `npm run build` — fix any TypeScript errors before continuing

---

## Create `app/global/page.tsx`

Same process mirrored:
1. Copy full contents of `app/page.tsx` → new file `app/global/page.tsx`
2. Remove: `import { CN_REGIONS } from "@/lib/data/regions-cn"`
3. Remove: `import { CN_COPY } from "@/lib/copy/cn"`
4. Replace with:
   ```ts
   const copy = GLOBAL_COPY;
   const REGIONS: CountryOption[] = GLOBAL_REGIONS;
   ```
5. Replace all `COPY[language]` → `copy`
6. Delete same language state, toggle, effects, PreferenceSync
7. Replace `language === "zh"` → `false`, `language === "en"` → `true`, simplify ternaries
8. Replace `language` literal → `"en"`
9. Run `npm run build` — fix TypeScript errors

---

## Commit

```bash
git add app/cn/page.tsx app/global/page.tsx
git commit -m "refactor: add cn and global page files"
git push origin refactor/cn-global-split
```

Write Agent Result when done.
