# Task 4 Report: Wire UI button on settings card

## Status

**DONE**

## Summary

Wired the «ИИ цель» action into `ProfileRingGoalsSettingsCard.tsx`. The card now reads all locally stored training days, requests suggested ring goals, saves successful results immediately through `setRingGoals`, and presents loading, success, and destructive error feedback.

## File Modified

- `src/features/profileRingGoalsSettings/ui/ProfileRingGoalsSettingsCard.tsx`

## Implementation Details

- Added the outline button «ИИ цель» with disabled loading state «Считаем…».
- Prevented duplicate handler execution while a suggestion is in progress.
- On success, immediately calls `setRingGoals`; the existing store-driven effect updates both inputs.
- Shows «Цель сохранена по истории за 3 месяца» after a successful suggestion.
- Reuses `validationMessage` for `AiGatewayError`, regular `Error`, and fallback destructive messages.
- Leaves goals unchanged when storage, gateway, or response parsing fails.
- Clears prior feedback before a new AI request.
- Clears AI success feedback on both manual Save attempts and Reset.
- Preserved existing manual integer validation and Save/Reset behavior.

## Verification

### TypeScript

Command:

```bash
pnpm exec tsc --noEmit -p tsconfig.app.json
```

Result: exit code 2 due to four pre-existing `TS2352` errors in `src/entities/exercise/lib/normalizeExerciseCategories.ts` (lines 81, 82, 99, and 100). No errors referenced the modified card.

### ESLint

Command:

```bash
pnpm exec eslint "src/features/profileRingGoalsSettings/ui/ProfileRingGoalsSettingsCard.tsx"
```

Result: exit code 0.

### IDE diagnostics

No diagnostics in the modified card.

### Manual smoke

Using the already running local dev server:

- Opened `/settings` and verified the «ИИ цель» button renders next to Save and Reset.
- Clicked «ИИ цель» and verified it immediately changes to «Считаем…» and becomes disabled.
- The live gateway request remained pending during the check, so success persistence, destructive error rendering, and post-result Save/Reset interactions could not be completed in-browser.
- Existing goal values stayed unchanged while the request was pending.

## Commit

- `b3fc45a feat: add AI ring goal button to settings card`

## Self-Review

- Scope is limited to the requested settings card; no unrelated source files were changed or committed.
- Success mutates goals only after both history loading and AI suggestion complete.
- Every failure path sets destructive feedback without calling `setRingGoals`.
- Existing store synchronization updates input values after either AI success or Reset.
- Styling uses existing Tailwind semantic tokens with inline `className` values.

## Concerns

- Full `tsc` remains blocked by the four pre-existing category normalization errors noted above.
- The repository did not contain `.superpowers/sdd/task-4-brief.md`; implementation was checked against Task 4 in `docs/superpowers/plans/2026-07-21-ai-ring-goals.md` and the user-provided constraints.

## Final Review Fix: Stale AI Responses

- Added a generation ref for AI suggestion requests.
- Starting an AI suggestion advances the generation; manual Save and Reset advance it again, invalidating any in-flight result.
- AI success and error paths now discard stale completions before updating goals or feedback.
- The existing loading state, success/error messages, validation, and disabled «ИИ цель» button remain unchanged.

### Focused Verification

- `pnpm exec eslint "src/features/profileRingGoalsSettings/ui/ProfileRingGoalsSettingsCard.tsx"` — exit code 0.
- IDE diagnostics for the modified card — no errors.
- `pnpm exec tsc --noEmit -p tsconfig.app.json` — exit code 2 only for the same four pre-existing `TS2352` errors in `src/entities/exercise/lib/normalizeExerciseCategories.ts` at lines 81, 82, 99, and 100; no errors referenced the modified card.
