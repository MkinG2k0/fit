---
status: complete
---

# Quick Task 260705-vmo: пропала статистика

## Summary

Восстановлен график тоннажа в `StatisticCard`.

## Changes

- `src/shared/lib/analyticsStorage.ts` — добавлен парсинг `catalogExerciseId` при чтении дней тренировок
- `src/entities/analytics/lib/calculateTrends.ts` — сопоставление по catalog id и имени упражнения
- `src/widgets/statisticCard/lib/calculateTonnage.ts` — передача обоих идентификаторов в расчёт тренда

## Verification

- `pnpm run build` — успешно
