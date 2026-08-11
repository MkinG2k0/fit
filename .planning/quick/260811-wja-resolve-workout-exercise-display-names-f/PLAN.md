---
id: 260811-wja-resolve-workout-exercise-display-names-f
slug: resolve-workout-exercise-display-names-f
status: complete
created: 2026-08-11
---

# PLAN: Resolve workout exercise display names from catalog Map

## Goal

Workout UI shows the **live catalog name** for an exercise via O(1) `Map` lookup by `catalogExerciseId`, with denormalized `exercise.name` only as fallback when the catalog entry is missing (deleted / orphan / legacy). Renaming in the catalog does **not** walk calendar days or localStorage buckets.

## Locked decisions (must implement)

1. **D-01** Source of truth for live names = catalog (`exercise-store`).
2. **D-02** Build `Map<catalogExerciseId, name>` when catalog changes — O(1) lookup, not linear scan per card.
3. **D-03** Display: `nameById.get(catalogExerciseId) ?? exercise.name`.
4. **D-04** Do **not** walk all calendar days / localStorage on rename.
5. **D-05** Keep writing denormalized `name` when adding exercises to a day (snapshot for orphan case).
6. **D-06** Prefer Map derived from exercise store (helper + `useMemo` / thin hook) over calling `findCatalogExerciseById` on every card render for display.
7. **D-07** Wire resolve into workout UI that shows `exercise.name` (`ExerciseCard`, `ExerciseBody` at minimum; `LoadTableList` switch to Map if cheap).

## Scope

- **Add:** `src/entities/exercise/lib/catalogNameIndex.ts` (Map builder + display resolver)
- **Export:** via `src/entities/exercise/index.ts`
- **Wire:** `ExerciseCard.tsx`, `ExerciseBody.tsx`, `LoadTableList.tsx`
- **Do not change:** `updateExercise` / `deleteExercise` calendar side-effects (none today — keep it that way); `generateExercise` still writes `name`; identity/history APIs that key on `catalogExerciseId` / denormalized name beyond display props

## Tasks

### Task 1: Catalog name index + display resolver (entities)

**Files:**
- `src/entities/exercise/lib/catalogNameIndex.ts` (create)
- `src/entities/exercise/index.ts` (export)

**Actions:**

1. Add pure helper `buildCatalogNameById(categories: ExerciseCategory[]): Map<string, string>` that walks categories once and sets `map.set(catalogExercise.id, catalogExercise.name)` for every catalog entry (per **D-02**, **D-01**). Do not index legacy-name keys here — orphans use snapshot fallback (**D-03**).
2. Add `resolveWorkoutExerciseDisplayName(exercise: Pick<Exercise, "name" | "catalogExerciseId">, nameById: ReadonlyMap<string, string>): string`:
   - If `catalogExerciseId` is non-empty after trim and `nameById.has(id)` → return mapped name.
   - Else → return `exercise.name` (snapshot / missing id) per **D-03**.
3. Optionally add a tiny hook in the same file (or `lib/useCatalogNameById.ts` if preferred) that reads `useExerciseStore((s) => s.exercises)` and `useMemo`s `buildCatalogNameById` — so cards share one Map derivation pattern without rebuilding ad-hoc (**D-06**). Prefer hook if both Card and Body need the Map; otherwise `useMemo` inline in each consumer is fine.
4. Export `buildCatalogNameById`, `resolveWorkoutExerciseDisplayName`, and the hook (if created) from `src/entities/exercise/index.ts`.
5. Leave `findCatalogExerciseById` intact for non-display lookups (merge, rename picker, measurement type, etc.).

**Verify:**

```text
pnpm exec tsc -b --pretty false
```

- Grep: new helpers exported from `src/entities/exercise/index.ts`
- Manual sanity: `buildCatalogNameById` size equals flat catalog exercise count

**Done when:**

- O(1) Map builder + resolver exist and are public API
- No calendar/localStorage walk added anywhere

### Task 2: Wire display resolve into workout + load-table UI

**Files:**
- `src/features/exercise/ui/ExerciseCard.tsx`
- `src/features/exercise/ui/ExerciseBody.tsx`
- `src/features/loadTable/ui/LoadTableList.tsx`

**Actions:**

1. **ExerciseCard** (per **D-07**): Obtain `nameById` once (hook or `useMemo` + `buildCatalogNameById`). Compute `displayName = resolveWorkoutExerciseDisplayName(exercise, nameById)`. Use `displayName` for all user-visible title/props that currently pass `exercise.name` (header title, `StatisticCard` / delete dialog `exerciseName`, etc.). Do **not** replace `catalogExerciseId` wiring or `setExerciseName` / catalog-pick flows that intentionally write denormalized name into the day exercise (**D-05**). Keep `findCatalogExerciseById` only where full catalog entry is needed (measurement type, icon, category).
2. **ExerciseBody** (per **D-07**): Same resolve for visible `exerciseName` / titles. Keep `useLastExerciseSession(exercise.name, exercise.catalogExerciseId)` args as-is unless the hook already prefers `catalogExerciseId` — do not break last-session matching for this task.
3. **LoadTableList** (per **D-07**, cheap): Replace per-row `findCatalogExerciseById` display path with one shared `nameById` Map; show `nameById.get(entry.catalogExerciseId) ?? "Упражнение"` (load-table rows have no denormalized name field). Building the Map once per list render is enough.
4. Confirm **D-04** / **D-05**: do not edit `exerciseStore.updateExercise` to touch calendar days; do not remove `name` assignment in `generateExercise` / add-to-day helpers.

**Verify:**

```text
pnpm exec tsc -b --pretty false
```

- Grep in `ExerciseCard.tsx` / `ExerciseBody.tsx`: visible title props use resolved display name (not raw `exercise.name` alone for titles)
- Grep in `LoadTableList.tsx`: display no longer depends on per-row `findCatalogExerciseById` for the name line
- Grep `updateExercise` / calendar rename walk: still no bulk day updates on catalog rename

**Done when:**

- Renaming a catalog exercise updates workout card titles on next render without rewriting day storage
- Deleted catalog entry still shows denormalized day `exercise.name`
- New day exercises still persist snapshot `name`
- Load-table list uses Map lookup for names

## Out of scope

- Bulk remapping / rewriting historical day `exercise.name` on rename
- Replacing all `findCatalogExerciseById` call sites (measurement, merge, icons)
- Changing `useLastExerciseSession` matching algorithm
- Persisting the Map itself in the zustand store

## Success criteria

- Live catalog rename → workout UI titles update without calendar walk
- Orphan / deleted catalog → snapshot `exercise.name` still shown
- Display path is O(1) Map get, not linear catalog scan per card
