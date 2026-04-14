# Codebase Concerns

**Analysis Date:** 2026-04-14

## Tech Debt

**Inconsistent styling system (Tailwind + CSS Modules + inline styles):**
- Issue: Project mixes utility classes, CSS Modules, and inline style objects, which increases UI regression risk and slows refactoring.
- Files: `src/widgets/weekCalendar/ui/Calendar.tsx`, `src/widgets/loginForm/ui/LoginForm.tsx`, `src/features/exercise/ui/ExerciseCard.tsx`, `src/features/createPreset/ui/CreatePreset.tsx`, `src/widgets/weekCalendar/ui/WeekCalendar.module.css`, `src/features/exercise/ui/ExerciseCard.module.css`
- Impact: Hard to enforce consistent design tokens, difficult to theme globally, brittle styling during component updates.
- Fix approach: Standardize on Tailwind + `cn()` and keep inline styles only for dynamic values.
- Priority: High
- Confidence: High
- Evidence: Evidenced

**Architecture boundary erosion (direct internal imports, cross-slice coupling):**
- Issue: Multiple imports bypass slice public APIs and couple features/widgets to internal paths of other slices.
- Files: `src/shared/api/interceptors.ts`, `src/shared/lib/daysRender.tsx`, `src/widgets/allExercises/ui/allExercises.tsx`, `src/widgets/statisticCard/ui/statisticCard.tsx`
- Impact: Refactors become risky because internal file moves break many consumers; FSD boundaries are not enforced.
- Fix approach: Restrict imports to slice `index.ts` APIs and enforce via ESLint rules.
- Priority: High
- Confidence: High
- Evidence: Evidenced

**Dual lockfiles and package-manager ambiguity:**
- Issue: Both npm and pnpm lockfiles are committed.
- Files: `package-lock.json`, `pnpm-lock.yaml`
- Impact: Dependency drift between environments, non-reproducible builds/CI outcomes.
- Fix approach: Choose one package manager, remove the other lockfile, and enforce in CI.
- Priority: Medium
- Confidence: High
- Evidence: Evidenced

## Known Bugs

**Invalid Tailwind class token in exercises page layout:**
- Symptoms: Grid row utility contains an extra bracket, so layout rule can be dropped by Tailwind parser.
- Files: `src/widgets/allExercises/ui/allExercises.tsx`
- Trigger: Open exercises page where the `grid-rows-[85%_15%]]` class is rendered.
- Workaround: None reliable at runtime; requires code fix.
- Priority: Medium
- Confidence: High
- Evidence: Evidenced

**Login error parsing can throw and hide original backend error:**
- Symptoms: `JSON.parse(reason.request.response)` may throw when response shape differs (network error, empty response, non-JSON body).
- Files: `src/widgets/loginForm/ui/LoginForm.tsx`
- Trigger: Failed login/registration request with unexpected Axios error payload.
- Workaround: Retry in stable network conditions; no robust UI fallback implemented.
- Priority: High
- Confidence: High
- Evidence: Evidenced

## Security Considerations

**Access token persisted in browser storage:**
- Risk: Access token is stored in persisted Zustand state (browser storage), increasing exposure to XSS/token theft scenarios.
- Files: `src/entities/user/slice/userStore.ts`, `src/shared/api/interceptors.ts`
- Current mitigation: `withCredentials` and refresh flow exist in interceptor logic.
- Recommendations: Keep access token in memory, use httpOnly secure cookies for auth tokens, rotate tokens on suspicious activity.
- Priority: High
- Confidence: Medium
- Evidence: Evidenced

**Service worker notification channel has no message-source hardening:**
- Risk: `message` event in service worker accepts payload and shows notifications without explicit sender validation.
- Files: `src/app/providers/pwa/sw.js`, `src/features/timer/lib/notifications.ts`
- Current mitigation: Browser service worker scope limits message origin to controlled pages.
- Recommendations: Validate message shape and expected sender context before showing notifications.
- Priority: Medium
- Confidence: Medium
- Evidence: Inferred

## Performance Bottlenecks

