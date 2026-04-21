# Quick task: шапка карточки упражнения

## Запрос

- Настройки: показ ккал в шапке карточки (только если уже включён учёт ккал в UI).
- Настройки: показ суммарного объёма (тоннажа) в шапке.

## Реализация

- `userStore`: `exerciseCardShowKcalInHeader`, `exerciseCardShowTotalVolumeInHeader` (по умолчанию true); при выключении учёта ккал — сброс флага ккал в шапке.
- `ExerciseCardDisplaySettingsCard`: два чекбокса; ккал disabled без `useWorkoutCaloriesUiEnabled()`.
- `ExerciseCard`: условный рендер; разделитель «•» только если видны и ккал, и объём.
- Экспорт/импорт профиля: поля в `appSettingsSectionRegistry.ts`.
