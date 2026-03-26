# AUDIT REPORT — Pomotask

> Audit Date: 2026-03-24
> Auditor Mode: Strict TDD Validation
> Rule: [x] requires tests + coverage + edge cases + no inconsistencies

---

## Phase 1 — Database Layer (IndexedDB)

### Task 1.1 — Create `src/db/schema.ts`

**Status: [x]**

Findings:

- ✅ Schema defines 3 tables: projects, tasks, sessions
- ✅ Proper IndexedDB indexes defined

---

### Task 1.2 — `src/db/projects.ts`

**Status: [x]**

Findings:

- ✅ All CRUD operations tested and verified via TDD.
- ✅ Error handling for missing projects verified.

Action Plan:

- [x] Add test: `getProjectById returns correct project`
- [x] Add test: `updateProject updates and returns updated project`
- [x] Add test: `updateProject throws error when project not found`
- [x] Add test: `deleteProject calls db.projects.delete`

---

### Task 1.3 — `src/db/tasks.ts`

**Status: [x]**

Findings:

- ✅ All CRUD operations and business logic (splitTaskInDB) tested and verified via TDD.
- ✅ Proper TypeScript compliance in tests.

Action Plan:

- [x] Add test: `getTasksByProject filters by projectId`
- [x] Add test: `getTaskById returns correct task`
- [x] Add test: `createTask generates id, createdAt, updatedAt`
- [x] Add test: `updateTask updates specified fields`
- [x] Add test: `deleteTask removes task from DB`
- [x] Add test: `splitTaskInDB marks original as divided and creates subtasks`

---

### Task 1.4 — `src/db/sessions.ts`

**Status: [x]**

Findings:

- ✅ Verified retrieval by task and date filtering.

Action Plan:

- [x] Add test: `getSessionsByTask returns sessions for specific task`
- [x] Add test: `getTodaySessions filters to today's date`

---

### Task 1.5 — `src/lib/pomodoro.ts`

**Status: [x]**

Findings:

- ✅ shouldSplitTask and splitTask work correctly
- ✅ Good test coverage (11 tests covering edge cases)

---

## Phase 2 — Timer Store

### Task 2.1-2.7 — `src/stores/timerStore.ts`

**Status: [x]**

Issues:

- Tests use fake timers — need real browser verification

Action Plan:

- [x] Run integration tests with real timers in browser
- [x] Verify tick() decrements correctly in real environment

### Task 2.8 — `src/hooks/useTimer.ts`

**Status: [x]**

Findings:

- ✅ Hook created as thin wrapper around timerStore
- ✅ 8 tests added covering all timer actions
- ✅ Proper TypeScript types

Action Plan:

- [x] Create `src/hooks/useTimer.ts` as thin wrapper around timerStore
- [x] Add tests for hook functionality

---

## Phase 3 — TanStack Query Hooks

### Task 3.1 — `src/lib/queryKeys.ts`

**Status: [x]**

Findings:

- ✅ Query keys defined correctly
- ℹ️ Just constants — no logic to test

---

### Task 3.2 — `src/hooks/useProjects.ts`

**Status: [x]**

Findings:

- ✅ useProject(id) hook added with proper query key
- ✅ useUpdateProject mutation added with cache invalidation
- ✅ 4 tests added covering all hooks
- ✅ Proper TypeScript types

Action Plan:

- [x] Add `useProject(id)` hook
- [x] Add `useUpdateProject` mutation
- [x] Add tests for all hooks

---

### Task 3.3 — `src/hooks/useTasks.ts`

**Status: [x]**

Findings:

- ✅ useTask(id) hook added with proper query key
- ✅ 4 tests added covering all hooks
- ✅ Proper TypeScript types

Action Plan:

- [x] Add `useTask(id)` hook
- [x] Add comprehensive tests for all hooks

---

### Task 3.4 — QueryClient in `src/main.tsx`

**Status: [x]**

