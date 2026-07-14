---
phase: 260714-wvs-merge-exercises
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/entities/exercise/lib/mergeCatalogExercise.ts
  - src/entities/exercise/lib/computeExerciseMergeStats.ts
  - src/entities/exercise/slice/exerciseStore.ts
  - src/entities/exercise/index.ts
  - src/entities/calendarDay/slice/calendarStore.ts
  - src/shared/lib/remapWorkoutJournalCatalogId.ts
  - src/features/createExercise/ui/MergeExerciseDialog.tsx
  - src/features/createExercise/ui/CreateExerciseFooter.tsx
  - src/features/createExercise/ui/CreateExercise.tsx
  - src/features/createExercise/index.ts
autonomous: true
requirements:
  - QUICK-MERGE-01
must_haves:
  truths:
    - "From CreateExercise edit screen, user can open merge modal comparing current exercise with another catalog exercise (names + total reps at minimum)."
    - "Confirming merge remaps source catalogExerciseId to target across all MM-YYYY journal buckets and in-memory calendar days without collapsing same-day cards into one."
    - "Presets replace source id with target id and dedupe; source catalog entry is deleted; target name/photos/description stay unchanged."
    - "After merge, user leaves the source edit screen; stats/analytics still work via remapped catalogExerciseId (derived, no separate analytics store write)."
  artifacts:
    - path: src/entities/exercise/lib/mergeCatalogExercise.ts
      provides: "Pure remap helpers for journal exercises + presets + merge orchestration contract"
    - path: src/features/createExercise/ui/MergeExerciseDialog.tsx
      provides: "Comparison modal with target picker and confirm"
    - path: src/entities/exercise/slice/exerciseStore.ts
      provides: "mergeExercises(sourceId, targetId) catalog+presets action"
  key_links:
    - from: "MergeExerciseDialog confirm"
      to: "mergeExercises + journal remap + calendar remap"
      via: "CreateExercise handler after confirm"
    - from: "journal instance.catalogExerciseId"
      to: "target catalog id (+ name/categoryId from target)"
      via: "remapWorkoutJournalCatalogId + calendarStore.remapCatalogExerciseId"
    - from: "normalizeTrainingSessions / analytics"
      to: "merged history under target id"
      via: "catalogExerciseId ?? id match after remap"
---

<objective>
Добавить объединение двух упражнений каталога: source → target с ремапом журнала/пресетов и UI на экране редактирования (per D-01, D-02, D-03, D-04).

Purpose: Пользователь может слить дубликаты без потери истории подходов и без поломки derived-статистики.
Output: Domain merge helpers + store actions + MergeExerciseDialog на CreateExercise edit.
</objective>

<execution_context>
@$HOME/.cursor/gsd-core/workflows/execute-plan.md
@$HOME/.cursor/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/quick/260714-wvs-merge-exercises/260714-wvs-CONTEXT.md
@src/entities/exercise/slice/exerciseStore.ts
@src/entities/exercise/model/types.ts
@src/entities/calendarDay/slice/calendarStore.ts
@src/shared/lib/storage.ts
@src/shared/lib/analyticsStorage.ts
@src/features/createExercise/ui/CreateExercise.tsx
@src/features/createExercise/ui/CreateExerciseFooter.tsx
@src/features/fullExerciseList/ui/DeleteDialog.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Domain remap helpers + store actions</name>
  <files>src/entities/exercise/lib/mergeCatalogExercise.ts, src/entities/exercise/lib/computeExerciseMergeStats.ts, src/shared/lib/remapWorkoutJournalCatalogId.ts, src/entities/exercise/slice/exerciseStore.ts, src/entities/calendarDay/slice/calendarStore.ts, src/entities/exercise/index.ts</files>
  <action>
Implement merge domain (per D-01, D-03, D-04):

1. `computeExerciseMergeStats.ts`: from `Record&lt;string, CalendarDay&gt;` (as returned by `readAllTrainingDaysFromStorage`) compute per catalog id at least `totalReps` (sum of set.reps where exercise matches via `catalogExerciseId ?? id`); optionally `sessionCount` / `setCount` for richer modal copy. Export a small type like `{ totalReps; sessionCount?; setCount? }`.

