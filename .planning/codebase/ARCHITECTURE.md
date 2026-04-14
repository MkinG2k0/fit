# Architecture

**Analysis Date:** 2026-04-14

## Pattern Overview

**Overall:** Frontend SPA на Feature-Sliced Design-подобной структуре с доменными Zustand-сторами и локальным persistent-хранилищем.

**Key Characteristics:**
- Приложение стартует через `react-dom` и `BrowserRouter` из `src/app/main.tsx`.
- Роутинг реализован в `src/app/router/routes.tsx` с lazy-импортом страниц (`@/pages/*`).
- Основное бизнес-состояние хранится в сторах сущностей (`src/entities/*/slice/*.ts`), а UI-композиция идет через `pages -> widgets -> features/entities/shared`.
- API-клиент централизован в `src/shared/api/interceptors.ts`, используется из entity API (`src/entities/user/api/userApi.ts`).

## Layers

**app:**
- Purpose: Точка входа, роутинг, app-level провайдеры (PWA, глобальные стили).
- Location: `src/app`
- Contains: `main.tsx`, `router/routes.tsx`, `providers/pwa/*`, `styles/index.css`
- Depends on: `pages`, `react-router-dom`, PWA инфраструктуру.
- Used by: Vite entrypoint (`index.html`/runtime).

**pages:**
- Purpose: Компоновка экранов маршрутов.
- Location: `src/pages`
- Contains: `HomePage`, `ExercisePage`, `TimerPage`, `LogInPage`
- Depends on: `widgets`, иногда `shared` UI.
- Used by: `src/app/router/routes.tsx` через lazy import.

**widgets:**
- Purpose: Крупные UI-блоки экранов (header, календарь, списки).
- Location: `src/widgets`
- Contains: `weekCalendar`, `exerciseList`, `header`, `allExercises`, `loginForm`, `statisticCard`
- Depends on: `features`, `entities`, `shared`.
- Used by: `pages`, а также в отдельных местах `features` (факт нарушения направления импорта зафиксирован ниже).

**features:**
- Purpose: Пользовательские сценарии (добавление упражнений, таймер, выбор месяца/недели, управление пресетами).
- Location: `src/features`
- Contains: `addExercise`, `exercise`, `fullExerciseList`, `createExercise`, `createPreset`, `timer`, `weekSwiper`, `monthSwiper`, `profileDropDownMenu`
- Depends on: `entities`, `shared`, местами на `widgets`.
- Used by: `widgets`, `pages`.

**entities:**
- Purpose: Доменное состояние и типы (пользователь, упражнения, календарные дни).
- Location: `src/entities`
- Contains: `model`, `slice`, `api`, частично `ui`.
- Depends on: `shared`; зафиксирован импорт типа из feature.
- Used by: `features`, `widgets`, `shared/api`.

**shared:**
- Purpose: Общие UI primitives, утилиты, константы, API-база.
- Location: `src/shared`
- Contains: `ui/shadCNComponents`, `lib`, `config`, `api`.
- Depends on: внешние библиотеки; местами на `entities` (например, типы в `storage.ts`).
- Used by: все вышележащие слои.

## Data Flow

**Flow 1: От открытия приложения до рендера страницы**

1. `src/app/main.tsx` вызывает `registerServiceWorker()` из `src/app/providers/pwa/register.ts`.
2. `createRoot(...).render()` монтирует `<BrowserRouter><AppRoutes/></BrowserRouter>`.
3. `src/app/router/routes.tsx` лениво грузит `HomePage`, `ExercisePage`, `TimerPage`.
4. `ProtectedRoute` в текущей реализации возвращает children без проверок.

**Flow 2: Работа с тренировками (добавление/редактирование)**

1. `HomePage` (`src/pages/HomePage/ui/HomePage.tsx`) рендерит `WeekSlider` и `ExerciseList`.
2. `ExerciseList` (`src/widgets/exerciseList/ui/ExerciseList.tsx`) читает `useCalendarStore` и в `useEffect` вызывает `loadDaysFromLocalStorage`.
3. `AddExercise` (`src/features/addExercise/ui/AddExercise.tsx`) выбирает упражнения/пресеты через `useExerciseStore`, сабмитит в `useCalendarStore.addExercise`.
4. `calendarStore` (`src/entities/calendarDay/slice/calendarStore.ts`) обновляет days и через `replaceExercises` пишет в localStorage (`src/entities/calendarDay/lib/exerciseHelpers.ts` -> `src/shared/lib/storage.ts`).
5. `ExerciseBody` (`src/features/exercise/ui/ExerciseBody.tsx`) изменяет значения подходов через `setExerciseValues`, `addSetToExercise`, `deleteSet`, `deleteExercise`.

