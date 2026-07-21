# Task 3 Report: Orchestration helper

## Status

**DONE**

## Summary

Created `suggestRingGoalsFromHistory.ts` — async orchestrator that builds history summary, calls AI gateway with system/user prompts, validates non-empty response, and parses JSON into `RingGoalsSettings`.

## File Created

| File | Export |
|------|--------|
| `src/features/profileRingGoalsSettings/lib/suggestRingGoalsFromHistory.ts` | `suggestRingGoalsFromHistory(days)` → `Promise<RingGoalsSettings>` |

## Implementation Details

- **Flow:** `buildRingGoalsHistorySummary(days)` → `createChatCompletion([system, user])` → trim content → `parseRingGoalsAiResponse(content)`.
- **Empty history:** No early return; gateway is still called (user prompt handles `trainingDays = 0` via Task 2 hint).
- **Empty gateway content:** Throws `Error("Шлюз вернул пустой ответ. Попробуйте ещё раз.")` — same message as `AiRecommendationsPanel`.
- **Brief mojibake:** Error string decoded to correct UTF-8 Russian.
- **Out of scope:** No UI wiring, no barrel exports.

## Verification

```bash
pnpm exec tsc --noEmit -p tsconfig.app.json
```

**Result:** Exit code 2 — **4 pre-existing errors** in `normalizeExerciseCategories.ts`. **No errors in new file** (eslint/lints clean).

## Commit

| SHA | Subject |
|-----|---------|
| `ed74fcf` | feat: orchestrate AI ring goal suggestion from history |

## Self-Review

### Correctness

- Matches brief orchestration pattern exactly.
- Reuses existing helpers from Tasks 1–2 and `createChatCompletion` from `@/shared/api`.
- Propagates `AiGatewayError` from gateway (not caught — caller handles).

### Scope Adherence

- Single file created; no UI changes.

## Concerns

None blocking. Downstream task should wire into `ProfileRingGoalsSettingsCard` and surface thrown errors in UI.

## Next Steps (for downstream tasks)

- Call `suggestRingGoalsFromHistory(days)` from settings UI with loading/error states.
- Optional: barrel re-exports in feature `index.ts`.
