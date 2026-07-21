# Share Stats Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** From Analytics, open a sheet to pick exercise / workout day / period and share a 9:16 PNG progress card via Capacitor Share or web download.

**Architecture:** Extend shared `AnalyticsPeriod` with `180d`. New feature `shareStats` builds a `ShareModel` from local training days (reuse `normalizeTrainingSessions` + `selectSessionsByPeriod` + `calculateSummaryMetrics`), renders an offscreen `ShareCard`, converts it to PNG (`html-to-image`), then shares via `@capacitor/share` / Web Share / download — same native pattern as settings export.

**Tech Stack:** React 19, dayjs, `html-to-image`, `@capacitor/share` + `@capacitor/filesystem`, Tailwind/shadcn Drawer+Button, existing analytics entity helpers.

## Global Constraints

- Package manager: `pnpm` only (never npm/npx).
- Spec: `docs/superpowers/specs/2026-07-21-share-stats-design.md`.
- Output: PNG only; aspect 9:16 (~1080×1920 CSS px for render root).
- Entry: Analytics only (`ShareStatsButton` → sheet).
- Week / `7d`: rolling last 7 calendar days ending today (inclusive), not Mon–Sun.
- Periods: `7d` | `30d` | `90d` | `180d` | `365d`.
- No toast library — show short error text inside the sheet (like settings transfer status).
- Cancelled native share = silent no-op.
- No vitest in repo — verify with `pnpm exec tsc --noEmit -p tsconfig.app.json` + manual smoke.
- Styling: Tailwind tokens; className literals inline in JSX (no CSS modules, no class-string consts); `cva` only if needed for primitives.
- Metrics must use `calcSetVolumeKg` / same session normalization as Analytics.

---

## File Structure

| Path | Role |
| --- | --- |
| `src/entities/analytics/model/types.ts` | Add `180d` to `AnalyticsPeriod` |
| `src/entities/analytics/lib/selectSessionsByPeriod.ts` | `PERIOD_TO_DAYS` + export `getPeriodDayCount` / date-range helper |
| `src/entities/analytics/lib/calculateActivityHeatmap.ts` | Add `180d` to local map |
| `src/entities/analytics/lib/calculateExerciseRows.ts` | Add `180d` to local map |
| `src/entities/analytics/index.ts` | Export new helpers if added |
| `src/features/analyticsFilters/model/types.ts` | Period option label for 180d |
| `src/widgets/analyticsDashboard/ui/AnalyticsPeriodSegmentedControl.tsx` | Show 180d segment |
| `src/features/shareStats/model/types.ts` | Scope / selection / ShareModel |
| `src/features/shareStats/lib/buildShareModel.ts` | Aggregations → card VM |
| `src/features/shareStats/lib/listShareOptions.ts` | Exercise + workout day pick lists |
| `src/features/shareStats/lib/renderShareCardToPng.ts` | DOM → PNG Blob |
| `src/features/shareStats/lib/sharePngFile.ts` | Native/web share + download |
| `src/features/shareStats/ui/ShareCard.tsx` | 9:16 card layouts |
| `src/features/shareStats/ui/ShareStatsSheet.tsx` | Scope UI + preview + share |
| `src/features/shareStats/ui/ShareStatsButton.tsx` | Trigger |
| `src/features/shareStats/index.ts` | Public exports |
| `src/widgets/analyticsDashboard/ui/AnalyticsDashboard.tsx` | Mount share button |
| `src/pages/AnalyticsPage/ui/AnalyticsPage.tsx` | Pass days/period into dashboard if needed |
| `package.json` | Add `html-to-image` |

---

### Task 1: Extend `AnalyticsPeriod` with `180d`

**Files:**
- Modify: `src/entities/analytics/model/types.ts`
- Modify: `src/entities/analytics/lib/selectSessionsByPeriod.ts`
- Modify: `src/entities/analytics/lib/calculateActivityHeatmap.ts`
- Modify: `src/entities/analytics/lib/calculateExerciseRows.ts`
- Modify: `src/features/analyticsFilters/model/types.ts`
- Modify: `src/widgets/analyticsDashboard/ui/AnalyticsPeriodSegmentedControl.tsx`
- Modify: `src/entities/analytics/index.ts` (export helpers)

**Interfaces:**
- Consumes: existing `AnalyticsPeriod` usages
- Produces:
  - `AnalyticsPeriod = "7d" | "30d" | "90d" | "180d" | "365d"`
  - `export const getPeriodDayCount = (period: AnalyticsPeriod): number`
  - `export const getPeriodDateRange = (period: AnalyticsPeriod, baseDate?: Dayjs) => { startDateKey: string; endDateKey: string; start: Dayjs; end: Dayjs }`

