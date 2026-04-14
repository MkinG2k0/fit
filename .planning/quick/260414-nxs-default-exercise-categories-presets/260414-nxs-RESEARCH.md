# Quick Task: Default Exercise Categories & Presets - Research

**Researched:** 2026-04-14  
**Domain:** Инициализация дефолтных данных упражнений/пресетов в текущем FSD-коде  
**Confidence:** HIGH

## Summary

Текущая архитектура уже использует правильную точку для дефолтного набора: `src/shared/config/constants.ts` импортируется в `src/entities/exercise/slice/exerciseStore.ts` и кладется в начальное Zustand-состояние (`exercises`, `trainingPreset`). [VERIFIED: codebase]

Главный риск не в добавлении данных, а в том, что `persist`-store с ключом `exercise-store` не переинициализируется после первого запуска: существующие пользователи не получат новые дефолтные категории/пресеты автоматически без merge-логики при hydrate. [VERIFIED: codebase]

**Primary recommendation:** хранить канонический дефолт в `constants.ts`, а в `exerciseStore.ts` добавить безопасный merge-on-hydrate (добавляет только отсутствующие категории/пресеты, не затирая пользовательские изменения). [VERIFIED: codebase]

## User Constraints

`CONTEXT.md` для этого quick-task не найден, поэтому locked/discretion/deferred ограничения отсутствуют. [VERIFIED: codebase]

## Project Constraints (from .cursor/rules/)

Директория `.cursor/rules/` в репозитории отсутствует; обязательные ограничения взяты из `AGENTS.md` и user rules текущей сессии. [VERIFIED: codebase]

## Standard Stack (для этой задачи)

| Layer | Current choice | Как использовать в этой задаче |
|------|----------------|----------------------------------|
| Shared config | `src/shared/config/constants.ts` | Канонический seed категорий/пресетов |
| Entity store | `useExerciseStore` + `persist` (`exercise-store`) | Инициализация + миграционное слияние дефолтов |
| Feature UI | `CreatePreset`, `FullExerciseCommand` | Автоматически потребляют обновленный store |
| Widget UI | `AllExercises` | Точка интеграции командного списка и модалок |

Новые библиотеки не нужны. [VERIFIED: codebase]

## Architecture Patterns (рекомендуемые)

### Pattern 1: Single source of truth для дефолтов
- Держать дефолтные категории и пресеты только в `src/shared/config/constants.ts`. [VERIFIED: codebase]
- В сторе использовать constants как источник initial-state и как источник merge при миграции. [VERIFIED: codebase]

### Pattern 2: Non-destructive localStorage migration
- При hydrate объединять persisted данные с актуальными defaults:
  - категории: добавлять отсутствующие категории;
  - упражнения внутри категории: добавлять отсутствующие строки без дублей;
  - пресеты: добавлять отсутствующие по `presetName` (case-insensitive). [ASSUMED]
- Ничего не удалять автоматически из пользовательских данных. [ASSUMED]

### Pattern 3: UI остается thin
- Не добавлять бизнес-логику миграции в `CreatePreset`/`FullExerciseCommand`/`AllExercises`; только в entity store. [VERIFIED: codebase]

## Integration Points (UI + Store)

1. `src/entities/exercise/slice/exerciseStore.ts`  
   - Сейчас: берет `allExercises`/`trainingPreset` как initial state и сохраняет через `persist`. [VERIFIED: codebase]  
   - Нужно: merge defaults с persisted state при старте. [ASSUMED]

2. `src/shared/config/constants.ts`  
   - Сейчас: уже содержит массивы категорий и пресетов. [VERIFIED: codebase]  
   - Нужно: расширить дефолтный каталог (категории/упражнения/пресеты). [ASSUMED]

3. `src/features/fullExerciseList/ui/fullExerciseCommand.tsx`  
   - Читает `state.exercises` и `state.trainingPreset`; UI автоматически покажет новые значения без изменений разметки. [VERIFIED: codebase]

4. `src/features/createPreset/ui/CreatePreset.tsx`  
   - Использует `state.exercises` для выбора упражнений пресета; новые категории/упражнения появятся сразу после обновления store. [VERIFIED: codebase]

5. `src/widgets/allExercises/ui/allExercises.tsx`  
   - Использует `FullExerciseCommand` и модалки создания; отдельной интеграции под defaults не требует. [VERIFIED: codebase]

## Don't Hand-Roll