2. `mergeCatalogExercise.ts` pure helpers:
   - `remapPresetExerciseIds(presets, sourceId, targetId)` — replace source with target then dedupe within each preset `exercises` array (preserve order of first occurrence).
   - `remapDayExercises(exercises, sourceId, targetId, targetMeta)` — for each workout instance whose `catalogExerciseId ?? id` equals sourceId: set `catalogExerciseId` to targetId; set `name` / `categoryId` from targetMeta when provided; **do not** merge sets or drop sibling cards on the same day (D-01: keep two cards). Never change instance `id` (UUID).
   - Guard: if sourceId === targetId, no-op / treat as invalid at caller.

3. `remapWorkoutJournalCatalogId.ts` in shared/lib: read all month buckets via `readAllWorkoutMonthBuckets` / `listWorkoutMonthKeys` + `writeWorkoutMonthBucket`; for each `MM-YYYY` bucket, remap every day’s exercises with the pure helper; write back only buckets that changed. Do not invent a separate analytics persistence path (D-03).

4. `exerciseStore.mergeExercises(sourceId, targetId)`:
   - Resolve target catalog entry + its category id/name; abort if either id missing.
   - Update `trainingPreset` via remap+dedupe (D-03).
   - Remove source from `exercises` groups only — leave target name/photos/description untouched (D-04). Do not call existing `deleteExercise` alone without preset remap.
   - Export from `entities/exercise/index.ts`.

5. `calendarStore.remapCatalogExerciseId(sourceId, targetId, targetMeta)`: apply the same day-exercise remap to in-memory `days`, then persist affected months with existing `saveDaysToLocalStorage` pattern (or rely on journal rewrite + `loadDaysFromLocalStorage` if that is cleaner — prefer in-memory remap + persist so open month stays consistent). Same-day: two cards remain (D-01).
  </action>
  <verify>
    <automated>pnpm exec tsc --noEmit -p tsconfig.app.json 2>&amp;1 | head -n 40; rg -n "mergeExercises|remapCatalogExerciseId|remapWorkoutJournalCatalogId|computeExerciseMergeStats" src/entities/exercise src/entities/calendarDay src/shared/lib</automated>
  </verify>
  <done>
Pure remap helpers exist; exerciseStore exposes mergeExercises; calendarStore remaps in-memory days; journal MM-YYYY buckets can be rewritten; same-day cards are not collapsed; target metadata preserved.
  </done>
</task>

<task type="auto">
  <name>Task 2: Merge comparison modal + edit-screen entry</name>
  <files>src/features/createExercise/ui/MergeExerciseDialog.tsx, src/features/createExercise/ui/CreateExerciseFooter.tsx, src/features/createExercise/ui/CreateExercise.tsx, src/features/createExercise/index.ts</files>
  <action>
Wire UI only on createExercise edit flow (per D-02):

1. `CreateExerciseFooter`: when `isEditing`, add outline/secondary button label «Смержить упражнение» with `onMerge` callback (show only in edit mode alongside delete). Tailwind tokens only; inline className; no CSS modules.

2. `MergeExerciseDialog.tsx` (Dialog pattern like DeleteDialog):
   - Props: open, onOpenChange, sourceExercise `{ id, name }`, catalog list (flatten categories excluding source), onConfirm(targetId).
   - On open / when source known: load days via `readAllTrainingDaysFromStorage`, compute stats for source + selected target via `computeExerciseMergeStats`.
   - UI shows both exercises: names + total reps minimum; optionally sessions/sets. Discretion: Command/Select/list for picking target.
   - Confirm button disabled until a target is selected and target !== source. Confirm copy should make clear: data of source moves under target, source is removed, target name/photos kept (D-04).
   - Styling: Tailwind / existing Dialog primitives only.

3. `CreateExercise.tsx` (edit only when `editingExercise` set):
   - State for merge dialog open.
   - On confirm: async orchestrate — (a) `remapWorkoutJournalCatalogId(source, target, targetMeta)`, (b) `calendarStore.remapCatalogExerciseId(...)`, (c) `exerciseStore.mergeExercises(source, target)`, (d) close dialogs, (e) `handleClose` / navigate away from source edit (source deleted).
   - Resolve targetMeta (name, categoryId, category label) from catalog before remapping so journal instances pick up target labels.
   - Do not run merge from RenameCategoryDialog or list-only screens.
  </action>
  <verify>
    <automated>pnpm exec tsc --noEmit -p tsconfig.app.json 2>&amp;1 | head -n 40; rg -n "Смержить упражнение|MergeExerciseDialog|onMerge" src/features/createExercise</automated>
  </verify>
  <done>
