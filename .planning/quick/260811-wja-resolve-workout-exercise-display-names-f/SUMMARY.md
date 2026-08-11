---
id: 260811-wja-resolve-workout-exercise-display-names-f
slug: resolve-workout-exercise-display-names-f
status: complete
created: 2026-08-11
completed: 2026-08-11
subsystem: ui
tags: [catalog, display-name, Map, workout, load-table]
provides:
  - buildCatalogNameById O(1) catalog id→name Map
  - resolveWorkoutExerciseDisplayName with denormalized snapshot fallback
  - useCatalogNameById shared hook
affects: [workout-cards, load-table-list]
tech-stack:
  added: []
  patterns: [catalog Map for live display names; day exercise.name as orphan fallback]
key-files:
  created:
    - src/entities/exercise/lib/catalogNameIndex.ts
  modified:
    - src/entities/exercise/index.ts
    - src/features/exercise/ui/ExerciseCard.tsx
    - src/features/exercise/ui/ExerciseBody.tsx
    - src/features/loadTable/ui/LoadTableList.tsx
key-decisions:
  - "Source of truth for live names = catalog Map, not day storage"
  - "No calendar walk on rename; denormalized name kept on add-to-day"
duration: 4min
---

# SUMMARY: Resolve workout exercise display names from catalog Map

Workout UI titles resolve live catalog names via O(1) `Map` lookup by `catalogExerciseId`, falling back to denormalized day `exercise.name` for orphans — rename no longer needs a calendar rewrite.

## Result

- `buildCatalogNameById` / `resolveWorkoutExerciseDisplayName` / `useCatalogNameById` exported from `@/entities/exercise`
- `ExerciseCard` and `ExerciseBody` show resolved `displayName` for titles / delete dialog / StatisticCard
- `LoadTableList` uses one shared Map instead of per-row `findCatalogExerciseById` for the name line
- `useLastExerciseSession`, `generateExercise` name snapshot, and `updateExercise` (no calendar side-effects) left unchanged

## Changes

| Commit | Task | Description |
|--------|------|-------------|
| `6b61c2c` | 1 | Catalog name Map + resolver + hook |
| `d19d4cb` | 1-fix | Restored `index.ts` formatting after PowerShell mangled newlines |
| `bb9117a` | 2 | Wire Card / Body / LoadTableList |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] PowerShell mangled `index.ts` newlines on Task 1 commit**
- **Found during:** Task 1 commit
- **Issue:** Staging via PowerShell string replace collapsed the barrel file into few long lines
- **Fix:** Rewrote `src/entities/exercise/index.ts` with correct formatting and committed as `d19d4cb`
- **Files modified:** `src/entities/exercise/index.ts`
- **Commit:** `d19d4cb`

## Self-Check: PASSED

- FOUND: `src/entities/exercise/lib/catalogNameIndex.ts`
- FOUND: `src/features/exercise/ui/ExerciseCard.tsx`
- FOUND: `src/features/exercise/ui/ExerciseBody.tsx`
- FOUND: `src/features/loadTable/ui/LoadTableList.tsx`
- FOUND: commit `6b61c2c`
- FOUND: commit `d19d4cb`
- FOUND: commit `bb9117a`