| Problem | Не делать | Делать |
|---------|-----------|--------|
| Дедупликация категорий/пресетов | ad-hoc проверки в каждом UI-компоненте | централизованный dedupe/merge в `exerciseStore.ts` |
| Миграция localStorage | manual reset `localStorage` для пользователей | мягкое merge-on-hydrate без потери пользовательских данных |
| i18n-строки | смешанные константы текста по компонентам | хранить display-строки в одном месте (`constants.ts` или i18n-слой) |

## Common Pitfalls and Risks

1. **Дубли после обновления дефолтов**  
   Причина: нет case-insensitive нормализации при merge. [ASSUMED]

2. **Пользователи не получают новые defaults**  
   Причина: `persist` держит старый snapshot и игнорирует обновленный initial state. [VERIFIED: codebase]

3. **Ломаются пресеты, если упражнение удалено/переименовано**  
   Причина: пресет хранит массив имен, а не ID-ссылки. [VERIFIED: codebase]

4. **Непоследовательные русские строки (будущий i18n debt)**  
   Причина: строки категорий/упражнений/плейсхолдеров уже распределены по нескольким местам. [VERIFIED: codebase]

## Recommended File List (implementation)

1. `src/shared/config/constants.ts`  
   - обновить/расширить дефолтные категории, упражнения, пресеты.

2. `src/entities/exercise/slice/exerciseStore.ts`  
   - добавить функцию merge defaults + persisted state при hydrate;
   - добавить внутренние helper-функции dedupe (case-insensitive).

3. `src/entities/exercise/model/types.ts` *(опционально)*  
   - если потребуется расширить метаданные дефолтных пресетов/категорий (например, `id`/`slug`).

4. `src/features/createPreset/ui/CreatePreset.tsx` *(опционально)*  
   - только если нужно улучшить UX обработки дубликатов/невалидных ссылок упражнений.

5. `src/features/fullExerciseList/ui/fullExerciseCommand.tsx` *(опционально)*  
   - только если нужно добавить явный маркер «дефолтная категория/пресет».

## Environment Availability

Step 2.6: SKIPPED (задача code/config-only, внешние зависимости не требуются). [VERIFIED: codebase]

## Validation Architecture

`workflow.nyquist_validation = true` в `.planning/config.json`. [VERIFIED: codebase]

| Property | Value |
|----------|-------|
| Framework | Отдельный тест-фреймворк не обнаружен |
| Quick run command | `npm run lint` |
| Full suite command | `npm run build` |

Wave 0 gap: добавить хотя бы unit-тесты merge-логики стора (пока инфраструктура тестов не обнаружена). [VERIFIED: AGENTS.md]

## Security Domain

Для этой задачи критичны в основном целостность данных и безопасная миграция локального состояния; auth/session/crypto не затрагиваются напрямую. [ASSUMED]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Merge нужно делать автоматически при hydrate | Architecture Patterns | Новые defaults не доедут до существующих пользователей |
| A2 | Дедупликация должна быть case-insensitive везде | Common Pitfalls | Дубли в UI и пресетах |
| A3 | Безопасно не удалять legacy значения автоматически | Architecture Patterns | Могут остаться «мусорные» элементы, но не потеряются пользовательские данные |

## Sources

### Primary (HIGH confidence)
- `src/shared/config/constants.ts` - текущий каталог дефолтных категорий/пресетов. [VERIFIED: codebase]
- `src/entities/exercise/slice/exerciseStore.ts` - структура store, `persist`, CRUD-операции. [VERIFIED: codebase]
- `src/features/createPreset/ui/CreatePreset.tsx` - использование `state.exercises` и проверки дублей пресетов. [VERIFIED: codebase]
- `src/features/fullExerciseList/ui/fullExerciseCommand.tsx` - отображение категорий/упражнений/пресетов из store. [VERIFIED: codebase]
- `src/widgets/allExercises/ui/allExercises.tsx` - композиция UI для списка и модалок. [VERIFIED: codebase]
- `.planning/config.json` - включенная nyquist-валидация. [VERIFIED: codebase]

### Secondary (MEDIUM confidence)
- `AGENTS.md` - текущая архитектурная рамка и quality-gates проекта. [VERIFIED: codebase]

## Metadata

- Standard stack confidence: HIGH (все точки подтверждены кодом).  
- Architecture confidence: HIGH (поток данных и интеграции подтверждены кодом).  
- Pitfalls confidence: MEDIUM (часть рисков логически выведена из текущей модели данных).
