# Quick Task 260422-pto — Summary

## Выполнено

- Форма `CreateExercise` переведена с `input type="file"` на `Camera.chooseFromGallery` из `@capacitor/camera`.
- Добавлен мультивыбор через `allowMultipleSelection` и `limit` на оставшиеся слоты.
- `webPath` каждого выбранного фото конвертируется в data URL и сохраняется в `photoDataUrls`.
- Сохранены проверки: лимит количества фото и лимит размера каждого фото (2 МБ по metadata.size).

## Проверка

- `pnpm exec tsc --noEmit` — успешно.
