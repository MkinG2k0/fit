---
status: complete
---

# Quick task 260705-vye — Summary

Убран UI выбора цвета при создании и редактировании пресетов.

## Changes

- `src/features/createPreset/ui/CreatePreset.tsx`: удалены Popover, кнопка с пипеткой и `RgbaColorPicker`; поле названия на всю ширину.
- `presetColor` сохраняется с дефолтным значением для совместимости с существующими пресетами и подсветкой упражнений.

## Verification

- `pnpm run build` — успешно.
