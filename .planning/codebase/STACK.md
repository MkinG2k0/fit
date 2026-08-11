# Technology Stack

**Analysis Date:** 2026-08-12

## Languages

**Primary:**
- TypeScript `~5.8.3` (strict mode) — application code in `src/**/*.ts` and `src/**/*.tsx` (`tsconfig.json`, `tsconfig.app.json`, entry `src/app/main.tsx`)

**Secondary:**
- JavaScript (ES modules) — tooling/config and custom service worker (`eslint.config.js`, `src/app/providers/pwa/sw.js`)
- CSS — global styles and Tailwind v4 theme tokens (`src/app/styles/index.css`)

## Runtime

**Environment:**
- Node.js for local build/dev (no `.nvmrc` / `.node-version` / `package.json` `engines`; environment observed: Node `v22.15.0`)
- Browser runtime for the delivered SPA (`index.html` → `src/app/main.tsx`)
- Native shells via Capacitor: Android (`android/`) and iOS (`ios/`) wrap the Vite `dist` output (`capacitor.config.ts` `webDir: "dist"`)

**Package Manager:**
- pnpm (workspace rule and scripts: `pnpm build`, `pnpm build:cap`; CLI observed: `9.6.0`)
- Lockfile: `pnpm-lock.yaml` present
- No `yarn.lock` or `package-lock.json`

## Frameworks

**Core:**
- React `^19.1.1` + React DOM `^19.1.1` — UI (`src/app/main.tsx`)
- React Router DOM `^7.9.3` — client routing (`BrowserRouter` in `src/app/main.tsx`, routes under `src/app/router/`)
- Zustand `^5.0.8` — client state with `persist` middleware (e.g. `src/entities/user/slice/userStore.ts`, `src/entities/calendarDay/slice/calendarStore.ts`)
- Tailwind CSS `^4.1.16` + `@tailwindcss/vite` `^4.1.16` — styling pipeline (`vite.config.ts`, `@import "tailwindcss"` in `src/app/styles/index.css`)
- Capacitor `^8.3.1` — native Android/iOS packaging and device APIs (`capacitor.config.ts`, scripts `cap:*` / `build:cap` in `package.json`)

**UI / component system:**
- shadcn/ui (New York style, CSS variables, Lucide icons) — `components.json`; primitives under `src/shared/ui/shadCNComponents/`
- Radix UI primitives (`@radix-ui/react-*`) — dialog, checkbox, popover, scroll-area, etc.
- `class-variance-authority`, `clsx`, `tailwind-merge` — variant and class composition (`src/shared/ui/lib/utils.ts`)
- Lucide React `^0.553.0` — icons
- Vaul `^1.1.2` — drawer (`src/shared/ui/shadCNComponents/ui/drawer.tsx`)
- cmdk `^1.1.1` — command palette (`src/shared/ui/shadCNComponents/ui/command.tsx`)
- Motion `^12.23.22` (`motion/react`) — animations/reorder (`src/widgets/exerciseList/ui/ExerciseList.tsx`, `src/features/exercise/ui/ExerciseCard.tsx`)
- Swiper `12.1.2` — calendar week/month swipers (`src/features/weekSwiper/`, `src/features/monthSwiper/`)
- Recharts `2.15.4` — analytics/body-metrics charts (`src/widgets/analyticsDashboard/`, `src/widgets/statisticCard/`)

**Testing:**
- Not detected — no test runner dependency, no `*.test.*` / `*.spec.*` files, no test script in `package.json`

**Build/Dev:**
- Vite via `rolldown-vite@7.1.12` alias (`"vite": "npm:rolldown-vite@7.1.12"` + `overrides` in `package.json`) — `vite.config.ts`
- `@vitejs/plugin-react` `^5.0.3` with `babel-plugin-react-compiler` `^1.0.0` (target React 19) — `vite.config.ts`
- TypeScript project references — `tsc` / `tsc -b` via `build` / `build:strict` scripts
- ESLint `^9.36.0` + `typescript-eslint` `^8.44.0` + React hooks/refresh/X/DOM plugins — `eslint.config.js`
- Prettier `^3.6.2` — `.prettierrc` (`quoteProps: "preserve"`)
- `vite-plugin-pwa` `^1.1.0` + Workbox packages — injectManifest SW (`pwa.config.ts`, `src/app/providers/pwa/sw.js`)
- `tw-animate-css` `^1.4.0` — animation utilities imported in `src/app/styles/index.css`
- Bundle analysis tooling present: `rollup-plugin-visualizer`, `vite-bundle-visualizer` (dependencies; not wired as default scripts)

