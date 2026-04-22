# Quick Task 260422-pto

## Goal

Использовать Capacitor Camera API для выбора фото упражнения вместо ручного `input type="file"`.

## Tasks

1. Перевести загрузку фото в `CreateExercise` на `Camera.chooseFromGallery` с мультивыбором.
2. Сохранить текущие ограничения: максимум фото и лимит размера.
3. Конвертировать `webPath` в data URL для сохранения в сторе.

## Verify

- `pnpm exec tsc --noEmit`
