# 🤖 Agent Prompt — CI/CD, Pre-commit & Tests Setup

## Context

You are working on **Pomotask**, a Pomodoro + task management app.
Phase 0 (project scaffold) is already complete. The stack is:

- React 18 + Vite + TypeScript (strict)
- TanStack Router, Query, Form, Table
- Dexie.js (IndexedDB), Zustand
- Tailwind CSS v4 + shadcn/ui
- pnpm as package manager
- Deployment target: **Cloudflare Pages**
- CI/CD: **GitHub Actions**

The following config files already exist in the repo. Your job is to wire them up correctly.

---

## Files already provided — DO NOT recreate, just use them

| File                           | Purpose                                               |
| ------------------------------ | ----------------------------------------------------- |
| `.github/workflows/ci.yml`     | GitHub Actions pipeline                               |
| `vitest.config.ts`             | Vitest + coverage config                              |
| `src/tests/setup.ts`           | Test setup (mocks for Dexie, Supabase, Audio)         |
| `src/tests/pomodoro.test.ts`   | Unit tests for split logic                            |
| `src/tests/timerStore.test.ts` | Unit tests for timer store                            |
| `.husky/pre-commit`            | Pre-commit hook (runs lint-staged)                    |
| `.husky/commit-msg`            | Commit message hook (runs commitlint)                 |
| `commitlint.config.js`         | Conventional commits config                           |
| `eslint.config.js`             | ESLint flat config (TypeScript strict)                |
| `package.json`                 | Scripts (`prepare`, `lint`, `test`, …)                |
| `lint-staged.config.mjs`       | lint-staged v15+ (globs → commands only; no `ignore`) |

---

## Your tasks — execute in this exact order

### Step 1 — Install dev dependencies

```bash
pnpm add -D \
  vitest @vitest/coverage-v8 @vitest/ui \
  @testing-library/react @testing-library/jest-dom @testing-library/user-event \
  jsdom \
  husky lint-staged \
  @commitlint/cli @commitlint/config-conventional \
  eslint @eslint/js typescript-eslint globals \
  eslint-plugin-react-hooks eslint-plugin-react-refresh \
  prettier
```

### Step 2 — Scripts in `package.json` + `lint-staged.config.mjs`

Add scripts to `package.json`. Add **`lint-staged.config.mjs`** with only **glob → command** entries (lint-staged v15+ rejects a top-level `ignore` key).

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --max-warnings 0 --no-warn-ignored",
    "lint:fix": "eslint . --fix",
    "typecheck": "tsc --noEmit",
    "test": "vitest",
    "test:run": "vitest run --coverage",
    "test:ui": "vitest --ui",
    "prepare": "husky"
  }
}
```

`lint-staged.config.mjs`: copy from this repo (eslint + tsc on `*.{ts,tsx}`, prettier on json/md/yml).

### Step 3 — Initialize Husky

```bash
pnpm exec husky init
```

Then verify that `.husky/pre-commit` and `.husky/commit-msg` match (Husky 9+; do **not** source `husky.sh` — removed in Husky 10):

**`.husky/pre-commit`**:

```sh
pnpm exec lint-staged
```

**`.husky/commit-msg`**:

```sh
#!/usr/bin/env sh
pnpm exec commitlint --edit "$1"
```

Make both files executable:

```bash
chmod +x .husky/pre-commit .husky/commit-msg
```

### Step 4 — Create src/lib/pomodoro.ts (needed by tests)

Create the file if it doesn't exist yet with at minimum:

```typescript
import type { Task, TaskStatus } from "@/types";

export const FOCUS_DURATION = 25 * 60; // 1500s
export const SHORT_BREAK = 5 * 60; // 300s
export const LONG_BREAK = 15 * 60; // 900s
export const POMODOROS_UNTIL_LONG_BREAK = 4;

export function shouldSplitTask(estimatedPomodoros: number): boolean {
  return estimatedPomodoros > 5;
}

