# Codebase Structure

**Analysis Date:** 2026-04-14

## Directory Layout

```text
fit/
├── public/                          # Статические ассеты для Vite
├── src/                             # Исходный код приложения
│   ├── app/                         # Bootstrap, роутинг, глобальные провайдеры и стили
│   ├── pages/                       # Экранные композиции маршрутов
│   ├── widgets/                     # Крупные UI-блоки страниц
│   ├── features/                    # Пользовательские сценарии
│   ├── entities/                    # Доменные сущности, сторы, типы, API
│   └── shared/                      # Переиспользуемая база (ui/lib/config/api)
├── package.json                     # Скрипты и зависимости
├── tsconfig.json                    # Базовая TS-конфигурация и aliases
├── vite.config.ts                   # Сборка, aliases, PWA, чанки
└── vercel.json                      # SPA rewrite для деплоя
```

## Directory Purposes

**`src/app`:**
- Purpose: Инициализация приложения и инфраструктура приложения.
- Contains: `main.tsx`, `router/routes.tsx`, `providers/pwa/register.ts`, `styles/index.css`.
- Key files: `src/app/main.tsx`, `src/app/router/routes.tsx`.

**`src/pages`:**
- Purpose: Тонкие route-level контейнеры.
- Contains: `HomePage`, `ExercisePage`, `TimerPage`, `LogInPage`.
- Key files: `src/pages/HomePage/ui/HomePage.tsx`, `src/pages/ExercisePage/ui/ExercisePage.tsx`.

**`src/widgets`:**
- Purpose: Композиция feature/entity блоков для страниц.
- Contains: `weekCalendar`, `exerciseList`, `header`, `allExercises`, `loginForm`, `statisticCard`.
- Key files: `src/widgets/exerciseList/ui/ExerciseList.tsx`, `src/widgets/weekCalendar/ui/Calendar.tsx`, `src/widgets/index.ts`.

**`src/features`:**
- Purpose: Бизнес-функции пользовательских действий.
- Contains: `addExercise`, `exercise`, `fullExerciseList`, `createExercise`, `createPreset`, `timer`, `weekSwiper`, `monthSwiper`, `profileDropDownMenu`.
- Key files: `src/features/addExercise/ui/AddExercise.tsx`, `src/features/exercise/ui/ExerciseBody.tsx`.

**`src/entities`:**
- Purpose: Доменное состояние и контракты данных.
- Contains: `calendarDay`, `exercise`, `user` с подпапками `model`, `slice`, `api`, `ui`.
- Key files: `src/entities/calendarDay/slice/calendarStore.ts`, `src/entities/exercise/slice/exerciseStore.ts`, `src/entities/user/slice/userStore.ts`.

**`src/shared`:**
- Purpose: Общая платформа компонентов и утилит.
- Contains: `ui/shadCNComponents`, `ui/button`, `lib`, `config`, `api`.
- Key files: `src/shared/api/interceptors.ts`, `src/shared/lib/storage.ts`, `src/shared/config/constants.ts`.

## Key File Locations

**Entry Points:**
- `src/app/main.tsx`: клиентский bootstrap и подключение роутера.
- `src/app/router/routes.tsx`: корневой route graph и lazy loading страниц.

**Configuration:**
- `vite.config.ts`: aliases (`@`, `@/ui`), PWA, plugin chain, build/chunk rules.
- `tsconfig.json`: strict TS и path alias `@/* -> ./src/*`.
- `vercel.json`: rewrite всех путей на `/` для SPA.

**Core Logic:**
- `src/entities/calendarDay/slice/calendarStore.ts`: основной state-модуль тренировок по дням.
- `src/entities/exercise/slice/exerciseStore.ts`: каталог упражнений и пресетов.
- `src/entities/user/api/userApi.ts`: auth endpoint wrappers.
- `src/shared/lib/storage.ts`: localStorage стратегия чтения/записи по месяцам.

**Testing:**
- Not detected: в репозитории не найдены `*.test.*`, `*.spec.*`, `vitest/jest` конфиги.

## Naming Conventions

**Files:**
- UI-компоненты: PascalCase и mixed-case (`TimerPage.tsx`, `ExerciseCard.tsx`, `allExercises.tsx`, `weekSwiper.tsx`).
- Slices/stores: camelCase + `Store` (`calendarStore.ts`, `userStore.ts`, `exerciseStore.ts`).
- Barrel exports: `index.ts` в большинстве слайсов (`src/features/*/index.ts`, `src/entities/*/index.ts`, `src/widgets/index.ts`).

**Directories:**
- FSD-слои lower-case: `app`, `pages`, `widgets`, `features`, `entities`, `shared`.
- Слайсы и фичи именуются по домену/сценарию: `calendarDay`, `fullExerciseList`, `addExercise`.

## Where to Add New Code

**New Feature:**
- Primary code: `src/features/<featureName>/` с подпапками `ui`, `lib`, `model` (по текущему паттерну в существующих фичах).
- Tests: отдельного паттерна нет; рекомендуемое размещение пока не стандартизовано (assumption).

**New Component/Module:**
- Page-level composition: `src/pages/<PageName>/ui/<PageName>.tsx` + `src/pages/<PageName>/index.ts`.
- Widget-level composition: `src/widgets/<widgetName>/ui/*.tsx` + `src/widgets/<widgetName>/index.ts`.
- Entity store/type: `src/entities/<entityName>/slice|model|api`.

**Utilities:**
- Shared helpers: `src/shared/lib`.
- Shared UI primitives: `src/shared/ui` и `src/shared/ui/shadCNComponents/ui`.

## Import Boundary Snapshot

**Verified facts:**
- `pages` импортируют из `widgets` (`src/pages/HomePage/ui/HomePage.tsx`, `src/pages/TimerPage/ui/TimerPage.tsx`).
- `widgets` импортируют из `features/entities/shared` (`src/widgets/exerciseList/ui/ExerciseList.tsx`, `src/widgets/weekCalendar/ui/Calendar.tsx`).
- `entities` и `features` местами нарушают рекомендованные границы:
  - `src/entities/calendarDay/slice/calendarStore.ts` -> `@/features/exercise`.
  - `src/features/exercise/ui/ExerciseBody.tsx` -> `@/widgets/statisticCard`.
- Встречаются прямые импорты внутренних файлов вместо barrel API:
  - `src/widgets/allExercises/ui/allExercises.tsx` -> `@/features/fullExerciseList/ui/fullExerciseCommand`.
  - `src/shared/api/interceptors.ts` -> `@/entities/user/slice/userStore`.

**Assumptions:**
- Предполагается, что наличие `index.ts` в слайсах обозначает намерение использовать публичные API, даже если не все импорты им следуют.
- Предполагается, что текущая структура сохранится как базовый target layout, а не как промежуточная миграция.

## Special Directories

**`src/app/providers/pwa`:**
- Purpose: Service worker registration + source sw.
- Generated: Частично (runtime-артефакты генерируются plugin-ом, source-файлы хранятся в repo).
- Committed: Yes (исходные `register.ts`, `sw.js` присутствуют).

**`.planning/codebase`:**
- Purpose: Аналитические артефакты маппинга кодовой базы.
- Generated: Yes.
- Committed: Assumption (зависит от процесса команды; в текущем workspace директория была отсутствующей до записи).

---

*Structure analysis: 2026-04-14*
