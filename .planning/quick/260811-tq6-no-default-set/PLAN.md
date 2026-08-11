---
id: 260811-tq6-no-default-set
slug: no-default-set
status: complete
created: 2026-08-11
---

# PLAN: Убрать дефолтный первый подход

## Goal

При добавлении упражнения на день не создавать пустой подход «1» — список подходов начинается пустым, пользователь добавляет через «Добавить подход».

## Tasks

1. В `addExercise` не передавать `singleEmptySet`
2. Упростить `generateExercise` (всегда `sets: []`)
3. Оставить ветку `onlyEmptyPlaceholder` в `ExerciseBody` для уже сохранённых карточек с пустым placeholder
