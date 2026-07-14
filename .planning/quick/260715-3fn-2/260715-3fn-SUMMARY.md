---
phase: 260715-3fn-2
plan: 01
subsystem: timer
tags: [react-timer-hook, zustand, rest-timer, settings, workout-summary]

requires: []
provides:
  - Deadline-based rest timer store (endAt persist)
  - Rest-between-sets user settings (default 2 min)
  - Auto-start after add set + countdown in WorkoutSummaryCard
affects: [timer, exercise-logging, settings]

tech-stack:
  added: [react-timer-hook]
  patterns:
    - "Countdown source of truth = persisted endAt deadline, not setInterval ticks"
    - "react-timer-hook useTimer({ expiryTimestamp }) for UI; store for persistence/cross-page"

key-files:
  created:
    - src/features/timer/slice/restTimerStore.ts
    - src/features/timer/ui/RestCountdownBadge.tsx
    - src/features/exercise/ui/RestBetweenSetsSettingsCard.tsx
  modified:
    - src/features/timer/lib/useTimer.ts
    - src/features/timer/ui/timer.tsx
    - src/features/timer/ui/TimerControls.tsx
    - src/features/timer/index.ts
    - src/entities/user/slice/userStore.ts
    - src/entities/user/index.ts
    - src/features/exercise/index.ts
    - src/pages/SettingsPage/ui/SettingsPage.tsx
    - src/features/appSettingsTransfer/lib/appSettingsSectionRegistry.ts
    - src/features/exercise/ui/ExerciseBody.tsx
    - src/widgets/exerciseList/ui/WorkoutSummaryCard.tsx
    - package.json
    - pnpm-lock.yaml

key-decisions:
  - "Remaining time derived from endAt - Date.now(); react-timer-hook only drives UI ticks"
  - "restBetweenSetsEnabled default true; duration default 120s; clamp 15–600s"
  - "AI-fill starts rest once after append loop, not per set"

patterns-established:
  - "Persist endAt in Zustand for remount/background survivability"
  - "Single-fire onExpire guard via ref before notify + clear"

requirements-completed: [QUICK-3FN-01, QUICK-3FN-02, QUICK-3FN-03]

coverage:
  - id: D1
    description: Deadline rest timer on /timer via react-timer-hook + persist endAt
    requirement: QUICK-3FN-01
    verification:
      - kind: other
        ref: pnpm exec tsc --noEmit -p tsconfig.app.json (timer files clean); rg react-timer-hook|restTimerStore
        status: pass
    human_judgment: true
    rationale: Background/tab-hide drift needs manual tab visibility check
  - id: D2
    description: Settings «Отдых между подходами» enable + duration default 2 min
    requirement: QUICK-3FN-02
    verification:
      - kind: other
        ref: rg restBetweenSetsEnabled|RestBetweenSetsSettingsCard
        status: pass
    human_judgment: false
  - id: D3
    description: Auto-start after add set; countdown in WorkoutSummaryCard
    requirement: QUICK-3FN-03
    verification:
      - kind: other
        ref: rg startRestBetweenSetsIfEnabled|RestCountdownBadge
        status: pass
    human_judgment: true
    rationale: End-to-end add-set → badge remaining needs UI pass

duration: 8min
completed: 2026-07-15
status: complete
---

# Phase 260715-3fn-2 Plan 01: Rest Timer Fix Summary

**Deadline-based rest timer (`react-timer-hook` + persisted `endAt`) with auto-start after sets and countdown in workout summary.**

## Performance

- **Duration:** 8 min
- **Started:** 2026-07-14T23:33:31Z
- **Completed:** 2026-07-14T23:42:00Z
- **Tasks:** 3/3
- **Files modified:** 16

## Accomplishments

- Replaced buggy nested `setInterval` countdown with `react-timer-hook` driven by Zustand `endAt` deadline (persist survives remount/background).
- Added settings «Отдых между подходами» (enabled by default, 2 min / 120 s, clamp 15–600) with profile export/import.
- After «Добавить подход» (and once after AI-fill append) starts rest when enabled; `RestCountdownBadge` shows remaining in «Общая информация о тренировке».

## Task Commits

1. **Task 1: Deadline rest timer store + react-timer-hook на /timer** - `a1cea5a` (feat)
2. **Task 2: Настройка «Отдых между подходами» (default 2 мин)** - `6e3ac06` (feat)
3. **Task 3: Автостарт после подхода + отображение в сводке тренировки** - `8748b62` (feat)

**Plan metadata:** skipped (commit_docs deferred to orchestrator per quick-task constraints)

## Files Created/Modified

- `src/features/timer/slice/restTimerStore.ts` — persist store: endAt, durationSec, pause/resume
- `src/features/timer/lib/useTimer.ts` — wraps react-timer-hook + store; single-fire expire notify
- `src/features/timer/ui/timer.tsx` / `TimerControls.tsx` — UI wired to new hook; tokenized button colors
- `src/features/timer/ui/RestCountdownBadge.tsx` — live MM:SS badge from endAt
- `src/entities/user/slice/userStore.ts` — restBetweenSetsEnabled / restBetweenSetsSec
- `src/features/exercise/ui/RestBetweenSetsSettingsCard.tsx` — Settings UI
- `src/features/exercise/ui/ExerciseBody.tsx` — auto-start rest after successful add / AI-fill
- `src/widgets/exerciseList/ui/WorkoutSummaryCard.tsx` — badge in summary header
- `package.json` / `pnpm-lock.yaml` — `react-timer-hook@^4.0.6`

## Decisions Made

- Source of truth is `endAt` (epoch ms); UI remaining from `react-timer-hook` with `restart` when store deadline changes.
- Pause stores `pausedRemainingMs` and clears `endAt`; resume rebuilds deadline from remaining.
- Expired `endAt` cleared on rehydrate merge so stale timers do not resurrect.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] pnpm virtual-store recreate before add**
- **Found during:** Task 1
- **Issue:** `pnpm add react-timer-hook` failed with virtual-store-dir-max-length mismatch
- **Fix:** `pnpm install --force` then `pnpm add react-timer-hook`
- **Files modified:** node_modules (recreated), package.json, pnpm-lock.yaml
- **Verification:** package.json contains `"react-timer-hook": "^4.0.6"`
- **Committed in:** `a1cea5a`

**2. [Rule 2 - Correctness] Isolate Task 3 ExerciseBody from unrelated AI WIP**
- **Found during:** Task 3
- **Issue:** Working tree had uncommitted AI-fill edits overlapping ExerciseBody
- **Fix:** Applied rest auto-start on HEAD ExerciseBody for atomic commit; restored AI WIP locally afterward (uncommitted)
- **Files modified:** ExerciseBody.tsx (committed rest hooks only)
- **Verification:** Commit `8748b62` does not include aiRecommendations WIP
- **Committed in:** `8748b62`

## Threat Flags

None beyond plan register (T-3FN-01 duration clamp applied; T-3FN-SC package name verified).

## Known Stubs

None.

## Self-Check: PASSED

- FOUND: `src/features/timer/slice/restTimerStore.ts`
- FOUND: `src/features/timer/ui/RestCountdownBadge.tsx`
- FOUND: `src/features/exercise/ui/RestBetweenSetsSettingsCard.tsx`
- FOUND: commits `a1cea5a`, `6e3ac06`, `8748b62`
