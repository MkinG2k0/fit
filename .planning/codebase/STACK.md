# Technology Stack

**Analysis Date:** 2026-04-14

## Languages

**Primary:**

- TypeScript (strict mode) - application code in `src/**/*.ts` and `src/**/*.tsx` (`tsconfig.json`, `src/app/main.tsx`).

**Secondary:**

- JavaScript (ES modules) - tooling/config and service worker in `eslint.config.js` and `src/app/providers/pwa/sw.js`.
- CSS - global styles in `src/app/styles/index.css`.

## Runtime

**Environment:**

- Node.js runtime for local build/dev scripts (`package.json` scripts).
- Browser runtime for delivered app (`src/app/main.tsx`).

**Package Manager:**

- Manager: Unknown (multiple lockfiles are present: `pnpm-lock.yaml`, `yarn.lock`, `package-lock.json`).
- Lockfile: present (multiple).

## Frameworks

**Core:**

- React `^19.1.1` - UI framework (`package.json`).
- React DOM `^19.1.1` - browser rendering (`package.json`, `src/app/main.tsx`).
- React Router DOM `^7.9.3` - routing (`src/app/main.tsx`, `src/app/router/routes.tsx`).
- Zustand `^5.0.8` - client state store (`package.json`, `src/entities/user/slice/userStore.ts`).
- Tailwind CSS `^4.1.16` with `@tailwindcss/vite` `^4.1.16` - styling pipeline (`package.json`, `vite.config.ts`).

**Testing:**

- Not detected (no test runner config files and no test scripts in `package.json`).

**Build/Dev:**

- Vite via `rolldown-vite@7.1.12` alias - dev server and bundling (`package.json`, `vite.config.ts`).
- TypeScript `~5.8.3` - type-check/build step (`package.json`, `package.json` script `build`).
- ESLint `^9.36.0` + `typescript-eslint` `^8.44.0` - linting (`eslint.config.js`).
- Vite PWA plugin `^1.1.0` + Workbox - PWA/service worker generation (`vite.config.ts`, `pwa.config.ts`).
- Rollup visualizer plugin - bundle analysis (`vite.config.ts`).

## Key Dependencies

**Critical:**

- `axios` `^1.12.2` - HTTP client with interceptors and auth token refresh (`src/shared/api/interceptors.ts`).
- `react-router-dom` `^7.9.3` - route composition and navigation (`src/app/main.tsx`, `src/widgets/loginForm/ui/LoginForm.tsx`).
- `zustand` `^5.0.8` - auth/user domain state (`src/entities/user/slice/userStore.ts`).
- `tailwindcss` `^4.1.16` - primary styling system (`package.json`, `vite.config.ts`).

**Infrastructure:**

- `vite-plugin-pwa` `^1.1.0` - offline and service worker integration (`vite.config.ts`, `pwa.config.ts`).
- `@vitejs/plugin-react` `^5.0.3` - React transform/Fast Refresh (`vite.config.ts`).
- `eslint` `^9.36.0` - static analysis (`eslint.config.js`).

## Configuration

**Environment:**

- API base URL is configured via `import.meta.env.VITE_API_URL` in `src/shared/api/interceptors.ts`.
- `.env` file exists in repository root; contents not inspected (secret-bearing file).
- Additional required environment variables: unknown from available code evidence.

**Build:**

- `vite.config.ts` configures plugins, aliases, and chunk strategy.
- `tsconfig.json` configures strict TypeScript and path aliases (`@/*`).
- `vercel.json` rewrites all routes to `/` for SPA routing.
- `pwa.config.ts` configures web app manifest and runtime caching behavior.

## Platform Requirements

**Development:**

- Node.js (version not declared in `.nvmrc`, `.node-version`, or `package.json` engines).
- npm/pnpm/yarn CLI (exact required manager unknown due multiple lockfiles).

**Production:**

- Static frontend hosting compatible with SPA rewrites (`vercel.json` indicates Vercel-style deployment).
- Separate backend API endpoint must be reachable through `VITE_API_URL` (`src/shared/api/interceptors.ts`).

---

Stack analysis: 2026-04-14