**Flow 3: Аутентификация и API**

1. `LoginForm` (`src/widgets/loginForm/ui/LoginForm.tsx`) вызывает `loginRequest`/`registrationRequest` из `src/entities/user/api/userApi.ts`.
2. Запросы идут через `$api` (`src/shared/api/interceptors.ts`) с `baseURL` из `VITE_API_URL`.
3. Request interceptor добавляет bearer token из `useUserStore`.
4. Response interceptor на `401` вызывает `refreshTokensRequest`, обновляет token в `useUserStore`, повторяет запрос.

**State Management:**
- Zustand store per entity:
  - `useUserStore` (`src/entities/user/slice/userStore.ts`, persist).
  - `useExerciseStore` (`src/entities/exercise/slice/exerciseStore.ts`, persist).
  - `useCalendarStore` (`src/entities/calendarDay/slice/calendarStore.ts`, in-memory + localStorage sync).
- Хранилище тренировок/календаря: localStorage по месячным ключам `MM-YYYY` в `src/shared/lib/storage.ts`.

## Key Abstractions

**Public API via index.ts:**
- Purpose: Единые точки входа для слоев/слайсов.
- Examples: `src/pages/index.ts`, `src/widgets/index.ts`, `src/entities/*/index.ts`, `src/features/*/index.ts`.
- Pattern: Barrel exports для сокращения импортов и стабилизации boundary.

**Domain Stores:**
- Purpose: Инкапсуляция бизнес-состояния и действий.
- Examples: `src/entities/user/slice/userStore.ts`, `src/entities/exercise/slice/exerciseStore.ts`, `src/entities/calendarDay/slice/calendarStore.ts`.
- Pattern: `create(...)` + частично `persist(...)`; действия обновляют состояние и инициируют persistence.

**Shared API client:**
- Purpose: Централизованная HTTP-конфигурация и refresh-token flow.
- Examples: `src/shared/api/interceptors.ts`, `src/entities/user/api/userApi.ts`.
- Pattern: `axios.create` + interceptor chain.

## Entry Points

**Application bootstrap:**
- Location: `src/app/main.tsx`
- Triggers: загрузка SPA клиентом.
- Responsibilities: подключение стилей, регистрация service worker, инициализация роутера.

**Routing graph:**
- Location: `src/app/router/routes.tsx`
- Triggers: изменение URL в `BrowserRouter`.
- Responsibilities: сопоставление path -> page component, fallback redirect на `/`.

**PWA worker registration:**
- Location: `src/app/providers/pwa/register.ts`
- Triggers: старт приложения.
- Responsibilities: подписка на update/offline callbacks `virtual:pwa-register`.

## Error Handling

**Strategy:** Локальная обработка Promise-ошибок в виджетах + глобальный retry-path на 401 в axios interceptor.

**Patterns:**
- API ошибки формы логина обрабатываются в `.catch(...)` в `src/widgets/loginForm/ui/LoginForm.tsx`.
- Токен-рефреш и retry запроса реализованы в `src/shared/api/interceptors.ts`.
- Для роутов отсутствует отдельный error boundary в `src/app/router/routes.tsx`.

## Cross-Cutting Concerns

**Logging:** Точечный `console.log` в `src/app/providers/pwa/register.ts` (offline ready callback).

**Validation:** UI-уровень (например, ограничение длины числового ввода в `src/features/exercise/ui/ExerciseBody.tsx`).

**Authentication:** Технически реализовано через access token в `useUserStore` + axios interceptor; route-level guard пока формальный (`ProtectedRoute` возвращает children).

## Import Boundaries (Current State)

**Verified facts:**
- Паттерн нисходящих зависимостей в целом присутствует (`pages` импортируют `widgets`, `widgets` импортируют `features/entities/shared`).
- Есть обход Public API внутри слоев, например:
  - `src/widgets/allExercises/ui/allExercises.tsx` импортирует `@/features/fullExerciseList/ui/fullExerciseCommand`.
  - `src/shared/api/interceptors.ts` импортирует `@/entities/user/slice/userStore` напрямую.
- Есть нарушения FSD направления:
  - `src/entities/calendarDay/slice/calendarStore.ts` импортирует тип из `@/features/exercise`.
  - `src/features/exercise/ui/ExerciseBody.tsx` импортирует `@/widgets/statisticCard`.

**Assumptions:**
- Предполагается, что boundary-нарушения допущены осознанно как локальные компромиссы, а не как целевая архитектурная модель.
- Предполагается, что `LogInPage` (`src/pages/LogInPage`) используется в альтернативном роутинге/ветке, так как в текущем `AppRoutes` маршрут на нее отсутствует.

---

*Architecture analysis: 2026-04-14*
