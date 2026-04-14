# Technology Stack (2026) — MagFitDiary

**Scope:** subsequent milestone (fast logging, progress charts, exercise category UX)  
**Context:** existing React + TypeScript + Zustand app, local-first v1 (no auth/cloud yet)  
**Researched:** 2026-04-14

## Recommended Stack (Prescriptive)

| Layer | Technology | Version guidance | Why this choice | Confidence |
|---|---|---|---|---|
| App framework | React | `19.2.x` | Current stable line, aligns with existing app, no migration tax | HIGH |
| Language | TypeScript | `6.0.x` | Better type performance/tooling, strong fit for growing domain models (sets, reps, history) | HIGH |
| Build tooling | Vite | `8.0.x` | Current supported major, fast builds and good DX for iterative UI work | HIGH |
| Routing | React Router | `7.14.x` | Already used in app, modern route model, smooth incremental upgrades | HIGH |
| Styling | Tailwind CSS + `@tailwindcss/vite` | `4.2.x` | Fast UI iteration for dense forms/lists, tokenized design consistency | HIGH |
| Client state (UI/domain) | Zustand | `5.0.x` | Already in architecture; simple and predictable for local UI/business state | HIGH |
| Local persistence (primary) | Dexie + dexie-react-hooks | `4.4.x` + `4.4.x` | For workout history and charts, IndexedDB scales better than raw localStorage | MEDIUM |
| Forms (quick logging) | react-hook-form + zod + @hookform/resolvers | `7.72.x` + `4.x` + `5.2.x` | Fast uncontrolled inputs, low re-render cost, strict runtime validation | HIGH |
| Charts (progress by reps/weight) | Recharts | `3.8.x` | Low-friction React integration for line/bar charts, enough for MVP analytics | MEDIUM |
| HTTP client (future sync readiness) | Axios | `1.12.x` | Already in project; keep single API abstraction for future cloud phase | HIGH |
| Dates | dayjs | `1.11.x` | Already used; lightweight for workout timeline aggregation and labels | HIGH |
| Optional offline UX | vite-plugin-pwa | `1.2.x` | Add install/offline shell later without stack rewrite | MEDIUM |

## What To Build With This Stack (for this milestone)

1. Keep existing React + TS + Zustand baseline; avoid framework churn.  
2. Move workout history reads/writes for charts to Dexie (not raw localStorage).  
3. Implement fast logging forms on react-hook-form + zod schemas (`exercise -> sets -> weight/reps`).  
4. Upgrade `recharts` to `3.8.x` and implement focused progress charts (weight/reps trends).  
5. Keep Axios abstraction in place, but do not introduce server-state complexity in local-only v1.

## What NOT to use (and why)

| Avoid | Why not now | Use instead |
|---|---|---|
| Full backend stack now (Supabase/Firebase/Auth) | Conflicts with local-only v1 scope; slows delivery of core UX | Local-first with Dexie, prepare API boundaries only |
| Heavy global state platforms (Redux Toolkit for everything) | Adds boilerplate for current scope; app already uses Zustand effectively | Zustand slices + focused hooks |
| Overpowered charting stacks (ECharts/Highcharts) for MVP | Heavier setup/footprint than needed for simple progress lines/bars | Recharts |
| Raw `localStorage` as long-term primary DB | Weak querying/indexing for growing workout history | IndexedDB via Dexie |
| Premature TanStack Query-first architecture | Server state is not core in v1 local-only mode | Introduce TanStack Query in sync milestone |

## Upgrade notes from current repo

- `typescript` is currently `~5.8.3` -> target `6.0.x` in a controlled upgrade pass.
- `recharts` is currently `2.15.4` -> target `3.8.x` before chart feature rollout.
- `vite` alias already points to `rolldown-vite@7.1.12`; converge on supported `vite@8.0.x` strategy in one step (with migration check).

## Practical install set (new additions)

```bash
npm install dexie dexie-react-hooks react-hook-form zod @hookform/resolvers
```

## Source-backed version snapshot

- React: `19.2.5` (npm + official releases)  
- TypeScript: `6.0.2` (npm + official releases)  
- Vite: `8.0.8` (npm + official releases/support page)  
- React Router DOM: `7.14.1` (npm + official docs)  
- Tailwind CSS / @tailwindcss/vite: `4.2.2` (npm + official docs)  
- Zustand: `5.0.12` (npm)  
- Recharts: `3.8.1` (npm + official docs)  
- Dexie: `4.4.2`, dexie-react-hooks `4.4.0` (npm + official docs)  
- react-hook-form: `7.72.1`, zod `4.3.6`, @hookform/resolvers `5.2.2` (npm + official docs)

## Sources

- https://github.com/facebook/react/releases  
- https://github.com/microsoft/TypeScript/releases  
- https://vite.dev/releases  
- https://reactrouter.com/home  
- https://tailwindcss.com/docs/installation/using-vite  
- https://tanstack.com/query/latest/docs/framework/react/overview  
- https://recharts.github.io/en-US/guide  
- https://dexie.org/docs/Tutorial/React  
- https://react-hook-form.com/get-started  
- https://zod.dev/  
- https://www.npmjs.com/ (versions via `npm view`)
