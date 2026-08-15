---
phase: q1b-rework-preset-create-edit
plan: 01
subsystem: ui
tags: [preset, composition, drawer, reorder, motion, FullExerciseCommand]

requires:
  - phase: 260811-wja-resolve-workout-exercise-display-names-f
    provides: "useCatalogNameById Map for live catalog names"
provides:
  - "Composition-first preset create/edit (name + numbered ordered list)"
  - "AddPresetExercisesDrawer using FullExerciseCommand catalog picker"
  - "PresetCompositionList motion Reorder with grip handle"
  - "dedupePreserveOrder / appendUniqueExerciseIds unique catalog id helpers"
affects: [preset-editor, createPreset]

actuals:
  tokens: 4787
  tasks: 2
  commits: 2

tech-stack:
  added: []
  patterns:
    - "Preset editor is a composition list; catalog lives in a right-side drawer"
    - "motion Reorder.Group/Item + useDragControls grip handle, same as ExerciseList"

key-files:
  created:
    - src/features/createPreset/lib/presetExerciseIds.ts
    - src/features/createPreset/ui/AddPresetExercisesDrawer.tsx
    - src/features/createPreset/ui/PresetCompositionList.tsx
  modified:
    - src/features/createPreset/ui/CreatePreset.tsx

key-decisions:
  - "Create/edit preset is composition-first: name + numbered ordered list, not catalog checkboxes"
  - "Add exercises via FullExerciseCommand drawer; drawer only appends unique catalog ids"
  - "Reorder uses ExerciseList motion pattern; persist still string[] on save"

patterns-established:
  - "createPreset owns composition UI; reuses addExercise drawer hooks without importing AddExercise"
  - "Reorder values are catalog id string[]; names resolve via useCatalogNameById"

requirements-completed: [Q1B-01, Q1B-02, Q1B-03]

coverage:
  - id: D1
    description: "Create/edit page is a named composition list; add via catalog drawer; save still writes string[] ids"
    requirement: Q1B-01
    verification:
      - kind: other
        ref: "pnpm exec tsc -b --pretty false"
        status: pass
      - kind: other
        ref: "rg FullExerciseCommand src/features/createPreset matches AddPresetExercisesDrawer.tsx only; handleCategoryToggle/handleExerciseToggle absent from CreatePreset.tsx"
        status: pass
    human_judgment: true
    rationale: "Drawer search-param open, unique append, and create-from-workout hydrate need a visual pass on /presets/create and /presets/edit"
  - id: D2
    description: "Grip-handle drag reorders the composition string[] that save will persist; numbers follow the new order"
    requirement: Q1B-02
    verification:
      - kind: other
        ref: "pnpm exec tsc -b --pretty false"
        status: pass
      - kind: other
        ref: "rg Reorder.Group src/features/createPreset/ui/PresetCompositionList.tsx"
        status: pass
    human_judgment: true
    rationale: "Drag feel and index-after-reorder need a human check on the create/edit screen"
  - id: D3
    description: "Routes /presets/create and /presets/edit?id= and location.state.initialExercises hydration unchanged"
    requirement: Q1B-03
    verification:
      - kind: other
        ref: "rg initialExercises CreatePresetPage; rg /presets/create|/presets/edit routes.tsx"
        status: pass
    human_judgment: false

duration: 3min
completed: 2026-08-15
status: complete
---

# Phase q1b Plan 01: Rework Preset Create/Edit into a Composition Summary

**Preset create/edit is now a named numbered composition list with a catalog add drawer and motion Reorder, still saving unique catalog id string[].**

## Performance

- **Duration:** 3 min
- **Started:** 2026-08-15T15:49:41Z
- **Completed:** 2026-08-15T15:52:34Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Create/edit preset page is composition-first: name field plus numbered ordered list of selected catalog ids
- Exercises are added through a right-side `FullExerciseCommand` drawer (`add-exercise=1`), not inline category checkboxes
- Composition reorders with `motion` `Reorder.Group` / `Reorder.Item` and a `GripVertical` handle, matching the home workout list
- Save path still writes `NewPreset { presetName, exercises: string[] }` via existing `createTrainingPreset` / `updateTrainingPreset`

## Task Commits

Each task was committed atomically:

1. **Task 1: End-to-end composition editor with catalog add drawer** - `82e940d` (feat)
2. **Task 2: Drag-reorder composition with ExerciseList Reorder pattern** - `1bcece0` (feat)

**Plan metadata:** skipped (orchestrator handles docs commit)

## Files Created/Modified

- `src/features/createPreset/lib/presetExerciseIds.ts` - `dedupePreserveOrder` and `appendUniqueExerciseIds` for unique catalog ids
- `src/features/createPreset/ui/AddPresetExercisesDrawer.tsx` - right-side catalog drawer using `FullExerciseCommand` variant `exercises`
- `src/features/createPreset/ui/PresetCompositionList.tsx` - numbered composition rows with motion Reorder and remove
- `src/features/createPreset/ui/CreatePreset.tsx` - composition-first page chrome, `FixedBottomBar`, hydrate via unique ids

## Decisions Made

- Reused `useExerciseSelection` and `useDrawerViewportStyle` from `addExercise` lib instead of importing `AddExercise` (calendar side effects / nested preset-create actions)
- Drawer submits only catalog checkbox ids; presets never appear (`variant="exercises"`, empty preset selection, no-op preset handler)
- Missing catalog entries render as `Упражнение недоступно`; removal is list-only (drawer only appends)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Preset editor matches workout composition UX; store contract unchanged
- Manual UAT: name a preset, add two exercises, drag reorder, remove one, save; edit via `/presets/edit?id=`; create-from-current-workout prefills ordered list

## Self-Check: PASSED

- FOUND: `src/features/createPreset/lib/presetExerciseIds.ts`
- FOUND: `src/features/createPreset/ui/AddPresetExercisesDrawer.tsx`
- FOUND: `src/features/createPreset/ui/PresetCompositionList.tsx`
- FOUND: `src/features/createPreset/ui/CreatePreset.tsx`
- FOUND: `.planning/quick/260815-q1b-rework-preset-create-edit-into-a-composi/260815-q1b-SUMMARY.md`
- FOUND: commit `82e940d`
- FOUND: commit `1bcece0`