- [ ] **Step 1: Update the period union**

In `src/entities/analytics/model/types.ts`:

```ts
export type AnalyticsPeriod = "7d" | "30d" | "90d" | "180d" | "365d";
```

- [ ] **Step 2: Centralize day counts in `selectSessionsByPeriod.ts` and export helpers**

Replace the private map with:

```ts
import dayjs, { type Dayjs } from "dayjs";
import type { AnalyticsPeriod, TrainingSessionStat } from "../model/types";
import { parseDateKey } from "./dateKey";

export const PERIOD_TO_DAYS: Record<AnalyticsPeriod, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "180d": 180,
  "365d": 365,
};

export const getPeriodDayCount = (period: AnalyticsPeriod) => PERIOD_TO_DAYS[period];

export const getPeriodDateRange = (
  period: AnalyticsPeriod,
  baseDate: Dayjs = dayjs(),
) => {
  const periodInDays = PERIOD_TO_DAYS[period];
  const end = baseDate.endOf("day");
  const start = end.subtract(periodInDays - 1, "day").startOf("day");
  return {
    start,
    end,
    startDateKey: start.format("DD-MM-YYYY"),
    endDateKey: end.format("DD-MM-YYYY"),
  };
};
```

Refactor `selectSessionsByPeriod` / `selectPreviousSessionsByPeriod` to use `PERIOD_TO_DAYS` / `getPeriodDateRange` (keep behavior identical except `180d` works).

- [ ] **Step 3: Update duplicated maps**

In `calculateActivityHeatmap.ts` and `calculateExerciseRows.ts`, add `"180d": 180` to each local `PERIOD_TO_DAYS` (keep maps local for this task — do not force a cross-import refactor beyond what TypeScript requires).

- [ ] **Step 4: UI period options**

`src/features/analyticsFilters/model/types.ts` — add `{ value: "180d", label: "180 дней" }` (or `"6 мес"`) between 90d and 365d.

`AnalyticsPeriodSegmentedControl.tsx` — add `{ value: "180d", label: "180д" }` in the same order.

- [ ] **Step 5: Export helpers**

From `src/entities/analytics/index.ts`:

```ts
export {
  selectSessionsByPeriod,
  getPeriodDayCount,
  getPeriodDateRange,
  PERIOD_TO_DAYS,
} from "./lib/selectSessionsByPeriod";
```

(Keep exporting `selectSessionsByPeriod` as today; add the new symbols.)

- [ ] **Step 6: Typecheck**

Run: `pnpm exec tsc --noEmit -p tsconfig.app.json`  
Expected: PASS (fix any exhaustive-switch misses on `AnalyticsPeriod`).

- [ ] **Step 7: Commit**

```bash
git add src/entities/analytics src/features/analyticsFilters/model/types.ts src/widgets/analyticsDashboard/ui/AnalyticsPeriodSegmentedControl.tsx
git commit -m "$(cat <<'EOF'
feat(analytics): add 180d period for share and filters

EOF
)"
```

---

### Task 2: Share model types + builders

**Files:**
- Create: `src/features/shareStats/model/types.ts`
- Create: `src/features/shareStats/lib/listShareOptions.ts`
- Create: `src/features/shareStats/lib/buildShareModel.ts`

**Interfaces:**
- Consumes: `CalendarDay`, `normalizeTrainingSessions`, `selectSessionsByPeriod`, `getPeriodDateRange`, `calculateSummaryMetrics` (import from entity lib path if not exported — prefer exporting `calculateSummaryMetrics` from entity index only if already public; otherwise call `buildDashboardAnalytics` for period scope)
- Produces: types + `listShareExerciseOptions`, `listShareWorkoutDateKeys`, `buildShareModel`

- [ ] **Step 1: Add types**

`src/features/shareStats/model/types.ts`:

```ts
import type { AnalyticsPeriod } from "@/entities/analytics";

export type ShareScope = "exercise" | "workout" | "period";

export type ShareSelection =
  | { scope: "exercise"; exerciseId: string; period: AnalyticsPeriod }
  | { scope: "workout"; dateKey: string }
  | { scope: "period"; period: AnalyticsPeriod };

export interface ShareSparkPoint {
  dateKey: string;
  value: number;
}

export interface ShareExerciseModel {
  kind: "exercise";
  title: string;
  category: string;
  periodLabel: string;
  dateRangeLabel: string;
  maxWeightFrom: number | null;
  maxWeightTo: number;
  tonnageKg: number;
  sessionCount: number;
  sparkline: ShareSparkPoint[];
}

export interface ShareWorkoutExerciseLine {
  name: string;
  setsSummary: string;
  tonnageKg: number;
}

export interface ShareWorkoutModel {
  kind: "workout";
  dateKey: string;
  dateLabel: string;
  exercises: ShareWorkoutExerciseLine[];
  tonnageKg: number;
  exerciseCount: number;
}

export interface SharePeriodTopExercise {
  name: string;
  tonnageKg: number;
}

export interface SharePeriodModel {
  kind: "period";
  periodLabel: string;
  dateRangeLabel: string;
  trainingDays: number;
  tonnageKg: number;
  streakDays: number | null;
  topExercises: SharePeriodTopExercise[];
}

export interface ShareEmptyModel {
  kind: "empty";
  message: string;
}

export type ShareModel =
  | ShareEmptyModel
  | ShareExerciseModel
  | ShareWorkoutModel
  | SharePeriodModel;

export interface ShareExerciseOption {
  id: string;
  name: string;
  category: string;
}

export const SHARE_PERIOD_LABELS: Record<AnalyticsPeriod, string> = {
  "7d": "7 дней",
  "30d": "30 дней",
  "90d": "90 дней",
  "180d": "6 месяцев",
  "365d": "1 год",
};
```

- [ ] **Step 2: Implement pick-list helpers**

`src/features/shareStats/lib/listShareOptions.ts`:

```ts
import type { CalendarDay } from "@/entities/calendarDay";
import {
  normalizeTrainingSessions,
  type AnalyticsFilters,
} from "@/entities/analytics";
import type { ShareExerciseOption } from "../model/types";

const EMPTY_FILTERS: AnalyticsFilters = {
  period: "365d",
  exerciseId: "",
  category: "",
};

export const listShareExerciseOptions = (
  days: Record<string, CalendarDay>,
): ShareExerciseOption[] => {
  const sessions = normalizeTrainingSessions(days, EMPTY_FILTERS);
  const byId = new Map<string, ShareExerciseOption>();
  for (const session of sessions) {
    for (const exercise of session.exercises) {
      if (!byId.has(exercise.id)) {
        byId.set(exercise.id, {
          id: exercise.id,
          name: exercise.name,
          category: exercise.category,
        });
      }
    }
  }
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name, "ru"));
};

export const listShareWorkoutDateKeys = (
  days: Record<string, CalendarDay>,
): string[] => {
  const sessions = normalizeTrainingSessions(days, EMPTY_FILTERS);
  return sessions
    .filter((session) => session.exercises.length > 0)
    .map((session) => session.dateKey)
    .sort((a, b) => compareDateKeysAsc(b, a)); // newest first
};
```

Import `compareDateKeysAsc` from `@/entities/analytics/lib/dateKey` (or re-export it from the analytics barrel if you prefer a public path).

- [ ] **Step 3: Implement `buildShareModel`**

`src/features/shareStats/lib/buildShareModel.ts` — behavior:

1. `normalizeTrainingSessions(days, { period, exerciseId: "", category: "" })` then filter by selection.
2. **exercise:** `selectSessionsByPeriod` for `selection.period`, keep only matching `exercise.id`; if no sessions → empty.  
   - `maxWeightFrom` = first session’s `maxWeight` (chronological), `maxWeightTo` = last; if one session, `maxWeightFrom = null`.  
   - `tonnageKg` = sum of exercise tonnage in window.  
   - `sparkline` = `{ dateKey, value: maxWeight }` per session ascending.  
   - Labels via `SHARE_PERIOD_LABELS` + `getPeriodDateRange`.
3. **workout:** find session by `dateKey`; if missing/empty → empty.  
   - For each exercise, `setsSummary` from raw `CalendarDay` sets: `${sets.length}×${reps}` modal or `N подх.` — prefer: if all sets share same reps and weight, `NxR @ Wкг`, else `${sets.length} подх.`.  
   - Use `calcSetVolumeKg` for day tonnage from raw sets.
4. **period:** `selectSessionsByPeriod` + reuse summary from `buildDashboardAnalytics(days, { period, exerciseId: "", category: "" })` for `trainingDays`, `totalTonnage`, `currentStreakDays` (set `streakDays` only if `> 0`, else `null`). Top 3 exercises by tonnage across sessions in window.
5. Empty message: `"Недостаточно данных"`.