Edit screen has merge button; modal compares names + total reps; confirm remaps data, deletes source from catalog, leaves edit for deleted source.
  </done>
</task>

<task type="auto">
  <name>Task 3: Typecheck and regression smoke checks</name>
  <files>src/entities/exercise/lib/mergeCatalogExercise.ts, src/features/createExercise/ui/CreateExercise.tsx</files>
  <action>
Finalize integration gates:

1. Ensure exports are public where needed (`entities/exercise`, `createExercise` barrel if dialog is exported — optional if only used internally).
2. Confirm merge path never writes a dedicated analytics store; stats remain derived from remapped journal (D-03).
3. Run lint on touched files; fix any introduced issues.
4. Document in SUMMARY the same-day behavior (two cards) and remap surface for future debug.
  </action>
  <verify>
    <automated>pnpm exec eslint src/entities/exercise/lib/mergeCatalogExercise.ts src/entities/exercise/lib/computeExerciseMergeStats.ts src/shared/lib/remapWorkoutJournalCatalogId.ts src/features/createExercise/ui/MergeExerciseDialog.tsx src/features/createExercise/ui/CreateExercise.tsx src/features/createExercise/ui/CreateExerciseFooter.tsx --max-warnings 0; pnpm exec tsc --noEmit -p tsconfig.app.json</automated>
  </verify>
  <done>
Lint and tsc pass on merge touchpoints; no separate analytics persistence; merge flow compile-clean.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| UI → local stores/storage | Merge confirmation mutates catalog, presets, and all workout month buckets in device storage |
| Derived analytics ← journal | Charts/stats re-read remapped `catalogExerciseId`; no network |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-260714-01 | Tampering | mergeExercises / journal remap | medium | mitigate | Require explicit confirm; reject source===target; keep instance UUIDs intact so accidental collapses/set loss cannot occur from id rewrite |
| T-260714-02 | Denial of service | remap all MM-YYYY buckets | low | accept | Local-only async rewrite; bounded by user’s own month keys |
| T-260714-03 | Elevation of privilege | N/A (local-first, no auth boundary in scope) | low | accept | No multi-user tenant; data is single-device |
| T-260714-SC | Tampering | npm/pip/cargo installs | low | accept | No new packages in this plan |
</threat_model>

<verification>
- From `/exercises/edit?id=<source>` open merge, pick target, confirm.
- Same day that had both exercises still shows two cards, both pointing at target catalog id (D-01).
- Preset that listed both ids now lists target once.
- Source absent from catalog; target meta unchanged (D-04).
- Analytics/stat modal for target includes former source history (D-03 derived).
</verification>

<success_criteria>
- D-01–D-04 implemented and greppable in code paths above.
- User can merge two catalog exercises from CreateExercise edit with comparison modal.
- Journal + presets remapped; source deleted; stats still resolve via catalogExerciseId.
</success_criteria>

<output>
Create `.planning/quick/260714-wvs-merge-exercises/260714-wvs-SUMMARY.md` when done
</output>

## Source Audit

```
SOURCE  | ID           | Item                                              | Plan | Status  | Notes
--------|--------------|---------------------------------------------------|------|---------|------
GOAL    | —            | Merge two exercises without breaking history/stats| 01   | COVERED |
REQ     | QUICK-MERGE-01 | Catalog merge + remap + UI                     | 01   | COVERED |
RESEARCH| —            | (none; quick mode, no research phase)             | —    | N/A     |
CONTEXT | D-01         | Same-day: keep two cards, remap catalog id       | 01   | COVERED | Task 1
CONTEXT | D-02         | Button on CreateExercise edit + comparison modal | 01   | COVERED | Task 2
CONTEXT | D-03         | Catalog/presets/journal remap; stats derived     | 01   | COVERED | Tasks 1–3
CONTEXT | D-04         | Keep target metadata                             | 01   | COVERED | Tasks 1–2
```