## Key Dependencies

**Critical:**
- `axios` `1.15.0` — HTTP client with interceptors and 401 token refresh (`src/shared/api/interceptors.ts`, `src/shared/api/aiGateway.ts`)
- `zustand` `^5.0.8` — domain/UI persisted state across entities and features
- `react-router-dom` `^7.9.3` — SPA navigation
- `dayjs` `^1.11.18` — dates/calendar keys (`src/shared/lib/storage.ts`, calendar/analytics features)
- `@capacitor/preferences` — native-backed key/value storage driver (`src/shared/lib/storageAdapter/preferencesDriver.ts`)
- `@capacitor/app`, `@capacitor/status-bar`, `@capacitor/camera`, `@capacitor/filesystem`, `@capacitor/share` — native UX and media
- `@capgo/capacitor-health` `^8.4.6` — HealthKit/Health Connect reads (`src/entities/health/api/healthApi.ts`, `heartRateRead.ts`)
- `html-to-image` — share-card PNG export (`src/features/shareStats/lib/renderShareCardToPng.ts`)
- `react-timer-hook` — rest/workout timers (`src/features/timer/`)
- `react-swipeable` — gesture handling where used in UI
- `slugify` — ID/slug helpers (`src/entities/exercise/lib/exerciseIds.ts`)

**Declared but unused in `src/` (no imports found):**
- `@emotion/react`, `@emotion/styled`, `@fontsource/roboto` — present in `package.json`; fonts load via Google Fonts in `index.html` instead

**Infrastructure:**
- Capacitor Android/iOS platforms — `android/`, `ios/`, `capacitor.config.ts` (`appId: com.aifit.fit`)
- Workbox (`workbox-core`, `workbox-routing`, `workbox-strategies`, `workbox-precaching`, `workbox-expiration`, `workbox-window`) — custom SW caching strategies in `src/app/providers/pwa/sw.js`
- Vercel SPA rewrites — `vercel.json` routes all paths to `/`

## Configuration

**Environment:**
- Vite `import.meta.env` — typed in `src/vite-env.d.ts`
- Required/used vars (see `.env.example`; do not commit secrets):
  - `VITE_API_URL` — backend base URL (`src/shared/api/interceptors.ts`)
  - `VITE_AI_GATEWAY_URL` — AI gateway base URL (`src/shared/api/aiGateway.ts`)
  - `VITE_AI_GATEWAY_API_KEY` — AI gateway API key header (`src/shared/api/aiGateway.ts`)
- `.env` and `.env.example` exist at repo root (`.env` is secret-bearing — do not read/commit values)
- Built-in Vite `BASE_URL` used for public assets (`src/shared/lib/publicAssetUrl.ts`)

**Build:**
- `vite.config.ts` — React Compiler, Tailwind plugin, PWA injectManifest, path aliases (`@`, `@app`, `@pages`, `@widgets`, `@features`, `@entities`, `@shared`, `@/ui`), Rolldown advanced chunk groups
- `pwa.config.ts` — web app manifest (name Fit, standalone, Russian description, icons/screenshots)
- `tsconfig.json` + `tsconfig.app.json` + `tsconfig.node.json` — strict TS, path aliases aligned with Vite
- `eslint.config.js` — flat config; ignores `dist` and `android`
- `components.json` — shadcn aliases into `src/shared/ui/*`
- `capacitor.config.ts` — native app id/name and `webDir`
- `vercel.json` — SPA fallback rewrite

**Scripts (from `package.json`):**
- `pnpm dev` — Vite with `--host` (LAN for Capacitor live reload)
- `pnpm build` — `tsc && vite build`
- `pnpm build:strict` — `tsc -b && vite build`
- `pnpm lint` — `eslint .`
- `pnpm preview` — `vite preview`
- `pnpm build:cap` / `cap:*` — Capacitor sync/open/run

## Platform Requirements

**Development:**
- Node.js (compatible with Vite/rolldown-vite and Capacitor 8; version not pinned in repo)
- pnpm for install and scripts
- For native: Android Studio / Xcode when using `cap:open:*` / `cap:run:*`
- Reachable backend at `VITE_API_URL` and optional AI gateway at `VITE_AI_GATEWAY_*` for auth/AI features

**Production:**
- Static SPA hosting with history fallback (Vercel-style via `vercel.json`)
- PWA installable standalone (manifest + service worker)
- Capacitor native builds consume `dist/` after `pnpm build` + `cap sync`
- Backend API and optional AI gateway must be reachable from the client (CORS/credentials: axios `withCredentials: true` on `$api`)

---

*Stack analysis: 2026-08-12*
