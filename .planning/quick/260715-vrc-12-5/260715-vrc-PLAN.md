---
phase: 260715-vrc-12-5
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/features/exercise/ui/ExerciseSetRow.tsx
  - src/features/loadTable/ui/LoadTableDetail.tsx
autonomous: true
requirements:
  - QUICK-VRC-01
must_haves:
  truths:
    - "В поле веса подхода можно ввести промежуточные строки вроде 12. и 12.5 без исчезновения точки."
    - "После blur/ухода с поля вес сохраняется как число (12.5), запятая нормализуется в точку."
    - "В MAX (кг) на деталке таблицы нагрузок десятичный ввод тоже не ломается на промежуточной точке."
  artifacts:
    - path: src/features/exercise/ui/ExerciseSetRow.tsx
      provides: "Draft-string weight input while focused; Number commit on blur"
    - path: src/features/loadTable/ui/LoadTableDetail.tsx
      provides: "Draft-string maxKg input while focused; Number commit on blur"
  key_links:
    - from: "ExerciseSetRow weight Input"
      to: "calendarStore.setExerciseValues"
      via: "onInputChange → Number only on commit/blur (not stripping trailing decimal mid-edit)"
    - from: "LoadTableDetail maxKg Input"
      to: "loadTableStore.updateExercise"
      via: "draft string → Number on blur/complete"
---

<objective>
Восстановить ввод дробного веса (например `12.5`) в UI логирования подходов: убрать проглатывание точки из-за controlled `number` → `String(set.weight)`.

Purpose: Новичок должен быстро набирать вес с десятичными кг без сброса курсора/точки.
Output: Исправленный weight input в `ExerciseSetRow` и тот же паттерн для MAX в `LoadTableDetail`.
</objective>

<execution_context>
@$HOME/.cursor/gsd-core/workflows/execute-plan.md
@$HOME/.cursor/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@src/features/exercise/ui/ExerciseSetRow.tsx
@src/features/exercise/ui/ExerciseBody.tsx
@src/entities/calendarDay/slice/calendarStore.ts
@src/features/loadTable/ui/LoadTableDetail.tsx
@src/features/bodyMetricsEntry/lib/useBodyMetricsForm.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Draft-string weight in ExerciseSetRow</name>
  <files>src/features/exercise/ui/ExerciseSetRow.tsx</files>
  <action>
    Root cause (verify, do not regress): `ExerciseSetRow` shows `value={String(set.weight)}` while `calendarStore.setExerciseValues` does `Number(value)` on every keystroke. `Number("12.") === 12`, so trailing decimal vanishes mid-edit.

    Fix only the weight field (reps stay integer as now):
    1. Add local draft state for weight while the weight input is focused (per-row state in this component is enough — no shared store change required).
    2. On focus: seed draft from current display (`""` when `isEmptySet`, else a stable string of `set.weight` without forcing trailing zeros).
    3. On change (weight): normalize `,` → `.`; allow only digits and at most one `.` (reject other characters); update draft. Do NOT push incomplete drafts that end with a lone `.` (or are only `.`) into `onInputChange` — keep them in draft only so the Input can show `12.`. When the draft is empty or a complete finite number (`12`, `12.5`, `.5`), call existing `onInputChange` so the store stays updated for volume/kcal; empty → existing path that becomes `0` via `Number("")`.
    4. On blur: commit final `Number` via `onInputChange` (normalize incomplete `12.` → `12`); clear focused/draft so subsequent renders again follow `set.weight`.
    5. While focused, Input `value` = draft; when not focused, keep current empty-set / `String(set.weight)` behavior.
    6. Keep `type="text"`, `inputMode="decimal"`, Tailwind token classes as-is. No CSS Modules. Do not change `setExerciseValues` signature. Do not alter reps handling except if shared `handleChange` must branch by `name === "weight"`.
    7. Out of scope: body-metrics form (already string drafts), AddLoadTableExerciseDialog (already string `maxKg` state).
  </action>
  <verify>
    <automated>pnpm exec tsc -b --pretty false</automated>
  </verify>
  <done>Typing `12.` then `5` in weight keeps the decimal point mid-edit; blur stores finite `12.5`; empty clears to 0 via existing store path.</done>
</task>

<task type="auto">
  <name>Task 2: Draft-string maxKg in LoadTableDetail</name>
  <files>src/features/loadTable/ui/LoadTableDetail.tsx</files>
  <action>
    Same controlled-number bug: `value={exercise.maxKg}` + `Number(event.target.value.replace(",", "."))` on every change drops intermediate decimals.

    1. Switch MAX input from `type="number"` to `type="text"` with `inputMode="decimal"` (and keep step semantics only as UX expectation, not HTML step attr if type is text).
    2. Mirror Task 1: local focused draft string; sanitize digits + one decimal; live-commit complete finite numbers via `updateExercise(..., { maxKg })`; incomplete trailing `.` stays in draft only; on blur commit finite number (clamp/reject negatives: maxKg must remain `>= 0`; non-finite → do not write NaN — keep previous maxKg or `0` consistently with current guard `!Number.isFinite`).
    3. When not focused, display from `exercise.maxKg`. Tailwind tokens only; no CSS Modules.
  </action>
  <verify>
    <automated>pnpm exec tsc -b --pretty false</automated>
  </verify>
  <done>MAX (кг) accepts intermediate `12.` / `12.5` without dropping the decimal; blur persists a finite non-negative number.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| UI input → local store | Untrusted keystrokes become weights in localStorage-backed Zustand |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-vrc-01 | Tampering | ExerciseSetRow weight / LoadTableDetail maxKg | low | mitigate | Sanitize to digits + single decimal; commit only finite numbers; never persist NaN |
| T-vrc-02 | Elevation of Privilege | N/A (local-only) | low | accept | No auth boundary in this quick fix |
| T-vrc-SC | Tampering | package installs | low | accept | No new dependencies in this plan |
</threat_model>

<verification>
- `pnpm exec tsc -b --pretty false` passes.
- Manual smoke (executor or follow-up human): focus weight → type `12.` → point visible → type `5` → blur → stored/display `12.5`; same for LoadTableDetail MAX.
</verification>

<success_criteria>
- Decimal weight entry works for set logging without mid-edit decimal loss.
- Load-table MAX field does not regress the same pattern.
- No new packages; no CSS Modules; pnpm-only verification.
</success_criteria>

<output>
Create `.planning/quick/260715-vrc-12-5/260715-vrc-SUMMARY.md` when done
</output>
