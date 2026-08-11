# Codebase Structure

**Analysis Date:** 2026-08-12

## Directory Layout

```text
fit/
├── android/                         # Capacitor Android native project
├── ios/                             # Capacitor iOS native project
├── dist/                            # Vite build output (Capacitor webDir)
├── docs/                            # Project docs (non-runtime)
├── public/                          # Static assets served by Vite
├── src/                             # Application source (FSD layers)
│   ├── app/                         # Bootstrap, layout, router, providers, styles
│   ├── pages/                       # Route screens
│   ├── widgets/                     # Large UI compositions
│   ├── features/                    # User scenarios
│   ├── entities/                    # Domain models, stores, APIs
│   └── shared/                      # UI primitives, libs, config, HTTP
├── .planning/                       # GSD planning / codebase maps
├── capacitor.config.ts              # Capacitor app id + webDir
├── vite.config.ts                   # Vite, aliases, PWA, React Compiler
├── pwa.config.ts                    # PWA manifest/caching config
├── vercel.json                      # SPA rewrite for hosting
├── eslint.config.js                 # ESLint flat config
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── components.json                  # shadcn/ui config
├── package.json                     # Scripts + dependencies (pnpm)
└── pnpm-lock.yaml                   # Lockfile (use pnpm only)
```

## Directory Purposes

**`src/app`:**
- Purpose: Application shell and startup orchestration.
- Contains: `main.tsx`, `AppContent.tsx`, `layout/`, `router/`, `providers/` (theme, PWA, onboarding, Android back, workout inits), `styles/`.
- Key files: `src/app/main.tsx`, `src/app/layout/AppLayout.tsx`, `src/app/router/routes.tsx`.

**`src/pages`:**
- Purpose: Thin route containers composing widgets/features.
- Contains: One directory per screen with `ui/*Page.tsx` + `index.ts`.
- Key files: `src/pages/HomePage/ui/HomePage.tsx`, `src/pages/SettingsPage/ui/SettingsPage.tsx`, `src/pages/index.ts`.

**`src/widgets`:**
- Purpose: Multi-feature screen blocks reused across pages.
- Contains: `weekCalendar`, `exerciseList`, `header`, `allExercises`, `analyticsDashboard`, `bodyMetricsDashboard`, `statisticCard`, `loginForm`.
- Key files: `src/widgets/exerciseList/ui/ExerciseList.tsx`, `src/widgets/analyticsDashboard/ui/AnalyticsDashboard.tsx`, `src/widgets/index.ts`.

**`src/features`:**
- Purpose: User-facing scenarios (UI + local hooks/libs; occasional feature store).
- Contains: Scenario folders with typical `ui/`, `lib/`, sometimes `model/` or `slice/`.
- Key files: `src/features/exercise/ui/ExerciseCard.tsx`, `src/features/addExercise/ui/AddExercise.tsx`, `src/features/timer/slice/restTimerStore.ts`.

**`src/entities`:**
- Purpose: Domain types, Zustand slices, entity APIs, domain libs.
- Contains: `calendarDay`, `exercise`, `user`, `bodyMetrics`, `loadTable`, `theme`, `analytics`, `health`.
- Key files: `src/entities/calendarDay/slice/calendarStore.ts`, `src/entities/exercise/slice/exerciseStore.ts`, `src/entities/user/slice/userStore.ts`.

**`src/shared`:**
- Purpose: Cross-cutting building blocks.
- Contains: `ui/` (shadcn + app primitives), `lib/` (storage, navigation, helpers), `config/`, `api/`, `types/`.
- Key files: `src/shared/lib/storageAdapter/`, `src/shared/lib/storage.ts`, `src/shared/api/interceptors.ts`, `src/shared/ui/index.ts`.

**`android/` / `ios/`:**
- Purpose: Native Capacitor shells packaging `dist/`.
- Contains: Platform IDE projects; do not put product UI logic here.
- Key files: Generated/maintained via Capacitor CLI; config at `capacitor.config.ts`.

**`public/`:**
- Purpose: Static icons, logos, PWA assets referenced by Vite/PWA config.
- Contains: Images/SVGs copied as-is.

**`.planning/`:**
- Purpose: GSD plans, research, and codebase analysis docs.
- Contains: `codebase/*.md`, quick/phase plans; not imported by runtime.

## Key File Locations

**Entry Points:**
- `index.html`: HTML shell
- `src/app/main.tsx`: React bootstrap
- `src/app/router/routes.tsx`: Route map
- `src/app/providers/pwa/sw.js`: Service worker source

**Configuration:**
- `vite.config.ts`: Build, aliases (`@`, `@app`, `@pages`, `@widgets`, `@features`, `@entities`, `@shared`, `@ui`), PWA, React Compiler
- `tsconfig.app.json`: TS paths (`@/*` → `./src/*`)
- `pwa.config.ts`: Manifest
- `capacitor.config.ts`: Native wrapper
- `vercel.json`: SPA fallback
- `.env` / `.env.example`: Env vars (do not commit secrets; note existence only)
- `eslint.config.js`, `.prettierrc`: Lint/format