Export:

```ts
export const buildShareModel = (
  days: Record<string, CalendarDay>,
  selection: ShareSelection,
  baseDate?: Dayjs,
): ShareModel
```

- [ ] **Step 4: Typecheck**

Run: `pnpm exec tsc --noEmit -p tsconfig.app.json`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/shareStats
git commit -m "$(cat <<'EOF'
feat(shareStats): add share model builders for exercise, workout, period

EOF
)"
```

---

### Task 3: PNG render + share helpers

**Files:**
- Create: `src/features/shareStats/lib/renderShareCardToPng.ts`
- Create: `src/features/shareStats/lib/sharePngFile.ts`
- Modify: `package.json` / lockfile via `pnpm add`

**Interfaces:**
- Consumes: `html-to-image`, Capacitor Share/Filesystem (same cancel detection as `downloadTextFile`)
- Produces:
  - `renderShareCardToPng(element: HTMLElement): Promise<Blob>`
  - `sharePngFile(filename: string, blob: Blob): Promise<"native-share" | "native-cancelled" | "web-share" | "browser-download">`

- [ ] **Step 1: Install dependency**

```bash
pnpm add html-to-image
```

- [ ] **Step 2: Render helper**

```ts
import { toBlob } from "html-to-image";

export const renderShareCardToPng = async (
  element: HTMLElement,
): Promise<Blob> => {
  const blob = await toBlob(element, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: undefined,
  });
  if (!blob) {
    throw new Error("Не удалось создать изображение.");
  }
  return blob;
};
```

- [ ] **Step 3: Share helper**

Mirror `downloadTextFile` but for binary PNG:

- Native: write base64 to `Directory.Cache` via `Filesystem.writeFile`, then `Share.share({ title, url: uri, dialogTitle })`. Detect cancel tokens `cancel|canceled|cancelled`.
- Web: if `navigator.canShare?.({ files: [file] })`, `navigator.share({ files: [file], title: "Fit" })`; else create object URL + `<a download>`.

```ts
export type SharePngResult =
  | "native-share"
  | "native-cancelled"
  | "web-share"
  | "browser-download";

export const sharePngFile = async (
  filename: string,
  blob: Blob,
): Promise<SharePngResult> => { /* ... */ };
```

Convert blob → base64 for Capacitor Filesystem (FileReader or `arrayBuffer` + btoa chunk loop).

- [ ] **Step 4: Typecheck**

Run: `pnpm exec tsc --noEmit -p tsconfig.app.json`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml src/features/shareStats/lib/renderShareCardToPng.ts src/features/shareStats/lib/sharePngFile.ts
git commit -m "$(cat <<'EOF'
feat(shareStats): add PNG render and native/web share helpers

EOF
)"
```

---

### Task 4: `ShareCard` UI

**Files:**
- Create: `src/features/shareStats/ui/ShareCard.tsx`

**Interfaces:**
- Consumes: `ShareModel`, `formatTonnageParts`
- Produces: `ShareCard` with `forwardRef` or `ref` on the root 9:16 node for capture

- [ ] **Step 1: Implement card shell**

Root:

```tsx
<div
  ref={ref}
  className="flex h-[1920px] w-[1080px] flex-col bg-background p-16 text-foreground"
>
  <p className="text-4xl font-extrabold tracking-tight">Fit</p>
  {/* scope body */}
</div>
```

- `kind === "empty"` → centered muted message.
- `exercise` → title, category, period/range, max weight from→to, tonnage, session count, simple SVG polyline sparkline from `sparkline` values (no recharts — keep capture reliable).
- `workout` → date, list of exercises + setsSummary, totals.
- `period` → KPIs + top 3 list.

