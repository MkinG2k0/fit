---
phase: 260715-vrc-12-5
plan: 01
subsystem: ui
tags: [decimal-input, draft-string, weight, load-table, react]

requires: []
provides:
  - Draft-string weight input in ExerciseSetRow (focus → draft, blur → Number)
  - Draft-string maxKg input in LoadTableDetail (same pattern)
affects: [exercise-logging, load-table]

tech-stack:
  added: []
  patterns:
    - "Focused decimal draft string: sanitize digits+one dot; live-commit only complete finite numbers; blur normalizes trailing dot"

key-files:
  created: []
  modified:
    - src/features/exercise/ui/ExerciseSetRow.tsx
    - src/features/loadTable/ui/LoadTableDetail.tsx

key-decisions:
  - "Local per-input draft state only — no calendarStore / loadTableStore signature changes"
  - "Incomplete drafts ending with `.` (or lone `.`) stay UI-only until blur/complete"
  - "MAX (кг) switched from type=number to type=text + inputMode=decimal; non-finite/negatives rejected, fallback to previous maxKg on blur"

patterns-established:
  - "Decimal mid-edit: focused draft string → Number commit on complete keystroke or blur (mirror body-metrics string fields)"

requirements-completed: [QUICK-VRC-01]

coverage:
  - id: D1
    description: "Set weight field keeps intermediate decimals (12. → 12.5) while focused; blur stores finite Number"
    requirement: QUICK-VRC-01
    verification:
      - kind: other
        ref: "pnpm exec tsc -b --pretty false (no errors in ExerciseSetRow; pre-existing unrelated tsc failures elsewhere)"
        status: pass
    human_judgment: true
    rationale: "Mid-edit cursor/decimal visibility requires manual smoke in the set weight Input"
  - id: D2
    description: "Load-table MAX (кг) accepts intermediate decimals without dropping the point"
    requirement: QUICK-VRC-01
    verification:
      - kind: other
        ref: "pnpm exec tsc -b --pretty false (no errors in LoadTableDetail)"
        status: pass
    human_judgment: true
    rationale: "Same decimal UX needs visual confirmation on LoadTableDetail"

duration: 5min
completed: 2026-07-15
status: complete
---

# Phase 260715-vrc-12-5 Plan 01: Decimal weight draft-string Summary

**Weight and MAX inputs keep intermediate decimals (`12.`) via focused draft strings and commit finite Numbers on blur.**

## Performance

- **Duration:** 5 min
- **Started:** 2026-07-15T19:56:11Z
- **Completed:** 2026-07-15T20:01:00Z
- **Tasks:** 2/2
- **Files modified:** 2

## Accomplishments

- Fixed set weight mid-edit loss: `ExerciseSetRow` drafts while focused, lives-updates store only for complete finite values, commits on blur.
- Applied the same pattern to load-table `MAX (кг)` with `type="text"` + `inputMode="decimal"` and non-negative finite guards.

## Task Commits

Each task was committed atomically:

1. **Task 1: Draft-string weight in ExerciseSetRow** - `e1e308d` (fix)
2. **Task 2: Draft-string maxKg in LoadTableDetail** - `a1a6a49` (fix)

**Plan metadata:** skipped (orchestrator commits SUMMARY/STATE; quick-task docs commit deferred)

## Files Created/Modified

- `src/features/exercise/ui/ExerciseSetRow.tsx` — focused `weightDraft`; sanitize `,`→`.` + digits/one decimal; incomplete trailing `.` not pushed to `onInputChange`; blur commits Number
- `src/features/loadTable/ui/LoadTableDetail.tsx` — focused `maxKgDraft`; live-commit complete ≥0 finite numbers; blur clamps/rejects non-finite via previous maxKg fallback

## Decisions Made

- No store API changes — draft is component-local (plan requirement).
- Empty draft still flows through existing `Number("")` → `0` path for sets.
- maxKg negatives / NaN never written; blur uses previous `exercise.maxKg` when parsed value is invalid.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- `pnpm exec tsc -b --pretty false` still fails on pre-existing errors in `src/entities/exercise/lib/normalizeExerciseCategories.ts` (out of scope). Touched files compile cleanly relative to that baseline.

## Known Stubs

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Decimal weight/MAX entry is fixed for logging and load-table detail. Manual smoke recommended: type `12.` then `5`, blur → `12.5`.

---
*Phase: 260715-vrc-12-5*
*Completed: 2026-07-15*

## Self-Check: PASSED

- FOUND: `src/features/exercise/ui/ExerciseSetRow.tsx`
- FOUND: `src/features/loadTable/ui/LoadTableDetail.tsx`
- FOUND: `.planning/quick/260715-vrc-12-5/260715-vrc-SUMMARY.md`
- FOUND: commit `e1e308d`
- FOUND: commit `a1a6a49`
