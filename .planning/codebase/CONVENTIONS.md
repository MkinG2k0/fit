# Coding Conventions

**Analysis Date:** 2026-04-14

## Naming Patterns

**Files:**

- UI-компоненты смешивают `PascalCase` и `camel/lowercase`: `src/widgets/loginForm/ui/LoginForm.tsx`, `src/features/timer/ui/timer.tsx`, `src/widgets/allExercises/ui/allExercises.tsx`.
- CSS Modules используют суффикс `.module.css`: `src/widgets/loginForm/ui/LoginForm.module.css`, `src/entities/calendarDay/ui/Day.module.css`.
- Баррели слоев оформлены через `index.ts`: `src/widgets/index.ts`, `src/pages/index.ts`, `src/entities/user/index.ts`.

**Functions:**

- Компоненты в основном объявляются как `const` + стрелочная функция: `src/widgets/header/ui/Header.tsx`, `src/features/fullExerciseList/ui/DeleteDialog.tsx`.
- Обработчики чаще называют по шаблону `*Handler` или `handle*`: `inputHandler` в `src/widgets/loginForm/ui/LoginForm.tsx`, `handleBlur` в `src/features/createExercise/lib/useCategorySelector.ts`.

**Variables:**

- Булевы флаги обычно с префиксом `is*`: `isRunning` в `src/features/timer/lib/useTimer.ts`.
- Состояние форм задается объектом через `useState`: `loginFormState` в `src/widgets/loginForm/ui/LoginForm.tsx`.

**Types:**

- Объектные контракты оформляются через `interface`: `IUserResponse` в `src/entities/user/api/userApi.ts`, `Exercise` в `src/entities/exercise/model/types.ts`.
- Часто используется `type`-import для типов из библиотек: `src/entities/exercise/model/types.ts`, `src/shared/ui/button/CustomButton.tsx`.

## Code Style

**Formatting:**

- Инструмент форматирования: `Prettier` (зависимость в `package.json`).
- Выявленная настройка: `"quoteProps": "preserve"` в `.prettierrc`.
- Отдельного скрипта `format`/`prettier --check` в `package.json` нет.

**Linting:**

- Инструмент: `ESLint` c flat config в `eslint.config.js`.
- База правил: `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `eslint-plugin-react-x`, `eslint-plugin-react-dom`.
- В конфиге нет кастомных локальных правил (`rules: {}`), опора на preset-ы.

## Import Organization

**Order:**

1. Framework/third-party (`react`, `lucide-react`, `react-router-dom`): `src/widgets/header/ui/Header.tsx`.
2. Внутренние алиасы `@/`: `src/widgets/header/ui/Header.tsx`, `src/entities/user/api/userApi.ts`.
3. Относительные импорты (`./`, `../`): `src/features/timer/ui/timer.tsx`, `src/shared/ui/button/CustomButton.tsx`.

**Path Aliases:**

- Основной алиас `@/*` задан в `tsconfig.json`, `tsconfig.app.json`, `vite.config.ts`.
- Дополнительный алиас `"@/ui"` задан в `vite.config.ts`.

## Error Handling

**Patterns:**

- В API interceptor используется `try/catch` и повтор запроса при `401`: `src/shared/api/interceptors.ts`.
- В UI встречается `Promise.then().catch()` с парсингом backend-ответа: `src/widgets/loginForm/ui/LoginForm.tsx`.
- Явная централизованная типизация ошибок не выявлена.

## Logging

**Framework:** `console`.

**Patterns:**

- Информационные логи: `console.log` в `src/app/providers/pwa/register.ts`.
- Ошибки в async-операциях: `console.error` в `src/features/timer/lib/notifications.ts`.
- В проекте нет отдельного логгер-адаптера.

## Comments

**When to Comment:**

- Комментарии редкие, в основном технические подсказки или отключения TS: `// @ts-ignore` в `src/app/providers/pwa/register.ts`.
- В конфиге встречаются закомментированные планы по расширению линтинга: `eslint.config.js`.

**JSDoc/TSDoc:**

- Системного использования JSDoc/TSDoc не обнаружено в `src/**/*.ts(x)`.

## Function Design

**Size:**

- В проекте есть компактные хуки/компоненты (например `src/features/createExercise/lib/useCategorySelector.ts`) и более объемные UI-модули с инлайн-обработчиками (`src/widgets/loginForm/ui/LoginForm.tsx`).

**Parameters:**

- Явная типизация параметров применяется в публичных функциях API/хуках: `src/entities/user/api/userApi.ts`, `src/features/timer/lib/useTimer.ts`.
- В UI часто передаются callback-и как пропсы: `src/features/fullExerciseList/ui/DeleteDialog.tsx`.

**Return Values:**

- Хуки возвращают объект состояния и действий: `src/features/timer/lib/useTimer.ts`, `src/features/createExercise/lib/useCategorySelector.ts`.
- API-функции возвращают `Promise<AxiosResponse<...>>`: `src/entities/user/api/userApi.ts`.

## Module Design

**Exports:**

- Преобладают named exports (`export const` / `export { ... }`) в `src`.
- `default export` в `src/**/*.ts(x)` не обнаружен.

**Barrel Files:**

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

---

Convention analysis: 2026-04-14
