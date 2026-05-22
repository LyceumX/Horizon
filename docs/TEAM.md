# Team

## Agent Roster

| Agent | Tool | Model | OS | Repo path | Role |
|-------|------|-------|-----|-----------|------|
| **Ian** | VSC (Codex) | GPT-5.2 Codex | Mac | `/Users/ianxie/GitHub/Horizon` | Builder — big trunk tasks |
| **Yuhan** | VSC | Haiku | Windows | `C:\Users\ianxi\GitHub\Horizon` | Builder — focused/contained tasks |
| **Codi** | Hermes | GLM 5.1 | Mac | `/Users/ianxie/GitHub/Horizon` | Builder — data, plumbing, verification |
| **Claude** | Claude Code | Sonnet/Opus | Mac | `/Users/ianxie/GitHub/Horizon` | Planning, management, task authoring |

**Ian** handles all git pushes. No agent should push to `origin/main` — commit only.

---

## Task Assignment Rules

### Ian (GPT-5.2 Codex · Mac · VSC)
Repo: `/Users/ianxie/GitHub/Horizon`

Best for:
- Large trunk features: new pages, complete section rewrites, complex multi-file refactors
- Algorithm implementations that span multiple files
- Infrastructure changes (routing, middleware, Supabase schema)
- Tasks that require understanding the full codebase context

Avoid:
- Tasks split across many small isolated changes — Ian works better with one coherent trunk

### Yuhan (Haiku · Windows · VSC)
Repo: `C:\Users\ianxi\GitHub\Horizon`

Best for:
- Self-contained UI polish (CSS tweaks, layout fixes, small components)
- Single-file additions: disclaimer lines, what-if rows, responsive breakpoints
- Tasks clearly described with exact before/after code snippets
- Verify-and-commit passes (build check + commit an existing changeset)

Avoid:
- Tasks requiring cross-file reasoning or algorithm design
- Tasks with more than 2–3 files in scope
- Open-ended investigation or QA
- Tasks that reference Mac file paths (`/Users/ianxie/...`) — use Windows paths instead

### Codi (GLM 5.1 · Hermes · Mac)
Best for:
- Data file expansions (regions, city lists, insurance presets)
- Build verification and QA passes
- Algorithm plumbing (wiring a new function into an existing hook/useMemo)
- Cron automation and scripting
- Tasks with clear inputs/outputs and no design decisions

Avoid:
- Tasks requiring UX judgment or product decisions
- Large novel implementations

### Claude
- Works directly with Ian to plan sprints, write task specs, and make product decisions
- Does NOT execute build tasks unless Ian explicitly assigns them
- Writes all task files for the three builder agents
- Owns all documentation in `docs/`

---

## Task File Protocol

### Location
```
tasks/ian/current.md      ← Ian's active task
tasks/yuhan/current.md    ← Yuhan's active task
tasks/codi/current.md     ← Codi's active task
```

One task file per agent. Overwrite with the new task when the previous one is complete.

### Required Structure

```markdown
# [Short task title]

**Branch:** main
**Repo:** `/Users/ianxie/GitHub/Horizon` — Ian, Codi, Claude (Mac)
          `C:\Users\ianxi\GitHub\Horizon` — Yuhan (Windows)
**Files:** [list the specific files in scope]

[1-sentence summary of what's already done vs what needs to happen]
Do **not** push — Ian handles all pushes.

---

## Pre-flight

\`\`\`bash
cd /path/to/Horizon
git pull origin main
npm run build   # must be green before you start
\`\`\`

---

## Task [N] — [Name]

### [What changed / What to do]
[Exact code snippet or clear instructions]

### Verify
[Checklist: visual check, tsc, build]

### Commit
\`\`\`bash
npm run build
npx tsc --noEmit
git add [files]
git commit -m "[type(scope): message]"
\`\`\`

---

## Agent Result

Status: (✅ Done / ⚠️ Partial / ❌ Blocked)
Completed:
Deviations:
Blockers:
```

### Rules
- Always include `Pre-flight` with `git pull` + `npm run build`
- Always include `npx tsc --noEmit` before committing
- Always include `git add [specific files]` — never `git add .`
- Never include `git push` in a task file
- The `Agent Result` section must be filled in before the task is considered done

---

## Commit Message Format

```
type(scope): short imperative description

Examples:
feat(cn): add pension disclaimer line below result card
feat(sg): full CPF algorithm — 2026 rates, age-banded allocation
fix(hero-callout): inline example tag with callout-line-tagged
style(cn): responsive breakpoints for pension form, stats card
data: expand US states and cities (9 states, 16 cities total)
```

**Types:** `feat` · `fix` · `style` · `data` · `refactor` · `docs` · `chore`

**Scopes:** `cn` · `global` · `sg` · `hk` · `au` · `us` · `hero-callout` · `planner` · `pension` · `auth`

---

## Sprint Rhythm

1. Ian and Claude plan the next batch of tasks in a Claude Code session
2. Claude writes task files for Ian, Yuhan, Codi
3. Builders work independently and fill in `Agent Result`
4. Ian reviews and pushes completed commits
5. Claude reviews outputs and plans next batch

No agent waits on another unless `**Depends on:**` is specified in the task file.
