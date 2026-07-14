import type { LoadTableScheduleWeek } from "./types";

/** Fixed 16-week percent/reps template from Жим.xlsx (D-03). */
export const LOAD_TABLE_SCHEDULE: readonly LoadTableScheduleWeek[] = [
  { week: 1, percent: 75, reps: 5 },
  { week: 2, percent: 78, reps: 5 },
  { week: 3, percent: 82, reps: 5 },
  { week: 4, percent: 85, reps: 5 },
  { week: 5, percent: 88, reps: 3 },
  { week: 6, percent: 92, reps: 3 },
  { week: 7, percent: 95, reps: 2 },
  { week: 8, percent: 98, reps: 2 },
  { week: 9, percent: 82, reps: 5 },
  { week: 10, percent: 85, reps: 5 },
  { week: 11, percent: 88, reps: 5 },
  { week: 12, percent: 92, reps: 5 },
  { week: 13, percent: 95, reps: 3 },
  { week: 14, percent: 98, reps: 3 },
  { week: 15, percent: 102, reps: 2 },
  { week: 16, percent: 105, reps: 2 },
] as const;
