# Architecture Patterns — Workout Tracking (Integration Plan)

**Domain:** Быстрый лог тренировки + графики прогресса + список категорий  
**Researched:** 2026-04-14  
**Context:** brownfield React + TypeScript + Zustand + FSD-like структура

## Recommended Architecture

Цель — не переделывать проект с нуля, а встроить `quick-log`, `progress charts` и `category list` в текущую схему `pages -> widgets -> features -> entities -> shared`, сохранив существующие Zustand-store и localStorage.

Рекомендуемая декомпозиция по слайсам:

- `entities/workout-log` (расширение текущего `entities/calendarDay`):
  - источник истины по логам тренировок (дата -> упражнения -> подходы);
  - селекторы для "последняя тренировка", "история упражнения", "агрегаты по датам".
- `entities/exercise` (существует):
  - каталог категорий и упражнений;
  - операции CRUD по категориям/упражнениям.
- `features/quickLog` (новый feature):
  - UI и orchestration быстрого ввода подходов;
  - работает только через actions entity-store, без своей доменной копии состояния.
- `features/progressChart` (новый feature):
  - построение серий (тоннаж, max weight, total reps) из entity-селекторов;
  - отображение графика и фильтров периода.
- `features/categoryList` (новый feature):
  - список/поиск/выбор категорий для фильтрации и добавления упражнений;
  - интеграция с уже существующими `createCategory`/`createExercise`.
- `widgets/workoutWorkspace` (новый widget):
  - композиция `CategoryList + QuickLog + ProgressChart` в одном рабочем экране.

## Component / Store Boundaries

| Component / Store | Responsibility | Reads | Writes | Communicates With |
|---|---|---|---|---|
| `useCalendarStore` (existing, evolve) | Логи тренировок, подходы, выбранная/наблюдаемая дата | localStorage (`MM-YYYY`) | localStorage через helpers | `features/quickLog`, `features/progressChart`, `widgets/exerciseList` |
| `useExerciseStore` (existing) | Категории и упражнения, пресеты | persisted Zustand state | persisted Zustand state | `features/categoryList`, `features/addExercise`, `features/createCategory` |
| `features/quickLog/ui/QuickLogPanel` | Быстрый ввод сетов (вес/повторы), добавление/удаление подхода | селекторы `calendarDay` + `exercise` | actions `addExercise`, `setExerciseValues`, `addSetToExercise`, `deleteSet` | `widgets/workoutWorkspace` |
| `features/progressChart/model/selectors` | Подготовка данных графика (агрегации по истории) | `calendarDay.days` + фильтры | - | `features/progressChart/ui/ProgressChartPanel` |
| `features/progressChart/ui/ProgressChartPanel` | UI периода/метрики и рендер графика | chart selectors | локальный UI state фильтров | `shared/ui/chart`, `widgets/workoutWorkspace` |
| `features/categoryList/ui/CategoryListPanel` | Выбор категории, быстрый фильтр упражнений | `exercise.exercises` | локальный UI state выбранной категории | `features/quickLog` (через props/контекст уровня widget) |
| `widgets/workoutWorkspace/ui/WorkoutWorkspace` | Склейка фич в один поток пользователя | feature outputs | локальный orchestration state (например activeExercise) | `pages/HomePage`/`pages/ExercisePage` |

Граница ответственности:
- **Entities**: доменные данные и бизнес-операции.
- **Features**: пользовательские сценарии вокруг данных entities.
- **Widget**: координация взаимодействия между несколькими features.
- **Page**: только размещение widget и route-level layout.

## Data Flow Direction

### 1) Quick-log (основной сценарий)
1. Пользователь выбирает категорию в `CategoryListPanel`.
2. `CategoryListPanel` передаёт выбранный category/exercise в `QuickLogPanel` (через widget-связку).
3. `QuickLogPanel` вызывает action `useCalendarStore.addExercise(...)` или обновляет существующее упражнение.
4. Пользователь вводит `reps/weight` -> `setExerciseValues(...)`.
5. `calendarStore` обновляет `days` и синхронизирует localStorage.
6. Обновлённые данные автоматически переиспользуются `ExerciseList` и `ProgressChartPanel`.

**Направление:** `UI(feature) -> entity action -> entity state -> selectors -> UI(widget/features)`.

### 2) Progress charts
1. Пользователь выбирает упражнение и период (7/30/90/all) в `ProgressChartPanel`.
2. Selector читает историю из `calendarDay.days` (не напрямую из localStorage в компоненте).
3. Selector строит серии: `tonnage`, `maxWeight`, `totalReps`.
4. UI-график рендерит готовые данные через `shared/ui/chart`.

**Критично:** убрать текущий паттерн прямого чтения storage в `StatisticCard`; графики должны зависеть от entity-store и selector-слоя.