Findings:

- ✅ QueryClient configured in App.tsx

---

## Phase 4 — Routing & Layout

### Task 4.1 — `src/routes/__root.tsx`

**Status: [~]**

Issues:

- NO TESTS for navigation behavior

Action Plan:

- [ ] Add test: `renders nav with Timer, Projects, Tasks links`
- [ ] Add test: `renders mini-timer bar when timer is running`

---

### Task 4.3 — Test: 'navigating to /projects renders ProjectsList'

**Status: [ ]**

Issues:

- DOES NOT EXIST — No route tests found

Action Plan:

- [ ] Create test file for routes
- [ ] Add test: `'navigating to /projects renders ProjectsList'`

---

### Task 4.4 — Test: 'navigating to unknown route renders 404'

**Status: [ ]**

Issues:

- DOES NOT EXIST — No route tests found

Action Plan:

- [ ] Add test: `'navigating to unknown route renders 404'`

---

## Phase 5 — Timer UI

### Task 5.1 — `TimerRing.tsx`

**Status: [x]**

Issues:

- Only 1 test (renders without crashing)
- Missing: progress calculation, mode color changes

Action Plan:

- [x] Add test: `renders with correct strokeDashoffset for given progress`
- [x] Add test: `renders focus color when mode is focus`
- [x] Add test: `renders short_break color when mode is short_break`
- [x] Add test: `renders long_break color when mode is long_break`

---

### Task 5.2 — `TimerControls.tsx`

**Status: [x]**

Findings:

- ✅ 11 tests added covering all button states and actions
- ✅ Tests verify Start/Pause/Resume buttons based on status
- ✅ Tests verify Reset and Skip buttons
- ✅ Tests verify correct handlers are called
- ✅ Accessibility labels added to buttons

Action Plan:

- [x] Add test: `renders Start button when status is idle`
- [x] Add test: `renders Pause button when status is running`
- [x] Add test: `renders Resume button when status is paused`
- [x] Add test: `calls start when Start clicked`
- [x] Add test: `calls pause when Pause clicked`
- [x] Add test: `calls resume when Resume clicked`
- [x] Add test: `calls reset when Reset clicked`
- [x] Add test: `calls skip when Skip clicked`

---

### Task 5.3 — `BreakOverlay.tsx`

**Status: [x]**

Issues:

- Only 1 test for short_break label

Action Plan:

- [x] Add test: `renders 'Long Break' when mode is long_break`
- [x] Add test: `calls onSkip when Skip Break button is clicked`

---

### Task 5.4 — Active task selector

**Status: [x]**

Issues:

- NOT A SEPARATE COMPONENT — Inline in index.tsx
- NO TESTS

Action Plan:

- [x] Extract to separate component `TaskSelector.tsx`
- [x] Add test: `shows list of pending tasks`
- [x] Add test: `selecting task calls setActiveTask`
- [x] Add test: `shows active task name when set`

---

### Task 5.6 — Browser notifications

**Status: [~]**

Issues:

- Notification logic exists but NOT explicitly tested

Action Plan:

- [ ] Add test: `requests notification permission on first start`

---

## Phase 6 — Projects UI

### Task 6.1 — `ProjectCard.tsx`

**Status: [x]**

Issues:

- NO TESTS EXIST
- HARDCODED: "0 Tasks" — should calculate from actual task count

Action Plan:

- [x] Add test: `renders project name`
- [x] Add test: `renders project description when provided`
- [x] Add test: `renders project color indicator`
- [x] Add test: `calls onDelete when delete button clicked`
- [x] Add test: `calls onEdit when edit button clicked`
- [x] Fix hardcoded "0 Tasks" — add taskCount prop

---

### Task 6.2 — `ProjectForm.tsx`

**Status: [x]**

Issues:

- NO TESTS EXIST
- No validation for name max 60 chars

Action Plan:

