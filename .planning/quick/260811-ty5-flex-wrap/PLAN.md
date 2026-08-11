---
id: 260811-ty5-flex-wrap
slug: flex-wrap
status: complete
created: 2026-08-11
---

# PLAN: Тип замера — горизонтальные кнопки с переносом

## Goal

Секция «Тип замера» на форме создания/редактирования упражнения выглядит как ряд chip-кнопок с `flex-wrap` (перенос на следующую строку), а не вертикальный `RadioGroup`. Паттерн выбора — как у категорий (`Button` default/outline), но без горизонтального скролла.

## Scope

- **Change:** `src/features/createExercise/ui/CreateExerciseMeasurementSection.tsx`
- **Reference:** `src/features/createExercise/ui/CreateExerciseCategorySection.tsx` (Button + variant)
- **Do not change:** `MEASUREMENT_OPTIONS` values/labels; `onTypeChange` / `onStepChange` stack-step logic; step field UI; `disabled` behavior; parent form wiring

## Tasks

### Task 1: Replace RadioGroup with wrapping Button chips

**Files:** `src/features/createExercise/ui/CreateExerciseMeasurementSection.tsx`

**Actions:**

1. Remove `RadioGroup` / `RadioGroupItem` imports; keep `Label` for the step field only.
2. Import `Button` from `@/shared/ui/shadCNComponents/ui/button` (same as Category section).
3. Replace the vertical radio list with a wrapping chip row:
   - Container: `div` with `role="radiogroup"` and `aria-labelledby="exercise-measurement-type-label"` (keep existing label `id`).
   - Layout: `flex flex-wrap gap-2` (wrap when narrow — **not** `overflow-x-auto` / `flex-nowrap` like Category).
   - Each option: `Button type="button"` with:
     - `variant={value === option.value ? "default" : "outline"}`
     - `aria-pressed={value === option.value}`
     - `disabled={disabled}`
     - `className` inline only (e.g. `whitespace-nowrap`); no style-string constants
     - Tailwind tokens only — no hardcoded colors
4. On click (same logic as current `onValueChange`):
   - call `onTypeChange(nextType)`
   - if `isStackMeasurementType(nextType)` → `onStepChange(defaultMeasurementStep(nextType))`
   - else → `onStepChange(undefined)`
5. Leave the stack «Шаг» block unchanged.

**Verify:**

- `pnpm exec tsc -b --pretty false` (or project typecheck) passes for touched file
- Grep: no `RadioGroup` usage left in this file
- Visual: chips wrap on narrow width; selected = default, others = outline; disabled grays out

**Done when:**

- Measurement type is a horizontal wrapping button group
- Stack step still appears/clears correctly on type change
- A11y: labelled radiogroup + `aria-pressed` on buttons
- Disabled and options unchanged

## Out of scope

- Changing Category section to wrap
- Renaming measurement types or adding options
- Restyling the step number input
