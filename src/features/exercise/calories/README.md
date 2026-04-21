# Workout Calories Flow

Актуальный сценарий расчёта ккал в модуле `features/exercise/calories`.

## Как это работает

1. При добавлении подхода в `ExerciseBody` записываются `startTime` и `endTime`:
   - первый подход: `startTime = now - defaultSetDurationSec`, `endTime = now + 15s`
   - следующий подход: `startTime = previousSet.endTime`, `endTime = now + 15s`
2. В момент добавления подхода калории **не** считаются.
3. Централизованный раннер `useWorkoutCaloriesRecalculationRunner` (app-level) раз в минуту:
   - берет упражнения выбранного дня из `calendarStore`
   - находит подходы без `calories` и с валидным окном (`startTime/endTime`)
   - считает ккал по HR (если данные доступны), иначе через MET fallback
   - батчем записывает результат в `applySetCaloriesBatchByDateKey`

## Ключевые файлы

- `lib/setTimeRange.ts` — формирование окна времени подхода
- `lib/collectPendingSetWindows.ts` — выбор подходов-кандидатов на пересчет
- `lib/recalculateMissingSetCalories.ts` — расчет ккал для отсутствующих значений
- `lib/useWorkoutCaloriesRecalculationRunner.ts` — минутный централизованный запуск
- `ui/ExerciseBody.tsx` — запись `startTime/endTime` при добавлении подхода
- `entities/calendarDay/slice/calendarStore.ts` — батч-апдейт `calories`
- `app/providers/WorkoutCaloriesRecalculationInit.tsx` — подключение раннера в app

## Условия запуска раннера

- только на native-платформе (`Capacitor.isNativePlatform()`)
- включен флаг `workoutCaloriesEnabled`
- профиль для расчета заполнен (`weight`, `age`, `gender`)

## Что не делать

- не возвращать расчет ккал в `handleAddSet`
- не писать частичные точечные апдейты для каждого подхода при тике
- не считать ккал для подходов без валидного окна времени
