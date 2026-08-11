# Business & Product Decisions

**Analyzed:** 2026-08-12

## Product Intent

- **Product:** Fit — workout tracking web app (with Capacitor Android extras) for beginners in the gym.
- **Core value:** A beginner can log each workout quickly and clearly, and see measurable progress (volume / weight / reps) without friction.
- **Primary user:** Beginner gym-goer; UX prioritizes clarity and low cognitive load (`.planning/PROJECT.md`).
- **Primary journey (quick log):** Home → pick day on week calendar → add exercise(s)/preset → add sets with weight+reps (or stack/time) → data persists locally → review history/analytics later.
- **Ship posture:** Local-first, web-first; account sync and native-as-primary deferred in planning docs. Code already ships optional Capacitor paths (Health calories, system bars, Android back, file share).

## Domain Model (for AI navigation)

### Key entities

| Entity | Role | Types / primary files |
|--------|------|------------------------|
| **CatalogExercise** | Template in user's exercise catalog (name, icon, measurement type/step) | `src/entities/exercise/model/types.ts` |
| **ExerciseCategory** | Named category grouping catalog exercises | `src/entities/exercise/model/types.ts` |
| **TrainingPreset** | Named list of catalog exercise ids for bulk add | `src/entities/exercise/model/types.ts` |
| **Exercise** (day instance) | Exercise card on a calendar day; has logged `sets` | `src/entities/exercise/model/types.ts` |
| **ExerciseSet** | One set: `weight`, `reps`, optional `startTime`/`endTime`/`calories` | `src/entities/exercise/model/types.ts` |
| **MeasurementType** | How weight/reps fields are interpreted in UI | `src/entities/exercise/model/measurementTypes.ts` |
| **CalendarDay** | One day bucket: `{ exercises: Exercise[] }` | `src/entities/calendarDay/model/types.ts` |
| **User / personalData / ringGoals** | Display name, body profile for calories, ring goals, feature flags | `src/entities/user/model/types.ts`, `src/entities/user/model/ringGoals.ts`, `src/entities/user/slice/userStore.ts` |
| **BodyMetricsEntry** | Body measurements snapshot (kg/cm + custom metrics) | `src/entities/bodyMetrics/model/types.ts` |
| **LoadTableExercise** | 16-week %RM plan row for a catalog exercise | `src/entities/loadTable/model/types.ts` |
| **Analytics sessions** | Derived tonnage/reps/trends from journal days | `src/entities/analytics/model/types.ts`, `src/entities/analytics/lib/normalizeTrainingSessions.ts` |
| **Health metrics** | Native heart-rate / daily health (Android Health Connect path) | `src/entities/health/` |

### How they relate

```text
ExerciseCategory ──contains──▶ CatalogExercise (measurementType, measurementStep)
        │                              │
        │                              ▼
TrainingPreset ──refs ids──▶ catalogExerciseId
                                   │
                                   ▼ (add to day)
CalendarDay[DD-MM-YYYY].exercises[] = Exercise (day instance)
                                   │
                                   └── sets[] = ExerciseSet (weight, reps, …)

User flags gate optional menus (timer, body metrics, load table, activity)
BodyMetrics / LoadTable / Theme are parallel persisted domains
Analytics / rings / shareStats read CalendarDay journal via volume helpers
```

### Where state lives (Zustand)

| Store | Persist key / storage | Path |
|-------|----------------------|------|
| `useCalendarStore` | Month buckets via `saveDaysToLocalStorage` / `getDaysFromLocalStorage` (`MM-YYYY` → days `DD-MM-YYYY`) | `src/entities/calendarDay/slice/calendarStore.ts` |
| `useExerciseStore` | `exercise-store` (persist) | `src/entities/exercise/slice/exerciseStore.ts` |
| `useUserStore` | `user` (persist) — flags, tokens, ring goals, personal data | `src/entities/user/slice/userStore.ts` |
| `useThemeStore` | `theme-preferences` | `src/entities/theme/slice/themeStore.ts` |
| `useBodyMetricsStore` | body-metrics storage API | `src/entities/bodyMetrics/slice/bodyMetricsStore.ts` |
| `useLoadTableStore` | load-table storage API | `src/entities/loadTable/slice/loadTableStore.ts` |

