# Task 2 Report: Share model types + builders

## Status

**DONE_WITH_CONCERNS**

## Summary

Added the Share Stats view-model contracts, period labels, exercise/workout pick-list helpers, and `buildShareModel` implementations for exercise, workout, and period scopes. Aggregates reuse Analytics normalization and period selection, while workout tonnage uses `calcSetVolumeKg`.

## Commit

| SHA | Subject |
|-----|---------|
| `230a1b1` | feat(shareStats): add share model builders for exercise, workout, period |

## Files Changed (committed)

| File | Change |
|------|--------|
| `src/features/shareStats/model/types.ts` | Added share selections, model contracts, option type, and exact period labels |
| `src/features/shareStats/lib/listShareOptions.ts` | Added deduplicated exercise options and newest-first workout date keys |
| `src/features/shareStats/lib/buildShareModel.ts` | Added exercise, workout, period, and empty model builders |

## Behavior Implemented

- Exercise scope selects a rolling Analytics period ending at `baseDate`/today, calculates first-to-last max weight, period tonnage, session count, and chronological sparkline.
- Workout scope reads the selected raw `CalendarDay`, emits compact set summaries, and calculates line/day tonnage through `calcSetVolumeKg`.
- Period scope uses Analytics period selection and summary metrics, emits training days, total tonnage, optional positive streak, and the top three exercises by tonnage.
- All missing/empty selections return `{ kind: "empty", message: "Недостаточно данных" }`.
- `7d` remains an inclusive rolling seven-day window ending today through `selectSessionsByPeriod`.

## Verification

```bash
pnpm exec eslint src/features/shareStats
pnpm exec prettier --check "src/features/shareStats/**/*.{ts,tsx}"
pnpm exec tsc --noEmit -p tsconfig.app.json
```

- ESLint: **PASS**
- Prettier: **PASS**
- Share Stats TypeScript: **PASS** — no errors reference `src/features/shareStats`.
- Full project TypeScript: **FAIL (pre-existing)** — four TS2352 errors remain in `src/entities/exercise/lib/normalizeExerciseCategories.ts` at lines 81, 82, 99, and 100.

## Self-Review

### Correctness

- Exercise sessions remain chronological because Analytics normalization sorts with `compareDateKeysAsc`.
- Exercise and period windows honor the optional `baseDate`; period summaries use the selected sessions when `baseDate` is supplied.
- Workout meaningful-data filtering matches Analytics normalization, and bodyweight sets use the same effective-weight behavior through `calcSetVolumeKg`.
- Period top exercises aggregate by normalized exercise ID, sort by descending tonnage, and are limited to three.
- Workout date options sort newest first using `compareDateKeysAsc`.

### Scope adherence

- Committed only the three requested files under `src/features/shareStats`.
- Did not modify or commit `newsEntries.ts`, Task 1 files, analytics files, docs, or unrelated dirty files.
- No test dependency or Vitest setup was added.

### Concerns

1. The repository-wide TypeScript command cannot return zero until the unrelated pre-existing casts in `normalizeExerciseCategories.ts` are corrected.
2. No automated test runner exists in this repository; verification is limited to static checks requested by the brief.

## Unblocks

- Share Stats UI can consume all scope selections, period labels, pick lists, and ready-to-render share models.
- PNG card rendering and native/web sharing tasks can build on the committed model layer.
# Task 2 Report: Prompts + JSON parser

## Status

**DONE**

## Summary

Added AI prompt builders and a strict JSON response parser for ring goals under `src/features/profileRingGoalsSettings/lib/`. Exports match the plan: system/user prompts consume `RingGoalsHistorySummary`; parser returns validated `RingGoalsSettings` or throws a Russian error.

## Files Created

| File | Exports |
|------|---------|
| `buildRingGoalsAiPrompts.ts` | `getRingGoalsSystemPrompt()`, `buildRingGoalsUserPrompt(summary)` |
| `parseRingGoalsAiResponse.ts` | `parseRingGoalsAiResponse(raw)` → `RingGoalsSettings` |

## Implementation Details

### Prompts

- **System prompt:** Russian instructions for daily ring goals (`fullSetCount`, `fullVolume`), ambition guidance (slightly above typical, ~p75), and strict JSON-only output shape.
- **User prompt:** Multi-line summary with `trainingDays`, set/volume stats (mean/median/p75/best), beginner fallback hint when `trainingDays = 0`, and JSON return instruction.
- Brief contained mojibake for Russian strings; implemented with correct UTF-8 (same approach as Task 1).

### Parser

- Mirrors `parseAiFillSets.ts` extract strategy: direct JSON → fenced code block → `{...}` object slice.
- Validates `fullSetCount` and `fullVolume` as safe integers ≥ `MIN_RING_GOAL_VALUE` (1).
- Accepts numeric values (rounded) and digit-only strings.
- Rejects `0`, non-integers, missing fields, arrays, and unparseable input with: «Не удалось разобрать ответ ИИ. Попробуйте ещё раз.»

### Expected behavior (mental/console)

| Input | Result |
|-------|--------|
| `'{"fullSetCount":24,"fullVolume":7200}'` | `{ fullSetCount: 24, fullVolume: 7200 }` |
| fenced JSON with 10/100 | ok |
| `'{"fullSetCount":0,"fullVolume":100}'` | throws |
| `'not json'` | throws |

Runtime console check via `tsx` was blocked by `@/entities/user` pulling `interceptors.ts` (needs `import.meta.env`); logic verified by code review against brief and `parseAiFillSets` pattern.

## Verification

```bash
pnpm exec tsc --noEmit -p tsconfig.app.json
```

**Result:** Exit code 2 — **4 pre-existing errors** in `normalizeExerciseCategories.ts`. **No errors in new files.**

## Commit

| SHA | Subject |
|-----|---------|
| `b416057` | feat: add ring goals AI prompts and response parser |

## Self-Review

### Correctness

- Prompt text matches plan intent; user prompt uses newline-separated lines as specified.
- Parser validation aligns with `MIN_RING_GOAL_VALUE` and `RingGoalsSettings` contract.
- No UI/orchestration wiring (out of scope).

### Scope Adherence

- Only the two specified files created; no barrel exports or tests (no vitest in repo).

### Minor Notes

1. Mojibake in brief decoded to proper UTF-8 for all Russian strings.
2. `parseGoalInteger` is stricter than `parseAiFillSets` normalizeNumber — intentional per brief (integer ≥ 1 only).

## Concerns

None blocking. Downstream task should wire prompts + parser into the AI call flow and handle thrown errors in UI.

## Next Steps (for downstream tasks)

- Orchestrate: build summary → prompts → API call → `parseRingGoalsAiResponse` → `setRingGoals`.
- Optional: barrel re-exports in feature `index.ts`.

## Share Stats review fix

- Commit: `0810596` — `fix(shareStats): aggregate duplicate exercises per day in share model`
- Exercise-scope sessions now aggregate every matching exercise per `dateKey`: tonnage and reps are summed, while max weight uses the maximum value.
- Sparkline and session count still contain one point per training date.
- Period top aggregation was reviewed and left unchanged because it already sums every exercise by ID.

### Verification evidence

- `pnpm exec eslint src/features/shareStats`: **PASS** (exit code 0).
- `pnpm exec tsc --noEmit -p tsconfig.app.json`: **FAIL (pre-existing)** with four TS2352 errors in `src/entities/exercise/lib/normalizeExerciseCategories.ts`; no TypeScript errors reference `src/features/shareStats`.