**Unbounded swiper arrays during navigation:**
- Problem: Week/month data arrays only grow when near edges and are never pruned.
- Files: `src/features/weekSwiper/ui/weekSwiper.tsx`, `src/features/monthSwiper/ui/monthSwiper.tsx`
- Cause: Repeated `setWeeks`/`setMonths` appends/prepends without max window size.
- Improvement path: Use a fixed-size sliding window and recenter active index.
- Priority: Medium
- Confidence: High
- Evidence: Evidenced

**Frequent full-object rewrites to localStorage on edits:**
- Problem: Exercise updates rebuild `days` object and persist monthly data for each change.
- Files: `src/entities/calendarDay/slice/calendarStore.ts`, `src/entities/calendarDay/lib/exerciseHelpers.ts`, `src/shared/lib/storage.ts`
- Cause: Immutable full-map updates + synchronous `localStorage` writes on every mutation.
- Improvement path: Batch writes (debounce) and persist deltas instead of full month snapshots.
- Priority: Medium
- Confidence: High
- Evidence: Evidenced

## Fragile Areas

**Calendar store complexity concentrated in one mutable workflow:**
- Files: `src/entities/calendarDay/slice/calendarStore.ts`
- Why fragile: File has many similar mutation branches and non-null assertion (`exerciseParams!`), making edge-case regressions likely.
- Safe modification: Split mutations into small pure helpers and add guard clauses for nullable params.
- Test coverage: No tests detected for this store logic.
- Priority: High
- Confidence: High
- Evidence: Evidenced

**Storage parsing path is not resilient to malformed persisted data:**
- Files: `src/shared/lib/storage.ts`
- Why fragile: Multiple `JSON.parse` calls operate without try/catch and can crash hydration if storage is corrupted.
- Safe modification: Wrap parse operations in safe parser with fallback defaults and telemetry.
- Test coverage: No storage corruption tests detected.
- Priority: High
- Confidence: High
- Evidence: Evidenced

## Scaling Limits

**LocalStorage used as primary training log datastore:**
- Current capacity: Browser localStorage (~5-10 MB typical limit, browser-dependent).
- Limit: Dataset growth can hit quota or degrade UX with large month history.
- Scaling path: Move workout history to backend persistence with pagination/sync and offline cache strategy.
- Priority: High
- Confidence: Medium
- Evidence: Inferred

**Exercise and preset catalogs are static code constants:**
- Current capacity: Limited to hardcoded arrays.
- Limit: Product changes require deploy; no dynamic catalog governance.
- Scaling path: Source catalogs from API/admin-managed config.
- Priority: Medium
- Confidence: High
- Evidence: Evidenced

## Dependencies at Risk

**Bundler alias uses pre-release rolldown variant for Vite:**
- Risk: Potential ecosystem/plugin edge cases compared to stable Vite paths.
- Impact: Build/runtime inconsistencies or tooling incompatibilities.
- Migration plan: Revalidate current plugin set against stable Vite and keep rollback option documented.
- Files: `package.json`
- Priority: Medium
- Confidence: Medium
- Evidence: Evidenced

## Missing Critical Features

**Route protection is a no-op and login route is not wired:**
- Problem: `ProtectedRoute` returns children unconditionally; no `/login` route is defined despite login page existing.
- Blocks: Real authentication gating, redirect-to-login flows, role-based access.
- Files: `src/app/router/routes.tsx`, `src/pages/LogInPage/ui/LogInPage.tsx`
- Priority: High
- Confidence: High
- Evidence: Evidenced

**No global fallback/error boundary around lazy routes:**
- Problem: Lazy pages are declared but app root does not provide explicit `Suspense` fallback or error boundary.
- Blocks: Robust recovery and graceful UX during chunk loading/errors.
- Files: `src/app/router/routes.tsx`, `src/app/main.tsx`
- Priority: High
- Confidence: Medium
- Evidence: Evidenced

## Test Coverage Gaps

**Core business flows have no automated tests:**
- What's not tested: Auth flow, calendar mutations, timer lifecycle, exercise/preset creation/deletion.
- Files: `src/widgets/loginForm/ui/LoginForm.tsx`, `src/entities/calendarDay/slice/calendarStore.ts`, `src/features/timer/lib/useTimer.ts`, `src/features/addExercise/lib/submitExercises.ts`
- Risk: Regressions are detected only manually after release.
- Priority: High
- Confidence: High
- Evidence: Evidenced

---

*Concerns audit: 2026-04-14*