**Core Logic:**
- Workout journal: `src/entities/calendarDay/`
- Catalog/presets: `src/entities/exercise/`
- User/settings: `src/entities/user/`
- Persistence: `src/shared/lib/storage.ts`, `src/shared/lib/storageAdapter/`
- Analytics builders: `src/entities/analytics/lib/`
- Health reads: `src/entities/health/api/`
- Back navigation: `src/shared/lib/navigation/`

**Testing:**
- Not detected: no co-located `*.test.*` / `*.spec.*` suite or test runner scripts as a primary layout convention. Prefer adding tests beside the module under test or under a future `src/**/__tests__` only if introduced project-wide.

## Naming Conventions

**Files:**
- Page/feature UI components: `PascalCase.tsx` preferred for screens (`HomePage.tsx`); some legacy lowercase (`allExercises.tsx`, `statisticCard.tsx`, `timer.tsx`) — do not introduce new lowercase component filenames.
- Stores: `*Store.ts` under `slice/` (e.g. `calendarStore.ts`, `exerciseStore.ts`).
- Types: `types.ts` / domain-specific model files under `model/`.
- Slice public API: `index.ts` barrel per slice.

**Directories:**
- FSD slice folders: `camelCase` feature/entity names (`addExercise`, `calendarDay`, `bodyMetrics`).
- Inside slice: `ui/`, `lib/`, `model/`, `slice/`, `api/` as needed.
- Pages: `PascalCase` folder matching export (`HomePage/`).

**Symbols:**
- Components/hooks: `PascalCase` components, `use*` hooks, `*Handler` / `handle*` event handlers.
- Booleans: `is*` / feature flags as store fields.
- Types: `interface` for object contracts; `type` imports from libraries.

## Where to Add New Code

**New Feature (user scenario):**
- Primary code: `src/features/<featureName>/{ui,lib,model}/`
- Public API: `src/features/<featureName>/index.ts`
- Wire into a widget or page; do not import from `pages` inside the feature.
- Tests: co-locate when a test harness is introduced (`src/features/<featureName>/**/*.test.ts`)

**New Page (route):**
- Implementation: `src/pages/<Name>Page/ui/<Name>Page.tsx` + `index.ts`
- Register lazy route in `src/app/router/routes.tsx`
- Add title in `src/app/layout/AppLayout.tsx` `PAGE_TITLES`
- Add parent path in `src/shared/lib/navigation/resolveBackPath.ts` if back navigation applies
- Export from `src/pages/index.ts` when used as a public page module

**New Widget (screen block):**
- Implementation: `src/widgets/<widgetName>/ui/...`
- Export from widget `index.ts` and prefer adding to `src/widgets/index.ts`

**New Entity / domain state:**
- Implementation: `src/entities/<entity>/{model,slice,lib,api,ui}/`
- Persist via `zustandAppStorage` unless month-bucket journal pattern is required
- Export through `src/entities/<entity>/index.ts`

**Shared UI primitive:**
- App-specific: `src/shared/ui/<name>/`
- shadcn primitives: `src/shared/ui/shadCNComponents/ui/` (follow existing shadcn pattern + `cva` when variants needed)
- Re-export from `src/shared/ui/index.ts` when part of public shared UI

**Utilities:**
- Generic helpers: `src/shared/lib/`
- Domain-aware helpers: `src/entities/<entity>/lib/` (preferred over putting entity imports into `shared`)
- Navigation helpers: `src/shared/lib/navigation/`

**Native-only glue:**
- Keep JS bridges in `src/shared/lib` or `src/entities/*/api`; use Capacitor plugins from there
- Avoid business logic inside `android/` / `ios/`

**App-level providers / init:**
- Place in `src/app/providers/` and mount from `src/app/main.tsx` only when truly global

## Special Directories

**`dist/`:**
- Purpose: Production web build consumed by Capacitor and static hosts
- Generated: Yes
- Committed: No (build artifact)

**`node_modules/`:**
- Purpose: Dependencies via pnpm
- Generated: Yes
- Committed: No

**`.planning/`:**
- Purpose: Plans and codebase maps for GSD workflow
- Generated: No (authored)
- Committed: Yes (project process artifacts)

**`android/` / `ios/`:**
- Purpose: Native project trees
- Generated: Partially (Capacitor sync)
- Committed: Yes

**`src/pages/LogInPage`, `AiRecommendationsPage`, `HealthPage`:**
- Purpose: Legacy/disabled or redirected screens
- Generated: No
- Committed: Yes — do not wire AI routes unless product re-enables; `/health` redirects to `/activity`

---

*Structure analysis: 2026-08-12*
