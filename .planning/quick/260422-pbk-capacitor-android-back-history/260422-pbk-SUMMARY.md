# Quick Task 260422-pbk — Summary

## Выполнено

- Добавлен провайдер `AndroidBackNavigation`, который подписывается на `App.addListener("backButton")` в native Android.
- При нажатии системного Back выполняется `window.history.back()` при наличии истории, что повторяет браузерную навигацию внутри WebView.
- Провайдер подключён в `src/app/main.tsx`, чтобы поведение действовало на всём приложении.
- Добавлена зависимость `@capacitor/app` для корректной работы обработчика событий приложения в Capacitor.

## Проверка

- `pnpm exec tsc --noEmit` — успешно.