Storage façade: `src/shared/lib/storage.ts`, adapter `src/shared/lib/storageAdapter/`.

## Key Business Rules Encoded in Code

Prefer these over planning docs when they differ.

### Logging & sets

- **New day exercise starts with zero sets** (`sets: []`) — no auto placeholder set (`src/entities/calendarDay/lib/exerciseHelpers.ts`, quick summary `260811-tq6-no-default-set`).
- **Day key format:** `DD-MM-YYYY`; **month storage key:** `MM-YYYY` (`src/entities/calendarDay/lib/exerciseHelpers.ts`, `src/shared/lib/storage.ts`).
- **Add/edit/delete sets** mutate selected day's exercises and persist immediately (`src/entities/calendarDay/slice/calendarStore.ts`).
- **Prefill from last session:** look back up to 1 month; match by `catalogExerciseId` then name; `getSetPrefillFromLastSession` returns zeros outside last-session set count (no inventing weights) — `src/shared/lib/findLastExerciseSession.ts`, applied in `src/features/exercise/ui/ExerciseBody.tsx`.
- **Empty set rule:** free_weight/stack → empty if `reps === 0 && weight === 0`; time → empty if `weight === 0` (seconds live in `weight`) — `src/features/exercise/ui/ExerciseSetRow.tsx`.
- **Time measurement:** duration stored as total seconds in `ExerciseSet.weight`; UI mask `m:ss` / space-separated (`src/entities/exercise/model/measurementTypes.ts`).

### Measurement types (broader than PROJECT.md “weight+reps only”)

| Type | Meaning | Defaults |
|------|---------|----------|
| `free_weight` | Default; free weight kg | Default when unknown (`normalizeMeasurementType`) |
| `stack_kg` | Machine stack kg | Default step **5** |
| `stack_lbs` | Machine stack lbs | Default step **10**; UI unit label `lbs` |
| `time` | Timed holds/cardio-style | Seconds in `weight`; no step |

Source: `src/entities/exercise/model/measurementTypes.ts`, create UI `src/features/createExercise/ui/CreateExerciseMeasurementSection.tsx`.

### Volume / progress math

- **Bodyweight / zero-kg rule:** if `weight === 0`, volume uses effective weight **1** so `reps × 0` still counts (`10×0 → 10`) — `src/shared/lib/calcSetVolumeKg.ts`. Used by rings (`src/shared/lib/days.tsx`), analytics (`src/entities/analytics/lib/normalizeTrainingSessions.ts`), share stats.
- **Default ring goals:** 20 sets / 6000 volume for full rings — `src/entities/user/model/ringGoals.ts`.
- **Analytics periods in code:** `7d`, `30d`, `90d`, `180d`, `365d` (not week/month/all-time labels from REQUIREMENTS) — `src/features/analyticsFilters/model/types.ts`.
- **Tonnage / exercise trends** built in `src/entities/analytics/lib/*`, dashboard UI under `src/widgets/analyticsDashboard/`.

### Persistence & backup

- Journal months registered under regex `^(0[1-9]|1[0-2])-\d{4}$` — `src/shared/lib/storage.ts`.
- Settings export/import is **JSON bundle** sections: theme, exercises, workoutJournal, userProfile — `src/features/appSettingsTransfer/`. **CSV export not present** in code (REQUIREMENTS DATA-03 still pending).

### Auth / gatekeeping

- Routes wrap pages in `ProtectedRoute`, but it is a **pass-through** (`return children`) — no login required — `src/app/router/routes.tsx`.
- `LogInPage` / `userApi` / `accessToken` exist for future account sync; not on the active route gate.

### Feature flags (user preferences, mostly default OFF)

From `src/entities/user/slice/userStore.ts`, toggled in Settings / menu cards:

