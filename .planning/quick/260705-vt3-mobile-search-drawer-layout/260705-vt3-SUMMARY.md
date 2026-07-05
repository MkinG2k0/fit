---
status: complete
---

# Quick Task 260705-vt3 — Summary

## Выполнено

- Drawer «Добавьте упражнения» синхронизирует высоту с `visualViewport` при открытой клавиатуре.
- Триггер «Добавить упражнение» скрывается, пока drawer открыт.
- Убран лишний нижний отступ списка (`mb-28`) в drawer-контексте.
- Layout drawer переведён на flex-колонку с `h-dvh min-h-0`.
- В viewport добавлен `interactive-widget=resizes-content` для корректного resize на Android.

## Проверка

- `pnpm exec tsc --noEmit` — успешно.

## Файлы

- `src/features/addExercise/lib/useDrawerViewportStyle.ts`
- `src/features/addExercise/ui/AddExercise.tsx`
- `src/features/fullExerciseList/ui/fullExerciseCommand.tsx`
- `src/shared/ui/shadCNComponents/ui/drawer.tsx`
- `index.html`
