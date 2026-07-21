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

