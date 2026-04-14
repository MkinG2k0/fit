# External Integrations

**Analysis Date:** 2026-04-14

## APIs & External Services

**Backend API:**

- Custom HTTP API - authentication and user session flows.
  - SDK/Client: `axios` via `src/shared/api/interceptors.ts`.
  - Auth: `VITE_API_URL` (base URL env var in `src/shared/api/interceptors.ts`).
  - Evidence endpoints: `/login`, `/registration`, `/logout`, `/refresh` in `src/entities/user/api/userApi.ts`.

**Hosted backend domain reference:**

- Render-hosted API origin appears in PWA runtime cache allowlist.
  - SDK/Client: Workbox runtime caching config in `pwa.config.ts`.
  - Auth: unknown in this file.
  - Evidence: regex `https://magfit-diary-backend.onrender.com` in `pwa.config.ts`.

**Push notifications:**

- Browser Push API / Service Worker notifications are implemented.
  - SDK/Client: native Service Worker APIs in `src/app/providers/pwa/sw.js`.
  - Auth: unknown (push subscription provider/server-side sender not in this repo).

## Data Storage

**Databases:**

- Not detected in frontend codebase (no direct DB client/ORM usage in `src`).
  - Connection: unknown (expected to be behind backend API).
  - Client: not applicable in this repository.

**File Storage:**

- Not detected (no storage SDK integrations found in source/config files).

**Caching:**

- Workbox runtime caches configured in `pwa.config.ts`:
  - `api-cache` with `NetworkFirst` for backend API origin.
  - `assets-cache` with `CacheFirst` for static assets.
- Browser local persistence via `localStorage` in `src/shared/lib/storage.ts` and `src/features/exercise/ui/ExerciseCard.tsx`.

## Authentication & Identity

**Auth Provider:**

- Custom backend auth (no third-party identity SDK found).
  - Implementation: Bearer token request interceptor + refresh-on-401 response interceptor in `src/shared/api/interceptors.ts`.
  - Token acquisition endpoints in `src/entities/user/api/userApi.ts`.

## Monitoring & Observability

**Error Tracking:**

- None detected (no Sentry/Bugsnag/Rollbar package or initialization found in code/config scanned).

**Logs:**

- Minimal console logging (`console.log`) in `src/app/providers/pwa/register.ts`.
- No centralized logging transport detected in frontend repository.

## CI/CD & Deployment

**Hosting:**

- Vercel-style SPA routing config in `vercel.json` (rewrite `/(.*)` to `/`).

**CI Pipeline:**

- Not detected (no `.github/workflows/*.yml` present).

## Environment Configuration

**Required env vars:**

- `VITE_API_URL` (used in `src/shared/api/interceptors.ts`).
- Other env vars: unknown from available code/config evidence.

**Secrets location:**

- Root `.env` file is present (contents intentionally not inspected).
- Hosted environment secret store: unknown (not declared in repo config).

## Webhooks & Callbacks

**Incoming:**

- No HTTP webhook endpoints in this frontend repository.
- Service worker receives browser events (`push`, `notificationclick`, `message`) in `src/app/providers/pwa/sw.js`.

**Outgoing:**

- Outgoing HTTP calls to backend auth endpoints via Axios (`src/entities/user/api/userApi.ts`).
- Other outbound integrations (analytics, payments, messaging providers): not detected.

---

Integration audit: 2026-04-14
