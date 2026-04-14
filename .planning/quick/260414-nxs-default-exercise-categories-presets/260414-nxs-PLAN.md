---
id: 260414-nxs
type: quick
mode: quick
status: planned
source: .planning/quick/260414-nxs-default-exercise-categories-presets/260414-nxs-RESEARCH.md
---

# PLAN: Default Exercise Categories, Presets, Persist Safety

<objective>
Добавить/расширить дефолтные категории упражнений и тренировочные пресеты так, чтобы новые дефолты появлялись у новых и существующих пользователей без потери уже сохраненных данных в `exercise-store`.
</objective>

<context>
- `src/shared/config/constants.ts` — канонический источник дефолтных категорий/пресетов.
- `src/entities/exercise/slice/exerciseStore.ts` — Zustand `persist` store с ключом `exercise-store`.
- Риск: текущий persisted snapshot перекрывает initial state и не получает новые дефолты автоматически.
</context>

<tasks>

<task type="auto" id="1">
  <name>Расширить канонический каталог дефолтных категорий и пресетов</name>
  <files>
    src/shared/config/constants.ts
  </files>
  <action>
    Обновить `allExercises` и `trainingPreset`:
    1) добавить согласованный набор новых дефолтных категорий/упражнений;
    2) добавить дефолтные пресеты, которые используют упражнения из актуального каталога;
    3) нормализовать повторяющиеся значения (например, единый формат названий и `presetColor`), чтобы снизить риск дублей при merge в store.
  </action>
  <verify>
    <automated>npm run lint</automated>
  </verify>
  <done>
    В `constants.ts` присутствует новый полный дефолтный набор категорий/упражнений/пресетов без очевидных дублей и с единым форматом данных.
  </done>
</task>

<task type="auto" id="2">
  <name>Добавить безопасную миграцию persisted состояния с merge дефолтов</name>
  <files>
    src/entities/exercise/slice/exerciseStore.ts
  </files>
  <action>
    Реализовать non-destructive merge persisted данных и актуальных defaults на этапе hydrate:
    1) добавить helper-функции дедупликации категорий/упражнений/пресетов (case-insensitive сравнение);
    2) в `persist` настроить `version` и `migrate` (или эквивалентный hook merge), чтобы новые дефолты добавлялись в состояние автоматически;
    3) не удалять и не перезаписывать пользовательские сущности, если они уже существуют;
    4) гарантировать обратную совместимость для уже существующего `exercise-store` в localStorage.
  </action>
  <verify>
    <automated>npm run build</automated>
  </verify>
  <done>
    После hydrate в сторе остаются пользовательские данные, а отсутствующие дефолтные категории/пресеты автоматически добавляются без потери существующих значений.
  </done>
</task>

<task type="auto" id="3">
  <name>Проверить и зафиксировать безопасную интеграцию со сценариями UI</name>
  <files>
    src/features/fullExerciseList/ui/fullExerciseCommand.tsx
    src/features/createPreset/ui/CreatePreset.tsx
  </files>
  <action>
    Провести интеграционную корректировку потребителей стора:
    1) убедиться, что новые дефолты отображаются без дополнительных ручных действий;
    2) обработать пограничные случаи после миграции (например, пресет с упражнением, отсутствующим в текущем списке) безопасно для UI;
    3) не переносить бизнес-логику миграции в UI — UI только читает уже нормализованные данные из store.
  </action>
  <verify>
    <automated>npm run lint && npm run build</automated>
  </verify>
  <done>
    UI стабильно отображает обновленные категории и пресеты, не падает на легаси-данных и продолжает работать через единый источник истины в store.
  </done>
</task>

</tasks>

<success_criteria>
1. Новые пользователи получают актуальные дефолтные категории и пресеты из `constants.ts`.
2. Существующие пользователи после обновления получают недостающие дефолты без потери собственных данных.
3. `CreatePreset` и `fullExerciseCommand` корректно работают на мигрированном состоянии без регрессий.
</success_criteria>