| Flag | Default | Effect |
|------|---------|--------|
| `timerMenuEnabled` | false | Show Timer in profile menu |
| `bodyMetricsMenuEnabled` | false | Show Body metrics |
| `loadTableMenuEnabled` | false | Show Load table |
| `activityMenuEnabled` | false | Show Activity/Health |
| `workoutCaloriesEnabled` | false | Calories UI only if **also** native Capacitor |
| `aiFillEnabled` | false | Experimental AI set fill (route/menu currently disabled) |
| `exerciseCardShowLastSessionResult` | true | Last-session hint on collapsed card |
| `lastSessionFillButtonEnabled` | false | Fill all sets from last session |
| `restBetweenSetsEnabled` | true | Auto rest timer after add set (default 120s) |
| `workoutListShowDaySummary` | true | Day summary above list |
| `exerciseCardReorderEnabled` | false | Drag reorder day exercises |

Menu toggles UI: `src/features/profileDropDownMenu/ui/MenuSectionsSettingsCard.tsx`.

### Capacitor / platform

- Calories column/header only when `Capacitor.isNativePlatform() && workoutCaloriesEnabled` — `src/features/exercise/lib/useWorkoutCaloriesUiEnabled.ts`.
- Android back navigation — `src/app/providers/AndroidBackNavigation.tsx` + `src/shared/lib/navigation/`.
- Native share/download paths — `src/features/shareStats/lib/sharePngFile.ts`, `src/features/appSettingsTransfer/lib/downloadTextFile.ts`.

### AI / news

- **AI recommendations page & menu entry commented out** in `src/app/router/routes.tsx` and `src/features/profileDropDownMenu/ui/profileDropDownMenu.tsx`; feature code remains under `src/features/aiRecommendations/`, `src/pages/AiRecommendationsPage/`.
- **News** is a curated in-app changelog — `src/features/news/model/newsEntries.ts`, route `/news`.

## Product Decisions & Rationale

| Decision | Why | Where enforced | Status |
|----------|-----|----------------|--------|
| Quick-log is primary flow | Core value; beginner friction | Home: `src/pages/HomePage/ui/HomePage.tsx` → `src/widgets/exerciseList/ui/ExerciseList.tsx` + `src/features/addExercise/` + `src/features/exercise/` | **Shipped** (brownfield); roadmap Phase 1 still tracks polish |
| Weight + reps as set model | Fast input; `ExerciseSet` always has weight+reps | `src/entities/exercise/model/types.ts` | **Shipped**; extended by measurement types |
| Measurement types beyond free weight | Stack machines + timed work need different UX | `measurementTypes.ts`, `ExerciseSetRow.tsx`, create-exercise section | **Shipped** (ahead of PROJECT.md “weight+reps only”) |
| No default empty set on new exercise | Avoid fake “set 1”; user taps Add set | `generateExercise`, calendar `addExercise` | **Shipped** |
| Prefill from last session | LOG-04 / speed | `findLastExerciseSession.ts`, `ExerciseBody.tsx` | **Shipped** |
| Local-first persistence | Ship without accounts | `storage.ts`, calendar/exercise/user stores | **Shipped** |
| Auth deferred / no route guard | Reduce scope | `ProtectedRoute` no-op in `routes.tsx` | **Deferred** (API stubs exist) |
| Web-first + Capacitor extras | Browser primary; native Health/share optional | `useWorkoutCaloriesUiEnabled.ts`, Capacitor plugins | **Web shipped**; native optional |
| Progress via analytics dashboard | Visible progress | `/analytics`, `src/entities/analytics/`, `src/widgets/analyticsDashboard/` | **Shipped** (periods differ from REQUIREMENTS labels) |
| Calendar week UI for history | HIST-02 | Week slider widgets + calendar store | **Shipped** |
| Categories + custom categories | Organize catalog | `useExerciseStore` create/rename/delete category; `src/features/createCategory/` | **Shipped** |
| Presets for multi-exercise add | Speed logging | `TrainingPreset`, `src/features/createPreset/`, add-exercise drawer | **Shipped** |
| Optional menu sections | Keep primary nav simple for beginners | `MenuSectionsSettingsCard.tsx`, profile menu flags | **Shipped** |
| Body metrics as opt-in | Not core quick-log | `/body-metrics`, `bodyMetrics` entity; menu flag default off | **Shipped** (optional) |
| Load table (16-week %) as opt-in | Advanced programming | `/load-table`, `loadTable` entity | **Shipped** (optional) |
| Rest timer between sets | Quality-of-life, not RPE | `restBetweenSets*` in user store; `src/features/timer/` | **Shipped** |
| AI fill / AI recommendations off by default / routes disabled | High complexity / low confidence for v1 | Routes commented; `aiFillEnabled` default false | **Out of active product surface** (code retained) |
| News changelog | Communicate features without social | `/news`, `newsEntries.ts` | **Shipped** |
| JSON settings + journal export/import | Local backup without cloud | `src/features/appSettingsTransfer/` | **JSON shipped**; CSV not implemented |
| Zero-weight volume = bodyweight reps | Bodyweight exercises still feed rings/analytics | `calcSetVolumeKg.ts` | **Shipped** |
| Share stats as PNG | Light social without feed | `src/features/shareStats/` | **Shipped** (not a social network) |