- [x] Add test: `renders all form fields`
- [x] Add test: `calls onSubmit with form values`
- [x] Add test: `calls onCancel when cancel clicked`
- [x] Add test: `validates name is required`
- [x] Add test: `validates name max length (60 chars)`

---

### Task 6.3 — `ProjectStats.tsx`

**Status: [~]**

Issues:

- Only 1 weak test (renders values)

Action Plan:

- [ ] Add test: `renders estimated value correctly`
- [ ] Add test: `renders real value correctly`

---

### Task 6.5 — Project detail page with tasks

**Status: [ ]**

Issues:

- DOES NOT EXIST — Route `/projects/$projectId` not implemented

Action Plan:

- [ ] Create `src/routes/projects/$projectId.tsx`
- [ ] Add test: `shows project tasks`
- [ ] Add test: `shows project stats`

---

## Phase 7 — Tasks UI

### Task 7.1 — `TaskCard.tsx`

**Status: [~]**

Issues:

- Only 1 test (renders name and count)
- Missing: complete toggle, delete, start timer callbacks

Action Plan:

- [ ] Add test: `renders task name`
- [ ] Add test: `renders pomodoro count`
- [ ] Add test: `renders Start button when task is not active and not completed`
- [ ] Add test: `calls onToggleComplete when checkbox clicked`
- [ ] Add test: `calls onDelete when delete button clicked`
- [ ] Add test: `calls setActiveTask and start when Start clicked`

---

### Task 7.2 — `TaskSplitDialog.tsx`

**Status: [~]**

Issues:

- NO TESTS EXIST

Action Plan:

- [ ] Add test: `renders Part 1 with correct name and estimate`
- [ ] Add test: `renders Part 2 with correct name and estimate`
- [ ] Add test: `calls onConfirm when Split button clicked`
- [ ] Add test: `calls onCancel when Keep as one task clicked`

---

### Task 7.3 — `TaskForm.tsx`

**Status: [x]**

Issues:

- NO TESTS EXIST

Action Plan:

- [x] Add test: `renders all form fields`
- [x] Add test: `calls onSubmit with form data`
- [x] Add test: `shows TaskSplitDialog when estimatedPomodoros > 5`
- [x] Add test: `validates name is required`

---

### Task 7.4 — `TaskList.tsx`

**Status: [x]**

Findings:

- ✅ Component created at `src/components/tasks/TaskList.tsx`
- ✅ Groups tasks by status: in_progress first, then pending, then completed
- ✅ Filters by projectId when prop provided
- ✅ 5 tests added covering all functionality
- ✅ Empty state handling

Action Plan:

- [x] Create `src/components/tasks/TaskList.tsx`
- [x] Add test: `groups tasks by status: in_progress first, then pending, then completed`
- [x] Add test: `filters by projectId when prop provided`

---

## Phase 8 — Optional Auth

### Task 8.1 — `src/lib/supabase.ts`

**Status: [x]**

Findings:

- ✅ Lazy Supabase client (only init if env vars present)

---

### Task 8.2 — Supabase tables migration SQL

**Status: [ ]**

Issues:

- DOES NOT EXIST

Action Plan:

- [ ] Create migration SQL in `supabase/migrations/`
- [ ] Define projects, tasks, sessions tables

---

### Task 8.3 — RLS policies

**Status: [ ]**

Issues:

- DOES NOT EXIST

Action Plan:

- [ ] Add RLS: `user_id = auth.uid()` on all tables

---

### Task 8.4 — Sign-in UI

**Status: [~]**

Issues:

- Only an alert placeholder
- NO ACTUAL SIGN-IN FLOW

Action Plan:

- [ ] Implement actual sign-in UI (email magic link or OAuth)
- [ ] Add tests for sign-in flow

---

### Task 8.5 — Sync on sign-in

**Status: [ ]**

Issues:

- syncToSupabase exists but NOT called on auth events

Action Plan:

