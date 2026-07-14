---
phase: 260714-wvs-merge-exercises
plan: 01
subsystem: exercises
tags: [merge, catalog, journal-remap, zustand, local-storage]

requires: []
provides:
  - "Catalog exercise merge (source → target) with journal/preset remap"
  - "MergeExerciseDialog comparison UI on CreateExercise edit"
affects: [analytics-derived-stats, exercise-catalog, workout-journal]

tech-stack:
  added: []
  patterns:
    - "Pure remap helpers + store actions; UI orchestrates journal → calendar → catalog"
    - "Same-day: keep two workout cards, remap catalogExerciseId only (D-01)"

key-files:
  created:
    - src/entities/exercise/lib/mergeCatalogExercise.ts
    - src/entities/exercise/lib/computeExerciseMergeStats.ts
    - src/shared/lib/remapWorkoutJournalCatalogId.ts
    - src/features/createExercise/ui/MergeExerciseDialog.tsx
  modified:
    - src/entities/exercise/slice/exerciseStore.ts
    - src/entities/calendarDay/slice/calendarStore.ts
    - src/entities/exercise/index.ts
    - src/shared/lib/index.ts
    - src/features/createExercise/ui/CreateExercise.tsx
    - src/features/createExercise/ui/CreateExerciseFooter.tsx

key-decisions:
  - "D-01: same-day cards stay separate; only catalogExerciseId/name/category remapped"
  - "D-03: no dedicated analytics persistence — stats derived from remapped journal"
  - "D-04: target name/photos/description unchanged; source catalog entry deleted"

patterns-established:
  - "mergeExercises updates catalog+presets; remaps done via remapWorkoutJournalCatalogId + calendarStore.remapCatalogExerciseId"

requirements-completed: [QUICK-MERGE-01]

coverage:
  - id: D1
    description: "Domain remap helpers + mergeExercises / remapCatalogExerciseId"
    requirement: QUICK-MERGE-01
    verification:
      - kind: other
        ref: "pnpm exec eslint (merge touchpoints) --max-warnings 0"
        status: pass
    human_judgment: false
  - id: D2
    description: "MergeExerciseDialog + Смержить упражнение on CreateExercise edit"
    requirement: QUICK-MERGE-01
    verification:
      - kind: other
        ref: "rg Смержить упражнение|MergeExerciseDialog src/features/createExercise"
        status: pass
    human_judgment: true
    rationale: "Same-day two-card behavior and stats modal need manual UAT in the browser"

duration: 3min
completed: 2026-07-14
status: complete
---

# Quick Task 260714-wvs: Merge exercises Summary

**Catalog merge source→target with journal/preset remap and comparison modal on CreateExercise edit**

## Performance

- **Duration:** 3 min
- **Started:** 2026-07-14T20:47:25Z
- **Completed:** 2026-07-14T20:50:28Z
- **Tasks:** 3/3
- **Files modified:** 10

## Accomplishments

- Pure helpers remapping presets and day exercises without collapsing same-day cards or rewriting instance UUIDs
- `mergeExercises` + full `MM-YYYY` journal rewrite + in-memory calendar remap; analytics left derived
- Edit-screen button «Смержить упражнение» opens comparison modal (names + total reps / sessions / sets)

## Task Commits

1. **Task 1: Domain remap helpers + store actions** — `3f477af` (feat)
2. **Task 2: Merge comparison modal + edit-screen entry** — `4c9c41d` (feat)
3. **Task 3: Typecheck and regression smoke checks** — verification only (no code delta; eslint passed on touchpoints)

**Plan metadata:** skipped (orchestrator commits docs)

## Files Created/Modified

- `src/entities/exercise/lib/mergeCatalogExercise.ts` — `remapDayExercises`, `remapPresetExerciseIds`
- `src/entities/exercise/lib/computeExerciseMergeStats.ts` — totalReps / sessionCount / setCount
- `src/shared/lib/remapWorkoutJournalCatalogId.ts` — rewrite changed MM-YYYY buckets only
- `src/entities/exercise/slice/exerciseStore.ts` — `mergeExercises`
- `src/entities/calendarDay/slice/calendarStore.ts` — `remapCatalogExerciseId`
- `src/features/createExercise/ui/MergeExerciseDialog.tsx` — comparison + target picker
- `src/features/createExercise/ui/CreateExerciseFooter.tsx` / `CreateExercise.tsx` — entry + orchestration

## Decisions Made

- Same-day: two cards remain after merge; both get target `catalogExerciseId` (D-01)
- Remap surface: catalog delete source, presets replace+dedupe, all journal months + in-memory days; no analytics store write (D-03)
- Target metadata (name/photos/description) preserved (D-04)

## Same-day & remap surface (debug)

| Surface | Behavior |
|---------|----------|
| Workout day cards | Two instances stay; instance `id` unchanged; `catalogExerciseId` → target |
| Presets | `sourceId` → `targetId`, then dedupe preserving first occurrence |
| Catalog | Source removed; target meta untouched |
| Analytics | Derived via `catalogExerciseId ?? id` after journal remap |

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Pre-existing `tsc` errors in `normalizeExerciseCategories.ts` (unrelated casts) — out of scope; merge touchpoints eslint-clean; no merge-related tsc diagnostics
- Task 3 had no file changes → no atomic commit (verification-only)

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Merge flow ready for manual UAT: edit source → merge → confirm same-day two cards and stats under target.

## Self-Check: PASSED

- FOUND: `src/entities/exercise/lib/mergeCatalogExercise.ts`
- FOUND: `src/entities/exercise/lib/computeExerciseMergeStats.ts`
- FOUND: `src/shared/lib/remapWorkoutJournalCatalogId.ts`
- FOUND: `src/features/createExercise/ui/MergeExerciseDialog.tsx`
- FOUND commits: `3f477af`, `4c9c41d`

---
*Quick: 260714-wvs-merge-exercises*
*Completed: 2026-07-14*
