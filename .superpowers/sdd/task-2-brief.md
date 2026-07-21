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