Use design tokens only (`bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, `text-primary` as needed).

Props:

```ts
interface ShareCardProps {
  model: ShareModel;
  className?: string;
}
```

Export `ShareCard` with `React.forwardRef<HTMLDivElement, ShareCardProps>`.

- [ ] **Step 2: Typecheck**

Run: `pnpm exec tsc --noEmit -p tsconfig.app.json`  
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/features/shareStats/ui/ShareCard.tsx
git commit -m "$(cat <<'EOF'
feat(shareStats): add 9:16 ShareCard layouts

EOF
)"
```

---

### Task 5: Sheet + Analytics entry point

**Files:**
- Create: `src/features/shareStats/ui/ShareStatsSheet.tsx`
- Create: `src/features/shareStats/ui/ShareStatsButton.tsx`
- Create: `src/features/shareStats/index.ts`
- Modify: `src/widgets/analyticsDashboard/ui/AnalyticsDashboard.tsx`
- Modify: `src/pages/AnalyticsPage/ui/AnalyticsPage.tsx` (pass `allTrainingDays` + open state if cleaner)

**Interfaces:**
- Consumes: builders, ShareCard, render/share helpers, Drawer from shadcn (`vaul`), Button
- Produces: exported `ShareStatsButton` / sheet wired on Analytics

- [ ] **Step 1: Sheet behavior**

`ShareStatsSheet` props:

```ts
interface ShareStatsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  days: Record<string, CalendarDay>;
  defaultPeriod: AnalyticsPeriod;
}
```

State: `scope`, `exerciseId`, `workoutDateKey`, `period`, `status: null | { variant: "error"; text: string }`, `isSharing`.

On open / days change: initialize `period = defaultPeriod`, first exercise option, first workout date key.

Preview: `buildShareModel(days, selection)` → scaled-down wrapper:

```tsx
<div className="mx-auto max-h-[50vh] overflow-auto">
  <div className="origin-top scale-[0.28]">
    <ShareCard ref={cardRef} model={model} />
  </div>
</div>
```

Keep a second offscreen absolute `ShareCard` at full size (`pointer-events-none fixed left-[-10000px] top-0`) for capture — or capture the scaled one only if `html-to-image` quality is acceptable; **prefer offscreen full-size node** for crisp PNG.

Share button disabled when `model.kind === "empty"` or `isSharing`.

On share click:

```ts
try {
  const node = cardRef.current;
  if (!node) throw new Error("Карточка не готова.");
  const blob = await renderShareCardToPng(node);
  const result = await sharePngFile(`fit-share-${Date.now()}.png`, blob);
  if (result === "native-cancelled") return;
} catch (error) {
  setStatus({
    variant: "error",
    text: error instanceof Error ? error.message : "Не удалось поделиться.",
  });
}
```

UI controls: segmented scope; period segmented when scope is exercise or period; select/list for exercise and workout date.

- [ ] **Step 2: Button + barrel**

```ts
// ShareStatsButton.tsx — Button with Share2 icon, opens sheet
// index.ts
export { ShareStatsButton } from "./ui/ShareStatsButton";
export { ShareStatsSheet } from "./ui/ShareStatsSheet";
```

`ShareStatsButton` can own open state and accept `days` + `defaultPeriod`.

- [ ] **Step 3: Wire Analytics**

In `AnalyticsDashboard` (or page header above dashboard): render

```tsx
<ShareStatsButton days={days} defaultPeriod={period} />
```

Extend props:

```ts
interface AnalyticsDashboardProps {
  // existing...
  days: Record<string, CalendarDay>;
}
```

Pass `allTrainingDays` from `AnalyticsPage`.

Place the button near the hero / period control (top of dashboard section) so it’s visible even when trends exist. If empty analytics state, still show share (sheet can empty-state).

- [ ] **Step 4: Typecheck + smoke**

Run: `pnpm exec tsc --noEmit -p tsconfig.app.json`  
Expected: PASS.

Manual smoke:
1. Analytics → Поделиться → Период 30д → preview KPIs → share/download PNG.
2. Scope Упражнение with data → weight from→to visible.
3. Scope Тренировка → day list → PNG.
4. Empty history → disabled share + «Недостаточно данных».
5. (Native if available) cancel share → no error banner.

- [ ] **Step 5: Commit**

```bash
git add src/features/shareStats src/widgets/analyticsDashboard src/pages/AnalyticsPage
git commit -m "$(cat <<'EOF'
feat(shareStats): wire share sheet on Analytics

EOF
)"
```

---

## Spec coverage checklist

| Spec item | Task |
| --- | --- |
| PNG 9:16 image share | 3, 4, 5 |
| Analytics-only entry | 5 |
| Scopes exercise / workout / period | 2, 5 |
| Rolling `7d` | 1 (existing selectSessions) + 2 |
| `180d` period | 1 |
| Card metrics per scope | 2, 4 |
| Capacitor Share + web fallback | 3 |
| Empty + cancel + error UX | 5 |
| No StatisticCard entry / no text share | out of scope (non-goals) |

## Self-review notes

- Fixed exercise scope to always include period in selection (spec § flow).
- Streak only when `> 0` to avoid noisy zeros.
- No toast dependency — sheet status line.
- `PERIOD_TO_DAYS` duplicated maps updated in Task 1 for type exhaustiveness.