export function splitTask(
  task: Omit<Task, "id" | "createdAt" | "updatedAt">,
): [Task, Task] {
  const half = Math.ceil(task.estimatedPomodoros / 2);
  const remainder = task.estimatedPomodoros - half;
  const now = Date.now();
  const base = {
    projectId: task.projectId,
    status: "pending" as TaskStatus,
    realPomodoros: 0,
  };
  return [
    {
      ...base,
      id: crypto.randomUUID(),
      name: `${task.name} (Part 1)`,
      estimatedPomodoros: half,
      createdAt: now,
      updatedAt: now,
    },
    {
      ...base,
      id: crypto.randomUUID(),
      name: `${task.name} (Part 2)`,
      estimatedPomodoros: remainder,
      createdAt: now,
      updatedAt: now,
    },
  ];
}
```

### Step 5 — Create src/stores/timerStore.ts (needed by tests)

Create the Zustand timer store. It must export `useTimerStore` and match the interface in `docs/SPECS.md`. The store must also export the timer constants (or re-export from `@/lib/pomodoro`).

### Step 6 — Set up GitHub Secrets

In your GitHub repo → Settings → Secrets and variables → Actions, add:

| Secret                   | Value                                                                                                 |
| ------------------------ | ----------------------------------------------------------------------------------------------------- |
| `CLOUDFLARE_API_TOKEN`   | From Cloudflare dashboard → My Profile → API Tokens → Create Token → "Edit Cloudflare Pages" template |
| `CLOUDFLARE_ACCOUNT_ID`  | From Cloudflare dashboard → right sidebar                                                             |
| `VITE_SUPABASE_URL`      | From Supabase project settings (optional, can be empty for now)                                       |
| `VITE_SUPABASE_ANON_KEY` | From Supabase project settings (optional, can be empty for now)                                       |

### Step 7 — Set up Cloudflare Pages project

1. Go to Cloudflare Dashboard → Workers & Pages → Create → Pages
2. Connect your GitHub repo
3. Set project name to `pomotask`
4. Build settings:
   - **Build command**: `pnpm build`
   - **Build output directory**: `dist`
   - **Node version**: `20`
5. Add env vars (same as GitHub secrets above)

> After this, the GitHub Actions workflow will deploy PRs as preview URLs and `main` branch as production.

### Step 8 — Verify everything works

Run these commands and confirm all pass:

```bash
# Types
pnpm typecheck

# Lint
pnpm lint

# Tests with coverage
pnpm test:run

# Build
pnpm build
```

Expected test results:

- `src/tests/pomodoro.test.ts` → 11 tests pass
- `src/tests/timerStore.test.ts` → 9 tests pass
- Coverage thresholds apply to `src/lib/pomodoro.ts` and `src/stores/timerStore.ts` (see `vitest.config.ts` `coverage.include`). Expand `include` as you add tested modules.

### Step 9 — Commit and push

```bash
git add .
git commit -m "ci: add GitHub Actions, pre-commit hooks, and unit tests"
git push origin main
```

Watch the Actions tab in GitHub — the pipeline should:

1. ✅ Type check
2. ✅ Lint
3. ✅ Tests
4. ✅ Build
5. ✅ Deploy to Cloudflare Pages

---

## Pipeline summary

```
Push to PR branch:
  quality (lint + typecheck) ──┐
  test (vitest + coverage)  ───┼──► build ──► deploy preview URL
                               │
Push to main:
  quality + test ──────────────┴──► build ──► deploy production
```

---

## Pre-commit summary

Every `git commit` runs:

1. **ESLint** with `--fix` on staged `.ts/.tsx` files
2. **TypeScript** type check (`tsc --noEmit`)
3. **Prettier** on `.json`, `.md`, `.yml` files
4. **Commitlint** validates commit message format

Valid commit formats:

```
feat: add timer ring component
fix: correct pomodoro split for odd numbers
chore: update dependencies
test: add timer store tests
```

---

## Troubleshooting

**Husky not running on commit?**

```bash
pnpm exec husky init
chmod +x .husky/pre-commit .husky/commit-msg
```

**Tests failing with Dexie error?**
Dexie is mocked in `src/tests/setup.ts`. Make sure `vitest.config.ts` points `setupFiles` to `./src/tests/setup.ts`.

**Cloudflare deploy failing?**
Check that `CLOUDFLARE_API_TOKEN` has "Edit Cloudflare Pages" permissions and `CLOUDFLARE_ACCOUNT_ID` is correct.

**`wrangler-action`: Unable to locate executable file: pnpm?**
Deploy jobs must run `pnpm/action-setup` and `actions/setup-node` before `cloudflare/wrangler-action@v3` (the action installs Wrangler with the detected package manager; `pnpm` is not on the PATH by default on a fresh runner).

**TypeScript errors in ESLint?**
Make sure `parserOptions.project` in `eslint.config.js` points to your `tsconfig.json`.

**Commitlint rejects your message?**
Use `type: description` where **type** is one of: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `test`, `perf`, `ci`, `revert`. The word before the first `:` must be a type, not a free label — e.g. `chore: align ci and specs`, not `configuration: …`. See [Conventional Commits](https://www.conventionalcommits.org/).

**Git warns about ignored `dist/`?**
Do not stage `dist/` (it is gitignored). Run `git reset HEAD dist` if it was added by mistake.
