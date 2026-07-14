# Quick Task 260715-0qr: Автозаполнение из load-table - Context

**Gathered:** 2026-07-14
**Status:** Ready for planning

<domain>
## Task Boundary

Если упражнение есть в таблице нагрузок (load-table), автозаполнять подходы и вес в карточке упражнения по плану текущей недели. Неделя вычисляется по числу сессий с `createdAt`. В `LoadTableDetail`: подсветка текущей недели, кнопка «Отслеживать» (сверху — именно ею добавляем префилл), кнопка «Сбросить» с Confirm-модалкой (обновляет `createdAt`, обнуляя счёт недель).

</domain>

<decisions>
## Implementation Decisions

### Выбор недели (вес / reps)
- Вариант 4: неделя из числа тренировочных сессий этого `catalogExerciseId`.
- Считать только сессии **с даты `createdAt`** упражнения в load-table (включительно), не всю историю до добавления.
- Формула: `week = min(16, floor(sessionCount / 2) + 1)` (план 2 раза в неделю).
- Сессия = календарный день, где у упражнения есть хотя бы один подход с `reps > 0` или `weight > 0`.
- Вес: `roundToHalfKg(maxKg * percent / 100)` из строки schedule; reps из той же строки; всегда **3 подхода** с одинаковыми weight/reps.

### Кнопка «Отслеживать» (сверху таблицы)
- В `LoadTableDetail` сверху — кнопка «Отслеживать».
- По нажатию применяется префилл текущей недели в карточку упражнения на **выбранном дне календаря** (если упражнение с этим `catalogExerciseId` уже есть в дне): выставить 3 подхода с weight/reps плана (или довести до 3 / обновить пустые — на усмотрение реализации, цель: пользователь сразу видит нужный вес и повторы).
- Если упражнения в выбранном дне нет — показать понятное сообщение (toast/текст), не падать молча.
- Приоритет: значения из load-table при этом действии сильнее «прошлой сессии».

### Подсветка текущей недели
- В `LoadTableWeekGrid` визуально отмечать строку `currentWeek` (token-классы: `bg-muted` / `bg-accent` или аналог из темы, без raw hex).

### Сброс цикла
- Кнопка «Сбросить» рядом с «Отслеживать».
- Confirm-модалка (паттерн AlertDialog / DeleteDialog в проекте): предупредить, что счёт недель обнулится.
- По подтверждению: `createdAt = new Date().toISOString()` у записи load-table (через store action, например `resetExerciseProgress(id)`), после чего текущая неделя снова 1.

### Claude's Discretion
- Как именно мержить существующие подходы при «Отслеживать» (заменять все / только нулевые) — выбрать наиболее предсказуемый UX для новичка (скорее заменить/синхронизировать до 3 подходов плана).
- Точный текст кнопок/модалки на русском.
- Где читать бакеты журнала для подсчёта сессий — переиспользовать storage helpers рядом с `findLastExerciseSession` / month buckets.

</decisions>

<specifics>
## Specific Ideas

- Пользователь явно выбрал: не фоновый таймер недель, а пересчёт в момент действия.
- Сброс = обновление `createdAt`, отдельное поле `currentWeek` не вводить.
- UI сфокусирован на `LoadTableDetail` + применение в дневник через «Отслеживать».

</specifics>

<canonical_refs>
## Canonical References

- `src/entities/loadTable/model/schedule.ts` — 16-недельный план
- `src/entities/loadTable/lib/buildWeekRows.ts` — вес по %
- `src/features/loadTable/ui/LoadTableDetail.tsx` — деталь упражнения
- `src/features/loadTable/ui/LoadTableWeekGrid.tsx` — сетка недель
- `src/entities/loadTable/slice/loadTableStore.ts` — persist + `createdAt`
- `src/shared/lib/findLastExerciseSession.ts` — паттерн чтения журнала
- `src/features/exercise/ui/ExerciseBody.tsx` — текущий prefill с прошлой сессии

</canonical_refs>
