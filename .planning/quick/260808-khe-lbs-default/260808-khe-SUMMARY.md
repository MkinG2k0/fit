---
phase: 260808-khe-lbs-default
plan: 01
subsystem: ui
tags: [measurement-type, exercise-catalog, zustand, free-weight, stack, time]

requires: []
provides:
  - "CatalogExercise.measurementType + measurementStep with normalize on hydrate"
  - "Create/settings UI to pick measurement type (default free_weight)"
  - "ExerciseSetRow UI branches for free_weight / stack step / mm:ss time"
affects: [logging-ui, exercise-catalog, settings]

tech-stack:
  added: []
  patterns:
    - "Duration stored as integer seconds in ExerciseSet.weight for time type"
    - "Unknown persisted measurementType coerces to free_weight"

key-files:
  created:
    - src/entities/exercise/model/measurementTypes.ts
    - src/features/createExercise/ui/CreateExerciseMeasurementSection.tsx
    - src/features/exercise/ui/MeasurementTypeSettingsCard.tsx
  modified:
    - src/shared/config/constants.ts
    - src/entities/exercise/slice/exerciseStore.ts
    - src/features/exercise/ui/ExerciseSetRow.tsx
    - src/features/exercise/ui/ExerciseBody.tsx
    - src/features/exercise/ui/ExerciseCard.tsx

key-decisions:
  - "Time duration lives in ExerciseSet.weight (seconds); no new set fields"
  - "Settings can change type only while current type is free_weight"
  - "stack_lbs not assigned in default catalog; available via create/settings"

patterns-established:
  - "Resolve measurementType from catalog via catalogExerciseId with free_weight fallback"
  - "Draft-string decimal weight preserved for free_weight; stacks snap to step"

requirements-completed: [QUICK-KHE-01, QUICK-KHE-02, QUICK-KHE-03, QUICK-KHE-04]

coverage:
  - id: D1
    description: "MeasurementType model, normalize helpers, catalog tags, store persist"
    requirement: QUICK-KHE-01
    verification:
      - kind: other
        ref: "pnpm exec tsc -b --pretty false"
        status: pass
    human_judgment: false
  - id: D2
    description: "Create form measurement picker (default free_weight) + Settings card for free_weight only"
    requirement: QUICK-KHE-02
    verification:
      - kind: other
        ref: "pnpm exec tsc -b --pretty false"
        status: pass
    human_judgment: true
    rationale: "Visual create/settings flow needs human confirmation of labels and list filtering"
  - id: D3
    description: "Set row UI by type; time excluded from card tonnage; last-session format hints"
    requirement: QUICK-KHE-03
    verification:
      - kind: other
        ref: "pnpm exec tsc -b --pretty false"
        status: pass
    human_judgment: true
    rationale: "Logging UX (stack snap, mm:ss) requires interactive verification"

duration: 7min
completed: 2026-08-08
status: complete
---

# Phase 260808-khe: lbs/measurement types Summary

**Типы замера end-to-end: модель + дефолтный каталог, выбор при создании/в настройках, UI подхода free_weight / стек / мм:сс без смены схемы журнала.**

## Performance

- **Duration:** 7 min
- **Started:** 2026-08-08T11:48:10Z
- **Completed:** 2026-08-08T11:55:13Z
- **Tasks:** 3
- **Files modified:** 16

## Accomplishments

- Добавлены `MeasurementType`, нормализация и хелперы мм:сс; legacy persist → `free_weight`.
- Дефолтный каталог размечен (кардио/планка/мобильность → time, блочные → stack_kg step 5).
- Create + Settings UI; строка подхода ветвится по типу; time не попадает в объём карточки.

## Task Commits

1. **Task 1: Модель measurementType + дефолтный каталог + store** - `cca4efe` (feat)
2. **Task 2: Выбор типа при создании + смена в настройках** - `c600116` (feat)
3. **Task 3: UI логирования подхода по типу замера** - `1ee153d` (feat)

