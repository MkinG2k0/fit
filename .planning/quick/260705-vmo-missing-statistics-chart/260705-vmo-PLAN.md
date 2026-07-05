# Quick Task 260705-vmo: пропала статистика

## Problem

График тоннажа в модалке «Статистика» пустой после перехода на `catalogExerciseId`.

## Root cause

`readAllTrainingDaysFromStorage` не парсил `catalogExerciseId` из storage, а `calculateExerciseTonnageTrend` искал только по catalog id — совпадений не было.

## Tasks

1. Парсить `catalogExerciseId` в `analyticsStorage.parseExercise`
2. Сопоставлять упражнения по catalog id **или** по имени в `calculateExerciseTonnageTrend`
