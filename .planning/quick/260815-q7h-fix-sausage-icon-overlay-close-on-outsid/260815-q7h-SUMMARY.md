---
phase: 260815-q7h-fix-sausage-icon-overlay-close-on-outsid
plan: 01
subsystem: ui
tags: [overlay, search-params, dialog, android-back, exercise-stats, add-exercise]

requires:
  - phase: 260811-tmf-history-back
    provides: "resolveBackPath parent-route map (not history.back) for Android/Header back"
provides:
  - "useOverlaySearchParam PUSH open / POP close with replace-delete fallback"
  - "exercise-stats overlay Dialog keyed by workout Exercise.id"
  - "Android/Header Back pops overlay search params before parent-route/minimize"
affects: [exercise-card, statistic-card, android-back, add-exercise-drawer]

actuals:
  tokens: 4433
  tasks: 3
  commits: 3

tech-stack:
  added: []
  patterns:
    - "Overlay modals on the current route via GET search-param PUSH; close via navigate(-1)"
    - "didPushRef resets when isOpen becomes false so an external pop cannot double-pop"

key-files:
  created:
    - src/shared/lib/navigation/overlaySearchParams.ts
  modified:
    - src/shared/lib/navigation/index.ts
    - src/shared/lib/navigation/useNavigateBack.ts
    - src/app/providers/AndroidBackNavigation.tsx
    - src/widgets/statisticCard/ui/statisticCard.tsx
    - src/features/exercise/ui/ExerciseCard.tsx
    - src/features/exercise/ui/ExerciseBody.tsx
    - src/features/addExercise/ui/AddExercise.tsx
    - src/features/createPreset/ui/AddPresetExercisesDrawer.tsx

key-decisions:
  - "Stats Dialog is keyed by workout Exercise.id, not catalogExerciseId, so duplicate catalog entries do not share one param"
  - "Overlay dismiss uses data-slot=dialog-overlay (dialog.tsx), not data-radix-dialog-overlay"
  - "PARENT_BY_PATH / ROOT_PATHS unchanged; navigate(-1) only when an overlay param is present"

patterns-established:
  - "Shared overlay search-param hook is the single close strategy for add-exercise drawers and the stats Dialog"
  - "One stats Dialog stays mounted on ExerciseCard; the sausage trigger in ExerciseBody only calls open()"

requirements-completed: [QUICK-Q7H-01, QUICK-Q7H-02, QUICK-Q7H-03]

coverage:
  - id: D1
    description: "Shared overlay search-param hook PUSH on open and POP on close; add-exercise drawers migrated off replace-delete happy path"
    requirement: QUICK-Q7H-02
    verification:
      - kind: other
        ref: "pnpm exec tsc -b --pretty false"
        status: pass
      - kind: other
        ref: "rg useOverlaySearchParam|ADD_EXERCISE_PARAM src/shared/lib/navigation src/features/addExercise/ui/AddExercise.tsx src/features/createPreset/ui/AddPresetExercisesDrawer.tsx"
        status: pass
    human_judgment: false
  - id: D2
    description: "One stats Dialog per card; ChartColumnBig and swipe-right PUSH ?exercise-stats=<workoutExercise.id>; overlay/X POP"
    requirement: QUICK-Q7H-01
    verification:
      - kind: other
        ref: "pnpm exec tsc -b --pretty false"
        status: pass
      - kind: other
        ref: "rg EXERCISE_STATS_PARAM|onOpenStats|isStatisticOpen|ChartColumnBig ExerciseCard/ExerciseBody/statisticCard"
        status: pass
    human_judgment: true
    rationale: "Overlay click, X, swipe-right, and trigger visual state need a human pass on the home workout card"
  - id: D3
    description: "Android Back and Header back pop overlay params; without overlay, 260811-tmf parent-route/minimize is unchanged"
    requirement: QUICK-Q7H-03
    verification:
      - kind: other
        ref: "pnpm exec tsc -b --pretty false"
        status: pass
      - kind: other
        ref: "rg hasOverlaySearchParam|navigate(-1)|resolveBackPath|minimizeApp AndroidBackNavigation/useNavigateBack/resolveBackPath"
        status: pass
    human_judgment: true
    rationale: "Native Android Back vs App.minimizeApp and browser Back on / with and without overlay params cannot be proven by tsc/rg"

duration: 5min
completed: 2026-08-15
status: complete
---

# Phase 260815-q7h Plan 01: Fix sausage-icon overlay close on outside Summary

