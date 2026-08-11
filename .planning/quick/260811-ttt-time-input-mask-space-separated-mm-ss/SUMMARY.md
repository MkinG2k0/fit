---
id: 260811-ttt-time-input-mask-space-separated-mm-ss
slug: time-input-mask-space-separated-mm-ss
status: complete
created: 2026-08-11
completed: 2026-08-11
---

# SUMMARY: Маска ввода времени

## Result

В подходах с типом «время» можно вводить `1 55` / `11 55` (минуты пробел секунды) или прежний `мм:сс`. Пока печатают — только цифры и один разделитель, секунды не больше 2 цифр. После blur сохраняется в секундах и показывается как `m:ss`.

## Changes

- `measurementTypes.ts` — `sanitizeTimeDraft`, расширенный `parseMmSsToSeconds` (пробел/`:` + минуты без секунд)
- `entities/exercise/index.ts` — экспорт `sanitizeTimeDraft`
- `ExerciseSetRow.tsx` — маска в onChange, placeholder `мм сс`