**Plan metadata:** skipped (orchestrator docs commit; `commit_docs` handled outside executor)

## Files Created/Modified

- `src/entities/exercise/model/measurementTypes.ts` - union, normalize, step, mm:ss codec
- `src/entities/exercise/model/types.ts` - CatalogExercise.measurementType/Step
- `src/entities/exercise/lib/normalizeExerciseCategories.ts` - hydrate coerce
- `src/entities/exercise/slice/exerciseStore.ts` - create/update persist fields
- `src/entities/exercise/index.ts` - public exports
- `src/shared/config/constants.ts` - tagged built-in catalog
- `src/features/createExercise/model/types.ts` - NewExercise / edit source fields
- `src/features/createExercise/ui/CreateExerciseMeasurementSection.tsx` - type RadioGroup
- `src/features/createExercise/ui/CreateExercise.tsx` - wired picker + payloads
- `src/features/exercise/ui/MeasurementTypeSettingsCard.tsx` - settings change for free_weight
- `src/features/exercise/ui/ExerciseSetRow.tsx` - per-type inputs
- `src/features/exercise/ui/ExerciseBody.tsx` - resolve type, headers, pass props
- `src/features/exercise/ui/ExerciseCard.tsx` - skip tonnage for time
- `src/features/exercise/lib/useLastExerciseSession.ts` - pass type into findLast
- `src/shared/lib/findLastExerciseSession.ts` - formatSetCompact by type
- `src/pages/SettingsPage/ui/SettingsPage.tsx` - mount settings card

## Decisions Made

- Длительность time хранится в `ExerciseSet.weight` (целые секунды); reps = 0.
- В настройках смена типа только у текущих `free_weight`; после смены строка исчезает из списка.
- `stack_lbs` доступен в UI, но не назначается во встроенном каталоге.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Убран вызов `syncExerciseSetsFromPlan` из ExerciseBody**
- **Found during:** Task 3
- **Issue:** В рабочем дереве `calendarStore` больше не экспортирует `syncExerciseSetsFromPlan`, из‑за чего `tsc` падал на HEAD-версии ExerciseBody.
- **Fix:** Prefill из load-table оставлен через одиночный plan set при «Добавить подход»; bulk sync убран.
- **Files modified:** `src/features/exercise/ui/ExerciseBody.tsx`
- **Verification:** `pnpm exec tsc -b --pretty false`
- **Committed in:** `1ee153d`

**2. [Rule 3 - Blocking] Прокидка measurementType в edit/list payloads**
- **Found during:** Task 1
- **Issue:** После обязательного `measurementType` на `CatalogExerciseEditSource`/`NewExercise` ломались CreateExercisePage и список упражнений.
- **Fix:** Поля добавлены в reset/initial, CreateExercisePage, ExerciseItem, fullExerciseCommand.
- **Files modified:** CreateExercise*, CreateExercisePage, ExerciseItem, fullExerciseCommand
- **Verification:** `pnpm exec tsc -b --pretty false`
- **Committed in:** `cca4efe`

---

**Total deviations:** 2 auto-fixed (Rule 3 × 2)
**Impact on plan:** Необходимы для компиляции; поведение load-table bulk sync уже отсутствовало в dirty store.

## Issues Encountered

None beyond the blocking type/API mismatches above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Модель и UI готовы. Ручная проверка: create default free_weight, stack snap, time мм:сс, Settings фильтрация. Out of scope: AI fill / load-table / аналитика.

## Self-Check: PASSED

- FOUND: `src/entities/exercise/model/measurementTypes.ts`
- FOUND: `src/features/createExercise/ui/CreateExerciseMeasurementSection.tsx`
- FOUND: `src/features/exercise/ui/MeasurementTypeSettingsCard.tsx`
- FOUND: commit `cca4efe`
- FOUND: commit `c600116`
- FOUND: commit `1ee153d`

---
*Phase: 260808-khe-lbs-default*
*Completed: 2026-08-08*
