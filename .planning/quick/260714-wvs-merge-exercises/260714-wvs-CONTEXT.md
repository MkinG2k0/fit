# Quick Task 260714-wvs: Merge exercises - Context

**Gathered:** 2026-07-14
**Status:** Ready for planning

<domain>
## Task Boundary

Функционал объединения двух упражнений каталога: пользователь выбирает исходное (source) и целевое (target), оставляет target, ремапит все ссылки на source → target во всех локальных данных, удаляет source из каталога. Статистика derived on-the-fly — отдельного remapping analytics store нет.

</domain>

<decisions>
## Implementation Decisions

### Same-day collision (оба упражнения в одном дне тренировки)
- Оставить **две отдельные карточки** в дне, но у обеих `catalogExerciseId` (и name/categoryId по необходимости) = target. Не сливать подходы в одну карточку.

### UI entry + comparison modal
- Кнопка **«Смержить упражнение»** на экране/форме **изменения упражнения** (`CreateExercise` / edit flow с `/exercises/edit?id=...`), не в `RenameCategoryDialog`.
- По клику открывается **вторая модалка**: выбор target (или source уже зафиксирован как текущее редактируемое) + сравнение базовой инфы **обоих** упражнений, минимум:
  - названия
  - **всего повторов** (сумма reps по всей истории журнала)
  - по возможности кратко: число дней/сессий или подходов, чтобы выбрать куда мержить было понятно
- После подтверждения — выполнить merge (source → target), закрыть модалки, уйти со страницы edit source (source удалён).

### Data remapping (locked from requirements)
- Каталог `exercise-store`: удалить source entry, оставить target meta (имя/фото/описание target).
- `trainingPreset[].exercises`: заменить sourceId → targetId + дедуп.
- Все бакеты `MM-YYYY` + in-memory calendar: ремапить `catalogExerciseId` (и name/categoryId где уместно) source → target; instance UUID не трогать.
- Analytics отдельно не писать — пересчитаются после ремапа.

### Claude's Discretion
- Точный layout comparison modal и способ выбора второго упражнения (command/list select).
- Хелпер подсчёта total reps из `readAllTrainingDaysFromStorage`.
- FSD placement: domain action в `entities/exercise` (+ journal remap через calendar/storage), UI в `features` рядом с createExercise / fullExerciseList.

</decisions>

<specifics>
## Specific Ideas

- Пример пользователя: упр1 + упр2 → оставить упр2, все данные упр1 → упр2.
- Screenshot context: пользователь был на экране «Упражнения» с модалкой «Изменить категорию» — entry point для merge привязан к **edit упражнения**, не к rename категории.

</specifics>

<canonical_refs>
## Canonical References

- `src/entities/exercise/slice/exerciseStore.ts` — catalog + presets + `deleteExercise`
- `src/entities/calendarDay/slice/calendarStore.ts` — in-memory days
- `src/shared/lib/storage.ts` / `analyticsStorage.ts` — month buckets
- `src/entities/analytics/lib/normalizeTrainingSessions.ts` — stats key = `catalogExerciseId ?? id`
- `src/features/createExercise/ui/CreateExercise.tsx` (+ Footer) — edit UI
- `src/features/fullExerciseList/ui/DeleteDialog.tsx` / `RenameCategoryDialog.tsx` — dialog patterns

</canonical_refs>
