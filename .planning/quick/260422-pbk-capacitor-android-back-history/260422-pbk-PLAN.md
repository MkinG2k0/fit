# Quick Task 260422-pbk

## Goal

В Android-сборке на Capacitor системный back (кнопка/свайп) должен работать как браузерный `Back`: переходить назад по истории роутов, а не закрывать приложение.

## Tasks

1. Добавить app-level обработчик `backButton` через `@capacitor/app` только для Android native.
2. На событие back вызывать переход по `window.history.back()` при наличии истории.
3. Подключить обработчик в `src/app/main.tsx`, чтобы логика работала глобально.

## Verify

- `pnpm exec tsc --noEmit`