## Out of Scope (v1)

From `.planning/PROJECT.md` / `.planning/REQUIREMENTS.md`, with code notes:

| Item | Planning reason | Code reality |
|------|-----------------|--------------|
| Multi-device cloud sync / accounts | Deferred to v2 SYNC-* | Login/API stubs; no enforced auth |
| Social feed / likes / subscriptions | Not quick-log | Share PNG only — not a feed |
| Native apps as primary delivery | Web-first | Capacitor extras exist but web remains primary |
| Advanced metrics by default (RPE/RIR/readiness) | Beginner complexity | Rest timer optional; no RPE fields on sets |
| AI-generated training plans in v1 | Complexity / confidence | AI recommendation routes disabled |
| CSV export (DATA-03) | Planned Phase 5 | Not found — JSON bundle only |

## Where to Look Map

| If you need… | Open… |
|--------------|--------|
| Log workout sets / edit day exercises | `src/features/exercise/ui/ExerciseBody.tsx`, `ExerciseSetRow.tsx`, `src/entities/calendarDay/slice/calendarStore.ts` |
| Add exercise / preset to day | `src/features/addExercise/ui/AddExercise.tsx`, `src/features/addExercise/lib/submitExercises.ts` |
| Create/edit catalog exercise or category | `src/pages/CreateExercisePage/`, `src/features/createExercise/`, `src/entities/exercise/slice/exerciseStore.ts` |
| Create/edit preset | `src/pages/CreatePresetPage/`, `src/features/createPreset/` |
| Calendar / selected day data | `src/entities/calendarDay/` (`calendarStore.ts`, `exerciseHelpers.ts`, `ui/Day.tsx`); week UI via `src/widgets` week slider |
| Persistence (journal months) | `src/shared/lib/storage.ts`, `src/shared/lib/storageAdapter/` |
| Last-session prefill | `src/shared/lib/findLastExerciseSession.ts` |
| Volume / bodyweight rule | `src/shared/lib/calcSetVolumeKg.ts` |
| Measurement types | `src/entities/exercise/model/measurementTypes.ts` |
| Navigation / routes | `src/app/router/routes.tsx`; back paths `src/shared/lib/navigation/` |
| Settings / profile menu / feature flags | `src/pages/SettingsPage/`, `src/features/profileDropDownMenu/`, `src/entities/user/slice/userStore.ts` |
| Statistics / analytics | `src/pages/AnalyticsPage/`, `src/widgets/analyticsDashboard/`, `src/entities/analytics/` |
| Body metrics | `src/pages/BodyMetricsPage/`, `src/entities/bodyMetrics/`, `src/features/bodyMetricsEntry/` |
| Load table | `src/pages/LoadTablePage/`, `src/entities/loadTable/`, `src/features/loadTable/` |
| Timer / rest | `src/pages/TimerPage/`, `src/features/timer/` |
| Export / import backup | `src/features/appSettingsTransfer/` |
| News changelog | `src/pages/NewsPage/`, `src/features/news/` |
| AI fill / recommendations (dormant) | `src/features/aiRecommendations/`, `src/pages/AiRecommendationsPage/` |
| Health / activity (native) | `src/pages/ActivityPage/`, `src/entities/health/`, `src/features/healthMetrics/` |
| Share progress card | `src/features/shareStats/` |
| Home composition | `src/pages/HomePage/ui/HomePage.tsx` → WeekSlider + ExerciseList |

---

*Business & product map: 2026-08-12*