### 3) Category list
1. `useExerciseStore.exercises` -> `CategoryListPanel`.
2. Panel даёт фильтр и выбор категории.
3. Выбор категории влияет на доступный список упражнений для quick-log.
4. Добавление новой категории остаётся в `features/createCategory`, но вход в flow делается из `CategoryListPanel` (через dialog trigger).

## Integration with Existing Code (No Greenfield Rewrite)

Использовать существующие точки и минимальные миграции:

- `src/entities/calendarDay/slice/calendarStore.ts` — оставить как ядро логов, добавить selector-friendly API (без смены хранилища).
- `src/entities/exercise/slice/exerciseStore.ts` — оставить для категорий/упражнений, расширить селекторами для фильтрации.
- `src/widgets/statisticCard/ui/statisticCard.tsx` — постепенно заменить на `features/progressChart`; не читать storage напрямую.
- `src/features/createExercise/ui/CategorySelector.tsx` и `src/features/createCategory/ui/CreateCategory.tsx` — переиспользовать в `features/categoryList`.
- `src/widgets/exerciseList/ui/ExerciseList.tsx` + `src/features/exercise/ui/ExerciseBody.tsx` — опора для `quick-log` v1, затем вынести связку статистики из widget в feature.

## Patterns to Follow

### Pattern 1: Selector-first analytics
**What:** Все расчёты графиков в `features/progressChart/model`, а не в JSX.  
**When:** Любая метрика прогресса (тоннаж/максимум/сумма повторений).  
**Example:**

```typescript
export const selectExerciseProgress = (
  days: Record<string, CalendarDay>,
  exerciseName: string,
  metric: "tonnage" | "maxWeight" | "totalReps",
) => {
  // 1) normalize days -> timeline
  // 2) aggregate by date
  // 3) return chart-friendly [{ date, value }]
};
```

### Pattern 2: Widget orchestration, feature isolation
**What:** Взаимосвязь category -> exercise -> log организуется в widget, а не через cross-import между features.  
**When:** Нужно связать 2+ user actions в один экранный flow.

### Pattern 3: Entity-only mutations
**What:** Изменения доменных данных только через `useCalendarStore`/`useExerciseStore` actions.  
**When:** Любой create/update/delete для тренировок, категорий, упражнений.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Direct storage reads in feature/widget UI
**Почему плохо:** дублирует source of truth, усложняет тесты и даёт рассинхрон.  
**Вместо:** читать state из entity-store + selectors.

### Anti-Pattern 2: FSD boundary violations (`features -> widgets`, `entities -> features`)
**Почему плохо:** обратные зависимости ломают переиспользование и мешают фазовой разработке.  
**Вместо:** переносить shared-логику вниз (`entities`/`shared`) и связывать на уровне `widgets/pages`.

### Anti-Pattern 3: Бизнес-логика агрегаций в JSX
**Почему плохо:** тяжело поддерживать и расширять метрики.  
**Вместо:** отдельные `model/selectors.ts`.

## Suggested Build Order and Dependencies

1. **Stabilize entity contracts**
   - Добавить selectors и типы для прогресса в `entities/calendarDay` + `entities/exercise`.
   - Зависимости: нет.
   - Блокирует: все следующие шаги.

2. **Implement `features/categoryList`**
   - Переиспользовать `CategorySelector` + интегрировать trigger на `CreateCategory`.
   - Зависимости: шаг 1 (селекторы категорий).
   - Блокирует: удобный flow для quick-log.

3. **Implement `features/quickLog`**
   - Вынести быстрый ввод подходов в отдельный feature (на базе текущего `ExerciseBody` поведения).
   - Зависимости: шаг 1 + шаг 2.
   - Блокирует: полноценный рабочий сценарий пользователя.

4. **Implement `features/progressChart`**
   - Вынести статистику из `widgets/statisticCard` в feature с selector-first моделью.
   - Зависимости: шаг 1; может идти параллельно шагу 3 после стабилизации selectors.
   - Блокирует: визуализация прогресса в новом workspace.

5. **Compose `widgets/workoutWorkspace` and connect pages**
   - Собрать category + quick-log + chart в единый экранный модуль.
   - Зависимости: шаги 2, 3, 4.
   - Выход: готовый route-level UX без greenfield-рефактора.

## Dependency Graph

`entities selectors` -> `categoryList` -> `quickLog` -> `workoutWorkspace`  
`entities selectors` -> `progressChart` -> `workoutWorkspace`

## Confidence

| Area | Confidence | Notes |
|---|---|---|
| Component/store boundaries | HIGH | Основано на текущих `calendarStore`/`exerciseStore` и реальных точках использования |
| Data flow | HIGH | Соответствует существующему update-path через Zustand actions + localStorage helpers |
| Build order | MEDIUM | Потребуется уточнить объём миграции `ExerciseBody` и `StatisticCard` при планировании фаз |

