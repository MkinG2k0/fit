<!-- refreshed: 2026-08-12 -->
# Architecture

**Analysis Date:** 2026-08-12

## System Overview

```text
┌─────────────────────────────────────────────────────────────┐
│  app (bootstrap + shell)                                    │
│  `src/app/main.tsx` → ThemeProvider → BrowserRouter         │
│  providers + AppLayout + AppRoutes                          │
├──────────────────┬──────────────────┬───────────────────────┤
│  pages           │  widgets         │  features             │
│  `src/pages/*`   │  `src/widgets/*` │  `src/features/*`     │
│  route screens   │  screen blocks   │  user scenarios       │
└────────┬─────────┴────────┬─────────┴──────────┬────────────┘
         │                  │                     │
         ▼                  ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│  entities (domain state + types + entity APIs)              │
│  `src/entities/*/slice|model|api|lib|ui`                    │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  shared (UI primitives, storage, config, HTTP, navigation)  │
│  `src/shared/{ui,lib,config,api,types}`                     │
│  Capacitor Preferences / optional backend via `$api`        │
└─────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Bootstrap | Storage migration, Capacitor chrome, SW, root render | `src/app/main.tsx` |
| App shell | Header + safe-area layout + rest-timer watcher | `src/app/layout/AppLayout.tsx` |
| Router | Lazy page routes + catch-all redirect | `src/app/router/routes.tsx` |
| Calendar journal | Selected day, workout exercises/sets, month persistence | `src/entities/calendarDay/slice/calendarStore.ts` |
| Exercise catalog | Categories, catalog exercises, presets (persisted) | `src/entities/exercise/slice/exerciseStore.ts` |
| User/settings | Tokens, ring goals, calorie/onboarding flags (persisted) | `src/entities/user/slice/userStore.ts` |
| Body metrics | Measurement entries + custom definitions (persisted) | `src/entities/bodyMetrics/slice/bodyMetricsStore.ts` |
| Load table | Load-table domain state (persisted) | `src/entities/loadTable/slice/loadTableStore.ts` |
| Theme | Theme mode persistence | `src/entities/theme/slice/themeStore.ts` |
| Analytics domain | Pure builders/selectors over journal data (no Zustand slice) | `src/entities/analytics/` |
| Health domain | Native health/HR read APIs | `src/entities/health/` |
| App storage | Capacitor Preferences facade + Zustand adapter | `src/shared/lib/storageAdapter/` |
| Workout months | Month-bucket read/write (`MM-YYYY`) | `src/shared/lib/storage.ts` |
| HTTP client | Axios instance + bearer/refresh | `src/shared/api/interceptors.ts` |
| Back navigation | Parent-route map (Header + Android back) | `src/shared/lib/navigation/` |

## Pattern Overview

**Overall:** Feature-Sliced Design (FSD)-style React SPA with local-first Zustand domain stores and Capacitor-backed persistence; optional remote API for auth/user.

**Key Characteristics:**
- Layered imports: `app → pages → widgets → features → entities → shared` (with known upward leaks documented below).
- Route pages stay thin compositions; business UI lives in widgets/features.
- Domain writes go through entity Zustand stores; calendar journal persists by month keys, other domains use `persist` + `zustandAppStorage`.
- Dual delivery: Vite web/PWA (`dist`) wrapped by Capacitor (`android/`, `ios/`, `capacitor.config.ts`).

## Layers

**app:**
- Purpose: Application bootstrap, global providers, layout shell, routing.
- Location: `src/app`
- Contains: `main.tsx`, `AppContent.tsx`, `layout/AppLayout.tsx`, `router/routes.tsx`, `providers/*`, `styles/index.css`
- Depends on: `pages`, `widgets`, `features`, `entities`, `shared`, React Router, Capacitor, PWA register
- Used by: Vite entry (`index.html` → `src/app/main.tsx`)

**pages:**
- Purpose: Route-level screen composition only.
- Location: `src/pages`
- Contains: One folder per screen (`HomePage`, `ExercisePage`, `AnalyticsPage`, `SettingsPage`, `ActivityPage`, `BodyMetricsPage`, `LoadTablePage`, `LoadTableDetailPage`, `TimerPage`, `OnboardingPage`, create/edit flows, `NewsPage`, plus unused/legacy `LogInPage`, `AiRecommendationsPage`, `HealthPage`)
- Depends on: `widgets`, `features`, occasionally `entities`/`shared`
- Used by: `src/app/router/routes.tsx` via `lazy(() => import("@/pages/..."))`

**widgets:**
- Purpose: Large reusable screen blocks assembled from features/entities.
- Location: `src/widgets`
- Contains: `weekCalendar`, `exerciseList`, `header`, `allExercises`, `analyticsDashboard`, `bodyMetricsDashboard`, `statisticCard`, `loginForm`
- Depends on: `features`, `entities`, `shared`
- Used by: `pages`, `app/layout`; also imported upward from some `features` (anti-pattern)

**features:**
- Purpose: User scenarios and interactive flows.
- Location: `src/features`
- Contains: `addExercise`, `exercise`, `createExercise`, `createCategory`, `createPreset`, `fullExerciseList`, `timer`, `weekSwiper`, `monthSwiper`, `profileDropDownMenu`, `profileRingGoalsSettings`, `themeSwitcher`, `bodyMetricsEntry`, `bodyMetricsHistory`, `healthMetrics`, `loadTable`, `analyticsFilters`, `analyticsPeriodCompare`, `shareStats`, `appSettingsTransfer`, `onboarding`, `news`, `setCalories`, `aiRecommendations` (disabled in routes)
- Depends on: `entities`, `shared`; some files import `widgets`
- Used by: `widgets`, `pages`, `app` providers/layout

**entities:**
- Purpose: Domain models, Zustand slices, entity APIs, domain libs/UI atoms.
- Location: `src/entities`
- Contains: `calendarDay`, `exercise`, `user`, `bodyMetrics`, `loadTable`, `theme`, `analytics`, `health`
- Depends on: `shared`; one type import from `features/exercise` in calendar store
- Used by: `features`, `widgets`, `pages`, `app`, and (leak) parts of `shared`

**shared:**
- Purpose: Cross-cutting primitives without feature semantics.
- Location: `src/shared`
- Contains: `ui/` (shadcn + app primitives), `lib/` (storage, navigation, helpers), `config/`, `api/`, `types/`
- Depends on: external libs; several modules currently import entity types/stores
- Used by: all upper layers

## Data Flow

### Primary Request Path (workout logging)

1. User opens `/` → `HomePage` composes `WeekSlider` + `ExerciseList` (`src/pages/HomePage/ui/HomePage.tsx`).
2. `ExerciseList` reads `useCalendarStore` selected day exercises and renders `ExerciseCard` / `AddExercise` (`src/widgets/exerciseList/ui/ExerciseList.tsx`).
3. Mutations (`addExercise`, `setExerciseValues`, `addSetToExercise`, …) update in-memory `days` in `useCalendarStore` (`src/entities/calendarDay/slice/calendarStore.ts`).
4. Persistence writes month buckets via `saveDaysToLocalStorage` → `appStorage.setJson("MM-YYYY", …)` (`src/shared/lib/storage.ts`, `src/shared/lib/storageAdapter/appStorage.ts`).
5. Loads call `loadDaysFromLocalStorage` → `getDaysFromLocalStorage` merging prev/current/next months into store state.

### Catalog / presets path

1. UI in create/edit pages and `allExercises` calls `useExerciseStore` actions (`src/entities/exercise/slice/exerciseStore.ts`).
2. Zustand `persist` hydrates/writes through `zustandAppStorage` → Capacitor Preferences.
3. Journal entries reference catalog via `catalogExerciseId`; merge/remap helpers live in `src/entities/exercise/lib/mergeCatalogExercise.ts`.

### Analytics path

1. Dashboard widgets load journal data (storage/helpers) and call pure builders in `src/entities/analytics/lib/*`.
2. Filter/compare UI state lives in features (`analyticsFilters`, `analyticsPeriodCompare`); charts compose in `src/widgets/analyticsDashboard/`.

### Auth / remote API path (secondary)

1. `$api` attaches `accessToken` from `useUserStore` (`src/shared/api/interceptors.ts`).
2. On `401`, interceptor calls `refreshTokensRequest` from `src/entities/user/api/userApi.ts` and retries.
3. Login UI exists (`src/widgets/loginForm/`, `src/pages/LogInPage/`) but is not mounted in current `AppRoutes`.

### Native / shell side flows

1. Startup: `runStorageMigration()` before first paint (`src/app/main.tsx`).
2. Onboarding gate: `OnboardingNavigation` redirects based on `workoutCalorieProfileOnboarding` (`src/app/providers/OnboardingNavigation.tsx`).
3. Android hardware back: `AndroidBackNavigation` uses `resolveBackPath` (`src/app/providers/AndroidBackNavigation.tsx`, `src/shared/lib/navigation/resolveBackPath.ts`).
4. Health metrics: entity API wrappers under `src/entities/health/api/` used by activity/health features.

**State Management:**
- Prefer entity Zustand stores for domain writes.
- Use `persist` + `zustandAppStorage` for catalog/user/theme/bodyMetrics/loadTable/rest timer.
- Calendar journal is **not** Zustand-persist; it uses explicit month-key I/O in `storage.ts`.
- Keep analytics as pure functions over data, not a global mutable analytics store.

## Key Abstractions

**FSD public API barrels:**
- Purpose: Stable import surface per slice/layer.
- Examples: `src/pages/index.ts`, `src/widgets/index.ts`, `src/entities/exercise/index.ts`, `src/features/timer/index.ts`, `src/shared/lib/index.ts`
- Pattern: Named re-exports from `index.ts`; consume via `@/entities/...` or layer barrel when available.

**Entity Zustand store:**
- Purpose: Encapsulate domain state + actions.
- Examples: `src/entities/calendarDay/slice/calendarStore.ts`, `src/entities/exercise/slice/exerciseStore.ts`, `src/entities/user/slice/userStore.ts`
- Pattern: `create(...)` or `create(...)(persist(...))`; export `useXStore`; select with `useXStore((s) => s.field)`.

**App storage adapter:**
- Purpose: Single persistence backend for web + native.
- Examples: `src/shared/lib/storageAdapter/appStorage.ts`, `preferencesDriver.ts`, `zustandAppStorage.ts`
- Pattern: Async key/value JSON helpers over `@capacitor/preferences`.

**Lazy route modules:**
- Purpose: Code-split screens.
- Examples: `src/app/router/routes.tsx`
- Pattern: `lazy(() => import("@/pages/X").then((m) => ({ default: m.X })))` wrapped in `ProtectedRoute` (currently pass-through).

**Parent-route back navigation:**
- Purpose: Deterministic back targets without relying on history stack.
- Examples: `src/shared/lib/navigation/resolveBackPath.ts`, `useNavigateBack.ts`
- Pattern: Pathname → parent path map; Header and Android back share the same resolver.

## Entry Points

**Web/PWA SPA:**
- Location: `src/app/main.tsx` (via `index.html`)
- Triggers: Browser/Capacitor WebView load
- Responsibilities: Cap system bars, SW register, storage migration, ThemeProvider, BrowserRouter, app-level inits, `AppContent`

**Route table:**
- Location: `src/app/router/routes.tsx`
- Triggers: URL changes inside `BrowserRouter`
- Responsibilities: Map paths to lazy pages; redirect unknown → `/`; `/health` → `/activity`

**Native shells:**
- Location: `android/`, `ios/`, configured by `capacitor.config.ts` (`webDir: "dist"`)
- Triggers: Native app launch loading packaged web assets
- Responsibilities: Platform container; JS still owns UI/state

**Service worker:**
- Location: `src/app/providers/pwa/sw.js` (VitePWA injectManifest)
- Triggers: PWA registration from `src/app/providers/pwa/register.ts`
- Responsibilities: Offline/caching per `pwa.config.ts`

## Architectural Constraints

- **Threading:** Single-threaded browser/WebView event loop; async I/O via Promises for Preferences and HTTP.
- **Global state:** Module-level Zustand store singletons under `src/entities/*/slice/` and `src/features/timer/slice/restTimerStore.ts`.
- **Circular imports:** Risk where `shared` imports `entities` and entities import `shared`; avoid adding more cross-layer cycles (especially entity ↔ feature).
- **Local-first:** Core workout UX must work without backend; do not require API for journal/catalog flows.
- **FSD direction:** Do not import upper layers from lower ones. Allowed: downward only.
- **ProtectedRoute:** Present but currently identity wrapper — do not assume auth gating exists until implemented.

## Anti-Patterns

### Feature imports widget

**What happens:** `src/features/exercise/ui/ExerciseCard.tsx` and `ExerciseBody.tsx` import `StatisticCard` from `@/widgets/statisticCard`.
**Why it's wrong:** Breaks FSD dependency direction (feature → widget); couples scenario layer to composition layer and risks cycles.
**Do this instead:** Move shared chart/summary UI down to `features`/`entities`/`shared`, or compose `StatisticCard` in the widget/page that owns the card.

### Entity depends on feature type

**What happens:** `calendarStore` imports `ExerciseOption` from `@/features/exercise` (`src/entities/calendarDay/slice/calendarStore.ts`).
**Why it's wrong:** Entities become coupled to UI feature contracts.
**Do this instead:** Define `ExerciseOption` (or equivalent) in `entities/exercise/model` and re-export; features import the entity type.

### Shared depends on entities

**What happens:** Modules like `src/shared/lib/storage.ts`, `days.tsx`, `analyticsStorage.ts`, `src/shared/api/interceptors.ts`, `src/shared/config/constants.ts` import entity types/stores/UI.
**Why it's wrong:** Shared is no longer a leaf; layer boundaries blur and testing/reuse suffer.
**Do this instead:** Keep pure utilities in `shared`; put entity-aware helpers under `entities/*/lib` or a dedicated app-level module. HTTP refresh coupling belongs nearer to `entities/user` or `app`.

### Incomplete widget barrel

**What happens:** `src/widgets/index.ts` exports only a subset (`WeekSlider`, `Header`, `ExerciseList`, `LoginForm`, `BodyMetricsDashboard`); analytics/allExercises/statisticCard are deep-imported.
**Why it's wrong:** Inconsistent public API encourages deep imports and hides available widgets.
**Do this instead:** Export all public widgets from `src/widgets/index.ts`, or document intentional deep-import exceptions.

## Error Handling

**Strategy:** Local try/catch at persistence and HTTP boundaries; UI-level `.catch` for forms; no global React error boundary on routes.

**Patterns:**
- Storage adapter swallows driver failures and returns null/empty (`src/shared/lib/storageAdapter/appStorage.ts`).
- Axios interceptor retries once after token refresh on `401` (`src/shared/api/interceptors.ts`).
- Health APIs expose typed `HealthAccessError` (`src/entities/health/`).
- Body metrics store tracks `status` / `errorMessage` for load failures.

## Cross-Cutting Concerns

**Logging:** Ad-hoc `console.*` in PWA/register and some feature libs; no central logger.
**Validation:** Domain clamps/normalizers inside stores and model helpers (e.g. measurement types, ring goals, durations in `userStore`).
**Authentication:** Token in `useUserStore`; Axios bearer + refresh; route protection not enforced (`ProtectedRoute` pass-through).
**Theming:** `ThemeProvider` in app + `entities/theme` store.
**Navigation titles/back:** Centralized in `AppLayout` title map and `resolveBackPath`.
**Styling:** Tailwind token-first in TSX; global base in `src/app/styles/index.css`; no new CSS Modules.

---

*Architecture analysis: 2026-08-12*
