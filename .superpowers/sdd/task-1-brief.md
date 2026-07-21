### Task 1: History summary builder

**Files:**
- Create: `src/features/profileRingGoalsSettings/lib/ringGoalsAiConstants.ts`
- Create: `src/features/profileRingGoalsSettings/lib/buildRingGoalsHistorySummary.ts`

**Interfaces:**
- Consumes: `CalendarDay` from `@/entities/calendarDay`, `calcSetVolumeKg` from `@/shared/lib/calcSetVolumeKg`, dayjs + `customParseFormat`
- Produces:
  - `export const RING_GOALS_AI_HISTORY_DAYS = 90`
  - `export interface RingGoalsHistorySummary { trainingDays: number; meanSetCount: number; medianSetCount: number; p75SetCount: number; bestSetCount: number; meanVolume: number; medianVolume: number; p75Volume: number; bestVolume: number; }`
  - `export const buildRingGoalsHistorySummary = (days: Record<string, CalendarDay>, now?: dayjs.Dayjs) => RingGoalsHistorySummary`

- [ ] **Step 1: Add constants file**

```ts
/** РљР°Р»РµРЅРґР°СЂРЅРѕРµ РѕРєРЅРѕ РёСЃС‚РѕСЂРёРё РґР»СЏ РР-С†РµР»Рё РєРѕР»РµС† (РІРєР»СЋС‡Р°СЏ СЃРµРіРѕРґРЅСЏ). */
export const RING_GOALS_AI_HISTORY_DAYS = 90;
```

- [ ] **Step 2: Implement summary builder**

```ts
import dayjs, { type Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import type { CalendarDay } from "@/entities/calendarDay";
import { calcSetVolumeKg } from "@/shared/lib/calcSetVolumeKg";
import { RING_GOALS_AI_HISTORY_DAYS } from "./ringGoalsAiConstants";

dayjs.extend(customParseFormat);

const DAY_KEY_FORMAT = "DD-MM-YYYY";

export interface RingGoalsHistorySummary {
  trainingDays: number;
  meanSetCount: number;
  medianSetCount: number;
  p75SetCount: number;
  bestSetCount: number;
  meanVolume: number;
  medianVolume: number;
  p75Volume: number;
  bestVolume: number;
}

interface DayTotals {
  setCount: number;
  volume: number;
}

const isLoggedSet = (weight: number, reps: number) =>
  reps > 0 || weight > 0;

const getDayTotals = (day: CalendarDay): DayTotals | null => {
  let setCount = 0;
  let volume = 0;
  for (const exercise of day.exercises) {
    for (const set of exercise.sets) {
      if (!isLoggedSet(set.weight, set.reps)) {
        continue;
      }
      setCount += 1;
      volume += calcSetVolumeKg(set.weight, set.reps);
    }
  }
  if (setCount === 0 && volume === 0) {
    return null;
  }
  return { setCount, volume };
};

const average = (values: number[]) =>
  values.length === 0
    ? 0
    : values.reduce((acc, value) => acc + value, 0) / values.length;

/** Inclusive percentile on sorted ascending copy (nearest-rank). */
const percentile = (sortedAsc: number[], p: number) => {
  if (sortedAsc.length === 0) {
    return 0;
  }
  const rank = Math.ceil((p / 100) * sortedAsc.length) - 1;
  const index = Math.min(sortedAsc.length - 1, Math.max(0, rank));
  return sortedAsc[index] ?? 0;
};

const median = (sortedAsc: number[]) => {
  if (sortedAsc.length === 0) {
    return 0;
  }
  const mid = Math.floor(sortedAsc.length / 2);
  if (sortedAsc.length % 2 === 0) {
    return ((sortedAsc[mid - 1] ?? 0) + (sortedAsc[mid] ?? 0)) / 2;
  }
  return sortedAsc[mid] ?? 0;
};

export const buildRingGoalsHistorySummary = (
  days: Record<string, CalendarDay>,
  now: Dayjs = dayjs(),
): RingGoalsHistorySummary => {
  const end = now.startOf("day");
  const start = end.subtract(RING_GOALS_AI_HISTORY_DAYS - 1, "day");

  const totals: DayTotals[] = [];
  for (const [dateKey, day] of Object.entries(days)) {
    const parsed = dayjs(dateKey, DAY_KEY_FORMAT, true);
    if (!parsed.isValid()) {
      continue;
    }
    const dayStart = parsed.startOf("day");
    if (dayStart.isBefore(start) || dayStart.isAfter(end)) {
      continue;
    }
    const dayTotals = getDayTotals(day);
    if (dayTotals) {
      totals.push(dayTotals);
    }
  }

  const setCounts = totals.map((item) => item.setCount).sort((a, b) => a - b);
  const volumes = totals.map((item) => item.volume).sort((a, b) => a - b);

  return {
    trainingDays: totals.length,
    meanSetCount: average(setCounts),
    medianSetCount: median(setCounts),
    p75SetCount: percentile(setCounts, 75),
    bestSetCount: setCounts.length ? (setCounts[setCounts.length - 1] ?? 0) : 0,
    meanVolume: average(volumes),
    medianVolume: median(volumes),
    p75Volume: percentile(volumes, 75),
    bestVolume: volumes.length ? (volumes[volumes.length - 1] ?? 0) : 0,
  };
};
```

- [ ] **Step 3: Typecheck**

Run: `pnpm exec tsc --noEmit -p tsconfig.app.json`  
Expected: exit 0 (or only pre-existing unrelated errors вЂ” new files must be clean).

- [ ] **Step 4: Commit**

```bash
git add src/features/profileRingGoalsSettings/lib/ringGoalsAiConstants.ts src/features/profileRingGoalsSettings/lib/buildRingGoalsHistorySummary.ts
git commit -m "feat: add ring goals AI history summary"
```

---