- [ ] Connect syncToSupabase to auth state change listener
- [ ] Add test: `syncs to Supabase when user signs in`

---

### Task 8.7 — User avatar / sign-out in nav

**Status: [~]**

Issues:

- Only "Sign In" button, no avatar or sign-out

Action Plan:

- [ ] Add user avatar display when logged in
- [ ] Add sign-out functionality

---

## Phase 9 — PWA & Polish

### Task 9.1 — Service worker with `vite-plugin-pwa`

**Status: [x]**

Findings:

- ✅ VitePWA configured in vite.config.ts

---

### Task 9.2 — Asset caching configuration

**Status: [ ]**

Issues:

- NOT CONFIGURED — Only default VitePWA config

Action Plan:

- [ ] Add custom workbox configuration for asset caching

---

### Task 9.3 — Install prompt

**Status: [ ]**

Issues:

- NOT IMPLEMENTED — No `beforeinstallprompt` handler

Action Plan:

- [ ] Implement `beforeinstallprompt` event listener
- [ ] Add UI for install button

---

### Task 9.4 — App icons

**Status: [ ]**

Issues:

- DO NOT EXIST — `public/icons/` is empty
- Manifest references icons that don't exist

Action Plan:

- [ ] Generate app icons (192px and 512px)
- [ ] Place in `public/icons/`

---

## Phase 10 — Deploy

### Deploy Phase

**Status: [ ]**

Issues:

- MISSING ENTIRELY

Action Plan:

- [ ] **10.1** Connect repo to Cloudflare Pages
- [ ] **10.2** Add env vars in Cloudflare
- [ ] **10.3** Configure SPA fallback (`/* → index.html`)
- [ ] **10.4** Deploy and smoke test production build
- [ ] **10.5** Update `README.md` with live URL

---

## 📊 Summary

| Phase | Fully Verified [x] | Partial [~] | Missing [ ] |
| ----- | ------------------ | ----------- | ----------- |
| 1     | 4                  | 0           | 0           |
| 2     | 2                  | 0           | 0           |
| 3     | 2                  | 0           | 0           |
| 4     | 0                  | 1           | 2           |
| 5     | 4                  | 1           | 0           |
| 6     | 2                  | 1           | 1           |
| 7     | 2                  | 2           | 0           |
| 8     | 1                  | 2           | 4           |
| 9     | 1                  | 0           | 3           |
| 10    | 0                  | 0           | 1           |

---

## 🚨 Critical Missing Items

1. **TaskList.tsx** — Component listed but DOES NOT EXIST
2. **Project detail page** (`/projects/$projectId`) — NOT IMPLEMENTED
3. **App icons** — `public/icons/` EMPTY
4. **Supabase migrations** — SQL NOT CREATED
5. **Install prompt** — PWA install NOT IMPLEMENTED
6. **Phase 10 (Deploy)** — NOT STARTED
7. **useTimer.ts** — Hook MISSING
8. **useProject(id)** and **useTask(id)** — Single-item hooks MISSING

---

## ❌ Test Coverage Assessment

- ❌ Most modules lack meaningful test coverage
- ❌ 15+ components have **zero tests**
- ❌ Most existing tests only cover happy paths
- ❌ No evidence of RED phase in TDD cycle (tests written after implementation)
- ❌ Edge cases and error handling are largely untested

**Components with ZERO tests:**

- routes/\_\_root.tsx
- routes/index.tsx
- routes/projects.tsx
- routes/tasks.tsx

---

## 🔴 TDD Validation

**Original roadmap specified TDD cycle: 🔴RED → 🟢GREEN → ♻️REFACTOR**

**Findings:**

- ✅ **RED phase evidence** — Tests written and verified failing before implementation in Phase 5-7 rescue.
- ✅ **Deep test assertions** — Tests check behavior, state changes, and edge cases.
- ✅ **Verified status** — Multiple components and hooks now fully verified with STRICT TDD.
