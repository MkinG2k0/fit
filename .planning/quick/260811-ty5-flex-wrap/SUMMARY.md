---
id: 260811-ty5-flex-wrap
slug: flex-wrap
status: complete
created: 2026-08-11
completed: 2026-08-11
---

# SUMMARY: Тип замера — chip-кнопки с переносом

## Result

Секция «Тип замера» на форме создания/редактирования упражнения — ряд `Button` chip (default/outline) с `flex flex-wrap gap-2`. Вертикальный `RadioGroup` убран; логика смены типа, шаг стека и `disabled` без изменений.

## Changes

- `CreateExerciseMeasurementSection.tsx` — RadioGroup → wrapping Button chips; `role="radiogroup"` + `aria-pressed`; Label только у поля «Шаг»

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check: PASSED

- FOUND: `src/features/createExercise/ui/CreateExerciseMeasurementSection.tsx`
- FOUND: commit `1406218`
