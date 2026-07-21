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
