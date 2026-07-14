---
phase: 260715-0qr-load-table-createdat-loadtabledetail-cre
plan: 01
subsystem: ui
tags: [load-table, zustand, calendar, week-schedule, prefill]

requires:
  - phase: 260715-052-16-xlsx-max-body-metrics-editable
    provides: load-table entity, schedule, LoadTableDetail/WeekGrid
provides:
  - getLoadTableCurrentWeek session→week math since createdAt
  - getPlanSetsForWeek three identical plan sets
  - resetExerciseProgress via createdAt
  - Track/Reset UX in LoadTableDetail with week highlight
affects: [load-table, calendar day logging]

tech-stack:
  added: []
  patterns:
    - Derive current week from journal sessions (not persisted field)
    - Sync selected-day sets from load-table plan on explicit Track

key-files:
  created:
    - src/entities/loadTable/lib/getLoadTableCurrentWeek.ts
    - src/entities/loadTable/lib/getPlanSetsForWeek.ts
  modified:
    - src/entities/loadTable/slice/loadTableStore.ts
    - src/entities/loadTable/index.ts
    - src/entities/calendarDay/slice/calendarStore.ts
    - src/features/loadTable/ui/LoadTableWeekGrid.tsx
    - src/features/loadTable/ui/LoadTableDetail.tsx

key-decisions:
  - "Week = min(16, floor(sessionCount/2)+1) from sessions with weight/reps > 0 since createdAt"
  - "Track fully replaces sets to exactly 3 plan values on selected day (beginner-predictable)"
  - "Reset only updates createdAt; journal rows untouched"

patterns-established:
  - "Load-table week counter is ephemeral and recomputed from journal + createdAt"
  - "Prefill into calendar only via explicit Track; never invent missing exercise cards"

requirements-completed: [QUICK-0QR-01]

coverage:
  - id: D1
    description: Current week derived from post-createdAt session count
    requirement: QUICK-0QR-01
    verification:
      - kind: other
        ref: "pnpm exec tsc --noEmit -p tsconfig.app.json (no errors in loadTable helpers)"
        status: pass
    human_judgment: true
    rationale: Session math needs smoke with real journal data (0/2/3 sessions)
  - id: D2
    description: Track applies 3 plan sets or shows Russian absence message
    requirement: QUICK-0QR-01
    verification: []
    human_judgment: true
    rationale: UI behavior on selected calendar day requires manual check
  - id: D3
    description: Current week row highlighted with theme tokens
    requirement: QUICK-0QR-01
    verification: []
    human_judgment: true
    rationale: Visual highlight needs human verification
  - id: D4
    description: Reset confirm updates createdAt and returns week to 1
    requirement: QUICK-0QR-01
    verification: []
    human_judgment: true
    rationale: Dialog + week recompute needs smoke test

duration: 10min
completed: 2026-07-15
status: complete
---

# Phase 260715-0qr Plan 01: Load-table week prefill Summary

**Неделя из сессий с `createdAt`, подсветка в сетке, «Отслеживать» → 3 подхода в дневник, «Сбросить» через confirm обновляет `createdAt`.**

## Performance

- **Duration:** 10 min
- **Started:** 2026-07-14T21:34:46Z
- **Completed:** 2026-07-14T21:45:00Z
- **Tasks:** 3/3
- **Files modified:** 7

## Accomplishments

- `getLoadTableCurrentWeek` считает сессии с `createdAt` (weight/reps > 0) и даёт `currentWeek` без persisted-поля.
- `getPlanSetsForWeek` и `syncExerciseSetsFromPlan` подставляют ровно 3 плановых подхода на выбранный день.
- `LoadTableDetail`: «Отслеживать» / «Сбросить» с Dialog; сетка подсвечивает текущую неделю (`bg-accent/40`).

## Task Commits

1. **Task 1: Session-week helpers and resetExerciseProgress** - `2656aab` (feat)
2. **Task 2: Highlight current week and calendar set sync** - `76fd9a3` (feat)
3. **Task 3: LoadTableDetail Track / Reset UX** - `0d71e13` (feat)

**Plan metadata:** skipped (commit_docs — orchestrator handles docs)

## Files Created/Modified

- `src/entities/loadTable/lib/getLoadTableCurrentWeek.ts` — sessionCount → currentWeek
- `src/entities/loadTable/lib/getPlanSetsForWeek.ts` — 3× {weight, reps}
- `src/entities/loadTable/slice/loadTableStore.ts` — `resetExerciseProgress`
- `src/entities/loadTable/index.ts` — barrel exports
- `src/entities/calendarDay/slice/calendarStore.ts` — `syncExerciseSetsFromPlan`
- `src/features/loadTable/ui/LoadTableWeekGrid.tsx` — `currentWeek` highlight
- `src/features/loadTable/ui/LoadTableDetail.tsx` — Track / Reset UX

## Decisions Made

- Track полностью синхронизирует до 3 подходов плана (не мержит только нули) — предсказуемее для новичка.
- Скан журнала ограничен месяцами от `createdAt` до сегодня (T-0qr-03).
- Кнопка «Назад» сохранена (WIP до задачи её убирал — восстановлено для навигации).

## Deviations from Plan

### Auto-fixed Issues

None that required extra commits.

**Notes (out of scope):** `pnpm exec tsc --noEmit -p tsconfig.app.json` всё ещё падает на pre-existing errors в `normalizeExerciseCategories.ts` — не трогали (scope boundary).

**Total deviations:** 0 auto-fixed
**Impact on plan:** Plan executed as written; pre-existing tsc noise deferred.

## Issues Encountered

None blocking. Pre-existing `tsc` errors outside touched files remain.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Load-table week prefill ready for manual smoke (0/2/3 sessions, Track, Reset). No blockers.

## Self-Check: PASSED

- FOUND: `src/entities/loadTable/lib/getLoadTableCurrentWeek.ts`
- FOUND: `src/entities/loadTable/lib/getPlanSetsForWeek.ts`
- FOUND: commits `2656aab`, `76fd9a3`, `0d71e13`

---
*Phase: 260715-0qr-load-table-createdat-loadtabledetail-cre*
*Completed: 2026-07-15*
