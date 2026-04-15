<!-- GSD:project-start source:PROJECT.md -->
## Project

**MagFitDiary**

MagFitDiary is a workout tracking web app focused on fast logging for beginners in the gym. The main use case is to quickly record exercises and sets with weight and reps, then review progress over time. The current version works locally in the browser, with account-based sync planned for later.

**Core Value:** A beginner can log each workout quickly and clearly, and see measurable progress in weight and reps without friction.

### Constraints

- **Platform**: Web-first release — user wants browser usage now, native app later
- **Storage**: Local-first in v1 — auth/account sync deferred
- **Audience**: Beginners — UX must prioritize clarity and low cognitive load
- **Progress Metrics**: Weight and reps only — avoid extra complexity (RPE/rest) in v1
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- TypeScript (strict mode) - application code in `src/**/*.ts` and `src/**/*.tsx` (`tsconfig.json`, `src/app/main.tsx`).
- JavaScript (ES modules) - tooling/config and service worker in `eslint.config.js` and `src/app/providers/pwa/sw.js`.
- CSS - global styles in `src/app/styles/index.css`.
## Runtime
- Node.js runtime for local build/dev scripts (`package.json` scripts).
- Browser runtime for delivered app (`src/app/main.tsx`).
- Manager: Unknown (multiple lockfiles are present: `pnpm-lock.yaml`, `yarn.lock`, `package-lock.json`).
- Lockfile: present (multiple).
## Frameworks
- React `^19.1.1` - UI framework (`package.json`).
- React DOM `^19.1.1` - browser rendering (`package.json`, `src/app/main.tsx`).
- React Router DOM `^7.9.3` - routing (`src/app/main.tsx`, `src/app/router/routes.tsx`).
- Zustand `^5.0.8` - client state store (`package.json`, `src/entities/user/slice/userStore.ts`).
- Tailwind CSS `^4.1.16` with `@tailwindcss/vite` `^4.1.16` - styling pipeline (`package.json`, `vite.config.ts`).
- Not detected (no test runner config files and no test scripts in `package.json`).
- Vite via `rolldown-vite@7.1.12` alias - dev server and bundling (`package.json`, `vite.config.ts`).
- TypeScript `~5.8.3` - type-check/build step (`package.json`, `package.json` script `build`).
- ESLint `^9.36.0` + `typescript-eslint` `^8.44.0` - linting (`eslint.config.js`).
- Vite PWA plugin `^1.1.0` + Workbox - PWA/service worker generation (`vite.config.ts`, `pwa.config.ts`).
- Rollup visualizer plugin - bundle analysis (`vite.config.ts`).
## Key Dependencies
- `axios` `^1.12.2` - HTTP client with interceptors and auth token refresh (`src/shared/api/interceptors.ts`).
- `react-router-dom` `^7.9.3` - route composition and navigation (`src/app/main.tsx`, `src/widgets/loginForm/ui/LoginForm.tsx`).
- `zustand` `^5.0.8` - auth/user domain state (`src/entities/user/slice/userStore.ts`).
- `tailwindcss` `^4.1.16` - primary styling system (`package.json`, `vite.config.ts`).
- `vite-plugin-pwa` `^1.1.0` - offline and service worker integration (`vite.config.ts`, `pwa.config.ts`).
- `@vitejs/plugin-react` `^5.0.3` - React transform/Fast Refresh (`vite.config.ts`).
- `eslint` `^9.36.0` - static analysis (`eslint.config.js`).
## Configuration
- API base URL is configured via `import.meta.env.VITE_API_URL` in `src/shared/api/interceptors.ts`.
- `.env` file exists in repository root; contents not inspected (secret-bearing file).
- Additional required environment variables: unknown from available code evidence.
- `vite.config.ts` configures plugins, aliases, and chunk strategy.
- `tsconfig.json` configures strict TypeScript and path aliases (`@/*`).
- `vercel.json` rewrites all routes to `/` for SPA routing.
- `pwa.config.ts` configures web app manifest and runtime caching behavior.
## Platform Requirements
- Node.js (version not declared in `.nvmrc`, `.node-version`, or `package.json` engines).
- npm/pnpm/yarn CLI (exact required manager unknown due multiple lockfiles).
- Static frontend hosting compatible with SPA rewrites (`vercel.json` indicates Vercel-style deployment).
- Separate backend API endpoint must be reachable through `VITE_API_URL` (`src/shared/api/interceptors.ts`).
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Naming Patterns
- UI-компоненты смешивают `PascalCase` и `camel/lowercase`: `src/widgets/loginForm/ui/LoginForm.tsx`, `src/features/timer/ui/timer.tsx`, `src/widgets/allExercises/ui/allExercises.tsx`.
- CSS Modules используют суффикс `.module.css`: `src/widgets/loginForm/ui/LoginForm.module.css`, `src/entities/calendarDay/ui/Day.module.css`.
- Баррели слоев оформлены через `index.ts`: `src/widgets/index.ts`, `src/pages/index.ts`, `src/entities/user/index.ts`.
- Компоненты в основном объявляются как `const` + стрелочная функция: `src/widgets/header/ui/Header.tsx`, `src/features/fullExerciseList/ui/DeleteDialog.tsx`.
- Обработчики чаще называют по шаблону `*Handler` или `handle*`: `inputHandler` в `src/widgets/loginForm/ui/LoginForm.tsx`, `handleBlur` в `src/features/createExercise/lib/useCategorySelector.ts`.
- Булевы флаги обычно с префиксом `is*`: `isRunning` в `src/features/timer/lib/useTimer.ts`.
- Состояние форм задается объектом через `useState`: `loginFormState` в `src/widgets/loginForm/ui/LoginForm.tsx`.
- Объектные контракты оформляются через `interface`: `IUserResponse` в `src/entities/user/api/userApi.ts`, `Exercise` в `src/entities/exercise/model/types.ts`.
- Часто используется `type`-import для типов из библиотек: `src/entities/exercise/model/types.ts`, `src/shared/ui/button/CustomButton.tsx`.
## Code Style
- Инструмент форматирования: `Prettier` (зависимость в `package.json`).
- Выявленная настройка: `"quoteProps": "preserve"` в `.prettierrc`.
- Отдельного скрипта `format`/`prettier --check` в `package.json` нет.
- Инструмент: `ESLint` c flat config в `eslint.config.js`.
- База правил: `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `eslint-plugin-react-x`, `eslint-plugin-react-dom`.
- В конфиге нет кастомных локальных правил (`rules: {}`), опора на preset-ы.
- Tailwind-классы оставлять inline в JSX/TSX; не выносить className-строки в переменные/константы, кроме случаев переиспользования через `cva`.
## Import Organization
- Основной алиас `@/*` задан в `tsconfig.json`, `tsconfig.app.json`, `vite.config.ts`.
- Дополнительный алиас `"@/ui"` задан в `vite.config.ts`.
## Error Handling
- В API interceptor используется `try/catch` и повтор запроса при `401`: `src/shared/api/interceptors.ts`.
- В UI встречается `Promise.then().catch()` с парсингом backend-ответа: `src/widgets/loginForm/ui/LoginForm.tsx`.
- Явная централизованная типизация ошибок не выявлена.
## Logging
- Информационные логи: `console.log` в `src/app/providers/pwa/register.ts`.
- Ошибки в async-операциях: `console.error` в `src/features/timer/lib/notifications.ts`.
- В проекте нет отдельного логгер-адаптера.
## Comments
- Комментарии редкие, в основном технические подсказки или отключения TS: `// @ts-ignore` в `src/app/providers/pwa/register.ts`.
- В конфиге встречаются закомментированные планы по расширению линтинга: `eslint.config.js`.
- Системного использования JSDoc/TSDoc не обнаружено в `src/**/*.ts(x)`.
## Function Design
- В проекте есть компактные хуки/компоненты (например `src/features/createExercise/lib/useCategorySelector.ts`) и более объемные UI-модули с инлайн-обработчиками (`src/widgets/loginForm/ui/LoginForm.tsx`).
- Явная типизация параметров применяется в публичных функциях API/хуках: `src/entities/user/api/userApi.ts`, `src/features/timer/lib/useTimer.ts`.
- В UI часто передаются callback-и как пропсы: `src/features/fullExerciseList/ui/DeleteDialog.tsx`.
- Хуки возвращают объект состояния и действий: `src/features/timer/lib/useTimer.ts`, `src/features/createExercise/lib/useCategorySelector.ts`.
- API-функции возвращают `Promise<AxiosResponse<...>>`: `src/entities/user/api/userApi.ts`.
## Module Design
- Преобладают named exports (`export const` / `export { ... }`) в `src`.
- `default export` в `src/**/*.ts(x)` не обнаружен.
- Баррели активно используются во всех FSD-слоях: `src/widgets/index.ts`, `src/features/*/index.ts`, `src/entities/*/index.ts`, `src/shared/*/index.ts`.
## Current Quality Gates
- `npm run lint` (`eslint .`) — единственный явный quality gate из `package.json`.
- `npm run build` запускает `tsc -b && vite build`, что дает типовую валидацию и сборочную проверку.
- CI workflow-файлы в `.github/workflows/*.yml` не обнаружены.
- Pre-commit/pre-push hooks (`.husky`, `lint-staged`, `commitlint`) не обнаружены.
## Practical Quality Risks
- Отсутствуют автоматизированные тесты и test-command, поэтому регрессии ловятся только линтом/сборкой.
- Непоследовательность нейминга файлов (`Timer.tsx` vs `timer.tsx`, `allExercises.tsx`) повышает когнитивную нагрузку.
- Смешение Tailwind и CSS Modules усложняет поддержку единого UI-стандарта (`src/widgets/loginForm/ui/LoginForm.module.css`, `src/features/timer/ui/timer.tsx`).
- Частые инлайн-обработчики в JSX увеличивают риск лишних рендеров и усложняют рефакторинг.
- Логирование через `console.*` без abstraction слоя ограничивает наблюдаемость в production.
## Evidence Sources
- **Scripts and dependencies:** `package.json`.
- **Lint config:** `eslint.config.js`.
- **Format config:** `.prettierrc`.
- **Type rules and path aliases:** `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`.
- **Build/runtime config:** `vite.config.ts`, `pwa.config.ts`, `vercel.json`.
- **Representative code samples:** `src/widgets/loginForm/ui/LoginForm.tsx`, `src/widgets/header/ui/Header.tsx`, `src/features/timer/lib/useTimer.ts`, `src/features/createExercise/lib/useCategorySelector.ts`, `src/shared/api/interceptors.ts`, `src/entities/user/api/userApi.ts`.
- **Test file scan:** search pattern `**/*.{test,spec}.{ts,tsx,js,jsx}` in workspace (no matches).
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern Overview
- Приложение стартует через `react-dom` и `BrowserRouter` из `src/app/main.tsx`.
- Роутинг реализован в `src/app/router/routes.tsx` с lazy-импортом страниц (`@/pages/*`).
- Основное бизнес-состояние хранится в сторах сущностей (`src/entities/*/slice/*.ts`), а UI-композиция идет через `pages -> widgets -> features/entities/shared`.
- API-клиент централизован в `src/shared/api/interceptors.ts`, используется из entity API (`src/entities/user/api/userApi.ts`).
## Layers
- Purpose: Точка входа, роутинг, app-level провайдеры (PWA, глобальные стили).
- Location: `src/app`
- Contains: `main.tsx`, `router/routes.tsx`, `providers/pwa/*`, `styles/index.css`
- Depends on: `pages`, `react-router-dom`, PWA инфраструктуру.
- Used by: Vite entrypoint (`index.html`/runtime).
- Purpose: Компоновка экранов маршрутов.
- Location: `src/pages`
- Contains: `HomePage`, `ExercisePage`, `TimerPage`, `LogInPage`
- Depends on: `widgets`, иногда `shared` UI.
- Used by: `src/app/router/routes.tsx` через lazy import.
- Purpose: Крупные UI-блоки экранов (header, календарь, списки).
- Location: `src/widgets`
- Contains: `weekCalendar`, `exerciseList`, `header`, `allExercises`, `loginForm`, `statisticCard`
- Depends on: `features`, `entities`, `shared`.
- Used by: `pages`, а также в отдельных местах `features` (факт нарушения направления импорта зафиксирован ниже).
- Purpose: Пользовательские сценарии (добавление упражнений, таймер, выбор месяца/недели, управление пресетами).
- Location: `src/features`
- Contains: `addExercise`, `exercise`, `fullExerciseList`, `createExercise`, `createPreset`, `timer`, `weekSwiper`, `monthSwiper`, `profileDropDownMenu`
- Depends on: `entities`, `shared`, местами на `widgets`.
- Used by: `widgets`, `pages`.
- Purpose: Доменное состояние и типы (пользователь, упражнения, календарные дни).
- Location: `src/entities`
- Contains: `model`, `slice`, `api`, частично `ui`.
- Depends on: `shared`; зафиксирован импорт типа из feature.
- Used by: `features`, `widgets`, `shared/api`.
- Purpose: Общие UI primitives, утилиты, константы, API-база.
- Location: `src/shared`
- Contains: `ui/shadCNComponents`, `lib`, `config`, `api`.
- Depends on: внешние библиотеки; местами на `entities` (например, типы в `storage.ts`).
- Used by: все вышележащие слои.
## Data Flow
- Zustand store per entity:
- Хранилище тренировок/календаря: localStorage по месячным ключам `MM-YYYY` в `src/shared/lib/storage.ts`.
## Key Abstractions
- Purpose: Единые точки входа для слоев/слайсов.
- Examples: `src/pages/index.ts`, `src/widgets/index.ts`, `src/entities/*/index.ts`, `src/features/*/index.ts`.
- Pattern: Barrel exports для сокращения импортов и стабилизации boundary.
- Purpose: Инкапсуляция бизнес-состояния и действий.
- Examples: `src/entities/user/slice/userStore.ts`, `src/entities/exercise/slice/exerciseStore.ts`, `src/entities/calendarDay/slice/calendarStore.ts`.
- Pattern: `create(...)` + частично `persist(...)`; действия обновляют состояние и инициируют persistence.
- Purpose: Централизованная HTTP-конфигурация и refresh-token flow.
- Examples: `src/shared/api/interceptors.ts`, `src/entities/user/api/userApi.ts`.
- Pattern: `axios.create` + interceptor chain.
## Entry Points
- Location: `src/app/main.tsx`
- Triggers: загрузка SPA клиентом.
- Responsibilities: подключение стилей, регистрация service worker, инициализация роутера.
- Location: `src/app/router/routes.tsx`
- Triggers: изменение URL в `BrowserRouter`.
- Responsibilities: сопоставление path -> page component, fallback redirect на `/`.
- Location: `src/app/providers/pwa/register.ts`
- Triggers: старт приложения.
- Responsibilities: подписка на update/offline callbacks `virtual:pwa-register`.
## Error Handling
- API ошибки формы логина обрабатываются в `.catch(...)` в `src/widgets/loginForm/ui/LoginForm.tsx`.
- Токен-рефреш и retry запроса реализованы в `src/shared/api/interceptors.ts`.
- Для роутов отсутствует отдельный error boundary в `src/app/router/routes.tsx`.
## Cross-Cutting Concerns
## Import Boundaries (Current State)
- Паттерн нисходящих зависимостей в целом присутствует (`pages` импортируют `widgets`, `widgets` импортируют `features/entities/shared`).
- Есть обход Public API внутри слоев, например:
- Есть нарушения FSD направления:
- Предполагается, что boundary-нарушения допущены осознанно как локальные компромиссы, а не как целевая архитектурная модель.
- Предполагается, что `LogInPage` (`src/pages/LogInPage`) используется в альтернативном роутинге/ветке, так как в текущем `AppRoutes` маршрут на нее отсутствует.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, or `.github/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
