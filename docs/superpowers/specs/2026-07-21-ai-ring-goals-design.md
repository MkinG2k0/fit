# AI Ring Goals — Design Spec

**Date:** 2026-07-21  
**Status:** Approved for planning  
**Scope:** Suggest and immediately save calendar ring goals (`fullSetCount`, `fullVolume`) from ~3 months of local workout history via the existing ChatGPT gateway.

## Goal

Add an **«ИИ цель»** action on the calendar ring goals settings card. It derives daily ring targets from the last 90 days of training, asks the AI for values slightly above a typical training day, and saves them into `userStore.ringGoals` without a separate confirm step.

## Decisions

| Topic | Choice |
| --- | --- |
| Computation | ChatGPT gateway (`createChatCompletion`), not a pure local heuristic |
| Apply mode | Immediately `setRingGoals` on success |
| Ambition | Slightly above typical day (light challenge) |
| Sparse history | Still call AI with whatever aggregates exist |
| Prompt payload | Compact aggregates (approach A), not full journal text |
| Period | Fixed `RING_GOALS_AI_HISTORY_DAYS = 90` |

## Architecture

```
ProfileRingGoalsSettingsCard
  → suggestRingGoalsFromHistory(days)
      → buildRingGoalsHistorySummary(days, 90)
      → buildRingGoalsAiPrompts(summary)
      → createChatCompletion(messages)
      → parseRingGoalsAiResponse(content)
  → setRingGoals(parsed)
```

No new routes. Reuse `src/shared/api/aiGateway.ts` and the same volume formula as calendar rings (`calcSetVolumeKg`).

## Modules

All under `src/features/profileRingGoalsSettings/`:

| File | Responsibility |
| --- | --- |
| `lib/buildRingGoalsHistorySummary.ts` | Filter last 90 days; per training day set count + volume; aggregates (trainingDays, mean/median/p75 sets & volume, best day) |
| `lib/buildRingGoalsAiPrompts.ts` | System + user messages; instruct slightly-above-typical; JSON-only reply |
| `lib/parseRingGoalsAiResponse.ts` | Extract JSON object (direct / fence / slice); require safe integers `>= MIN_RING_GOAL_VALUE` |
| `lib/suggestRingGoalsFromHistory.ts` | Orchestrate summary → completion → parse → `RingGoalsSettings` |
| `ui/ProfileRingGoalsSettingsCard.tsx` | Button, loading, success/error messaging, wire to store |

Export new public helpers from the feature `index.ts` only if other layers need them; UI-only wiring can stay internal.

## Data: history summary

**Training day:** a calendar day with at least one set where `reps > 0` or `weight > 0` (same spirit as workout-log builders).

**Per day:**

- `setCount` — number of logged sets
- `volume` — sum of `calcSetVolumeKg(weight, reps)`

**Window:** days with date key in `[today - 89 days, today]` inclusive (90 calendar days).

**Aggregates sent to the model (example fields):**

- `trainingDays`
- `meanSetCount`, `medianSetCount`, `p75SetCount`, `bestSetCount`
- `meanVolume`, `medianVolume`, `p75Volume`, `bestVolume`

If `trainingDays === 0`, still send zeros / empty stats and let the model respond; invalid parse → show error, do not change goals.

## AI contract

**Request:** `model: gpt-4o-mini` via existing gateway client.

**Response shape (required):**

```json
{ "fullSetCount": 24, "fullVolume": 7200 }
```

Both values must be finite safe integers `>= 1`. Extra keys ignored. Markdown wrappers tolerated by parser (same approach as `parseAiFillSets`).

**Prompt intent (Russian or bilingual as elsewhere in AI features):**

- Goals are 100% fill targets for daily calendar rings (sets outer, volume inner).
- Target should be slightly above a typical training day from the summary (not median-only soft, not PR-only hard).
- Reply with JSON only — no explanation.

## UI behavior

Card: **Цели колец календаря** (`ProfileRingGoalsSettingsCard`).

- New outline button **«ИИ цель»** next to Save / Reset.
- While requesting: button disabled; label/status **«Считаем…»**; no second concurrent request.
- Success: update local inputs + `setRingGoals`; muted success text e.g. «Цель сохранена по истории за 3 месяца».
- Failure (network / gateway / parse): `text-destructive` message; store unchanged.
- Manual Save / Reset unchanged. AI path does not require pressing Save.

## Error handling

| Case | Behavior |
| --- | --- |
| Gateway / network error | Show `AiGatewayError` message or fallback Russian copy; no store write |
| Unparseable / invalid numbers | Russian parse error; no store write |
| Empty history | Still attempt completion; if response invalid → error |

## Out of scope

- Selectable period UI
- Preview / apply-separate flow
- Changing default constants `20` / `6000`
- Offline-only heuristic goals
- Streaming responses
- New settings transfer section fields beyond existing `ringGoals` (AI result already persists via `ringGoals`)

## Acceptance criteria

1. User can tap **«ИИ цель»** on ring goals settings.
2. Request uses ~90 days of local calendar data as compact aggregates only.
3. On valid AI JSON, `ringGoals` persist immediately and inputs reflect new values.
4. On failure, previous goals remain.
5. Ambition guidance in prompt is “slightly above typical”.
6. No new page/route required.

## Implementation notes

- Follow FSD: feature owns orchestration; entity store already exposes `setRingGoals`.
- Prefer Tailwind tokens; match existing card button layout.
- Prefer `pnpm` for any scripts/checks.
- Mirror parse robustness from `src/features/aiRecommendations/lib/parseAiFillSets.ts` without unnecessary coupling (dedicated parser for two integers is fine).
