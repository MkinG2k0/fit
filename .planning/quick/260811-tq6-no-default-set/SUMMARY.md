---
id: 260811-tq6-no-default-set
slug: no-default-set
status: complete
created: 2026-08-11
completed: 2026-08-11
---

# SUMMARY: Убрать дефолтный первый подход

## Result

Новое упражнение на дне создаётся с `sets: []`. Пустой подход «1» больше не появляется до нажатия «Добавить подход».

## Changes

- `calendarStore.addExercise` — убран флаг `singleEmptySet` и зависимость от `workoutCaloriesEnabled`
- `generateExercise` — всегда стартует с пустым массивом подходов

## Note

Ветка `onlyEmptyPlaceholder` в `ExerciseBody` оставлена для уже сохранённых карточек со старым пустым placeholder.
