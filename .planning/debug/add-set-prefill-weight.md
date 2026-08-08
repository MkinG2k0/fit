---
status: awaiting_human_verify
trigger: "в прошлом дне кончились подходы их 2 но при добавить на след день все равно добавляется 45 кг а не 55 (последний подход)"
created: 2026-08-08T17:37:00Z
updated: 2026-08-08T17:42:00Z
---

# Debug: add-set-prefill-weight

## Symptoms

- **Expected:** Когда в прошлой тренировке закончились подходы (например, было 2), и в текущей день уже добавлены подходы сверх этого (в т.ч. с весом 55 кг как последний), «Добавить подход» должен подставить вес/повторы из **последнего подхода текущей** сессии (55 кг).
- **Actual:** После исчерпания подходов прошлой сессии (2 шт: 12×20 · 5×45) кнопка «Добавить подход» продолжает подставлять **последний подход прошлой** сессии (45 кг), даже если текущий последний подход уже 55 кг.
- **Errors:** нет
- **Timeline:** воспроизводится при включённой подстановке из прошлой тренировки; видно на скринах «Жим лежа» (прошлый раз 2 подхода, сегодня 3-й = 55, 4-й ошибочно = 45).
- **Reproduction:**
  1. Включить подстановку подходов из прошлой тренировки.
  2. Прошлая сессия: 2 подхода (например 12×20, 5×45).
  3. Сегодня: добавить упражнение → подходы 1–2 из прошлой; добавить 3-й и выставить 55 кг; нажать «Добавить подход».
  4. Наблюдать: 4-й подход = 45 кг вместо 55.

## Current Focus

hypothesis: CONFIRMED — overflow fallback to previous-session last set overwrote current last set
test: logic simulation + tsc + eslint
expecting: pass
next_action: human verify reproduction scenario in UI; then archive on "confirmed fixed"

## Evidence

- timestamp: 2026-08-08T17:37:00Z
  - `src/features/exercise/ui/ExerciseBody.tsx` ~171–198: `weight/reps` сначала берутся из `lastSet` текущего упражнения, затем при `prefillFromLastSession` безусловно перезаписываются prefillaом прошлой сессии.
  - `src/shared/lib/findLastExerciseSession.ts` `getSetPrefillFromLastSession`: `lastSets[targetIndex] ?? lastSets[lastSets.length - 1]` — при нехватке подходов всегда последний **прошлой** сессии.
  - Settings copy (`ExerciseCardDisplaySettingsCard.tsx`): документирует текущее (спорное) поведение «если подходов было меньше — берётся последний» без уточнения «текущей vs прошлой».

- timestamp: 2026-08-08T17:40:00Z
  checked: Full handleAddSet + getSetPrefillFromLastSession + first-set useEffect caller
  found: Root cause confirmed. First-set path uses index 0 only (unaffected by overflow). Only handleAddSet hits overflow path.
  implication: Fix priority in handleAddSet; remove overflow fallback from helper so API matches intended semantics.

- timestamp: 2026-08-08T17:42:00Z
  checked: Logic simulation (4 cases) + `pnpm exec tsc -b` + eslint on changed files
  found: ALL PASS for overflow→55, match index1→45, first→20, past+empty→45; tsc/eslint exit 0
  implication: Fix addresses root cause; needs human UI confirmation

## Eliminated

(none)

## Resolution

- root_cause: При `prefillFromLastSession` `handleAddSet` безусловно перезаписывал вес/повторы через `getSetPrefillFromLastSession`, а хелпер при `targetIndex >= lastSets.length` всегда возвращал последний подход **прошлой** сессии, игнорируя текущий lastSet (55 → 45).
- fix: В `handleAddSet` — matching prefill только пока `nextSetIndex < lastSession.sets.length`; за пределами сохраняется текущий lastSet; fallback на последний прошлой только если текущего usable lastSet нет. Хелпер больше не делает overflow-fallback. Подсказка в настройках обновлена.
- verification: Симуляция сценариев PASS; `tsc -b` и eslint на изменённых файлах — exit 0. UI human-verify pending.
- files_changed:
  - src/features/exercise/ui/ExerciseBody.tsx
  - src/shared/lib/findLastExerciseSession.ts
  - src/features/exercise/ui/ExerciseCardDisplaySettingsCard.tsx