**Stats Dialog (ChartColumnBig) and add-exercise drawers now open via PUSH search-params on the current route and close via history pop; Android Back pops the overlay instead of minimizing the app.**

## Performance

- **Duration:** 5 min
- **Started:** 2026-08-15T15:55:00Z
- **Completed:** 2026-08-15T15:59:33Z
- **Tasks:** 3
- **Files modified:** 9

## Accomplishments

- Shared `useOverlaySearchParam` PUSH-opens and POP-closes overlay search-params; replace-delete only when the URL already had the param (deep link / refresh)
- Add-exercise drawers (`?add-exercise=1`) use the same hook; submit and navigate-away go through `close()`
- One `StatisticCard` Dialog per workout card, keyed by `exercise.id`; sausage trigger and swipe-right PUSH `?exercise-stats=<id>`
- Overlay click on `data-slot="dialog-overlay"` and Dialog X call `onOpenChange(false)` (POP)
- Android Back and Header back: overlay param → `navigate(-1)`; else existing `resolveBackPath` / `App.minimizeApp`. `PARENT_BY_PATH` untouched

## Task Commits

Each task was committed atomically:

1. **Task 1: Shared overlay search-param hook (PUSH open, POP close)** - `aa4be5b` (feat)
2. **Task 2: Unify sausage stats Dialog: overlay click + exercise-stats param** - `11733e0` (feat)
3. **Task 3: Android/Header Back pops overlay params instead of parent-route/minimize** - `6d9dfea` (feat)

**Plan metadata:** skipped (orchestrator handles docs commit)

## Files Created/Modified

- `src/shared/lib/navigation/overlaySearchParams.ts` - overlay param keys, `hasOverlaySearchParam`, `useOverlaySearchParam`
- `src/shared/lib/navigation/index.ts` - re-exports overlay helpers
- `src/features/addExercise/ui/AddExercise.tsx` - drawer open/close via overlay hook
- `src/features/createPreset/ui/AddPresetExercisesDrawer.tsx` - same overlay hook
- `src/features/exercise/ui/ExerciseCard.tsx` - card-level stats Dialog bound to `exercise-stats`
- `src/features/exercise/ui/ExerciseBody.tsx` - sausage trigger button, no inner Dialog
- `src/widgets/statisticCard/ui/statisticCard.tsx` - overlay dismiss calls `onOpenChange(false)`
- `src/app/providers/AndroidBackNavigation.tsx` - overlay param pops before parent-route/minimize
- `src/shared/lib/navigation/useNavigateBack.ts` - Header back pops overlay params first

## Decisions Made

- Workout `Exercise.id` as the `exercise-stats` value so two copies of the same catalog exercise do not share one Dialog
- Overlay target check uses `data-slot="dialog-overlay"` from `dialog.tsx`; global Dialog primitive not rewritten
- Nested fullscreen photo Dialog stays without a search param (Back closing the whole stats modal is accepted)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Overlay close strategy is shared; `analytics-exercise` / `calorieProfile` remain out of scope
- Human UAT: on `/`, expand a card, tap ChartColumnBig — URL stays `/` plus `?exercise-stats=<id>`; overlay, X, and Android/browser Back close the modal without leaving the page or minimizing; second Back on `/` without a param still minimizes; swipe-right opens the same modal; add-exercise drawer overlay/Back pop without a route change

## Self-Check: PASSED

- FOUND: `src/shared/lib/navigation/overlaySearchParams.ts`
- FOUND: `src/shared/lib/navigation/index.ts`
- FOUND: `src/features/addExercise/ui/AddExercise.tsx`
- FOUND: `src/features/createPreset/ui/AddPresetExercisesDrawer.tsx`
- FOUND: `src/features/exercise/ui/ExerciseCard.tsx`
- FOUND: `src/features/exercise/ui/ExerciseBody.tsx`
- FOUND: `src/widgets/statisticCard/ui/statisticCard.tsx`
- FOUND: `src/app/providers/AndroidBackNavigation.tsx`
- FOUND: `src/shared/lib/navigation/useNavigateBack.ts`
- FOUND: `.planning/quick/260815-q7h-fix-sausage-icon-overlay-close-on-outsid/260815-q7h-SUMMARY.md`
- FOUND: commit `aa4be5b`
- FOUND: commit `11733e0`
- FOUND: commit `6d9dfea`
- VERIFY: `pnpm exec tsc -b --pretty false` pass
- VERIFY: `PARENT_BY_PATH` in `resolveBackPath.ts` unchanged
