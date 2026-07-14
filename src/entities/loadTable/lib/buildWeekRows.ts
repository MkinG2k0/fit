import { LOAD_TABLE_SCHEDULE } from "../model/schedule";
import type { LoadTableWeekRow } from "../model/types";
import { oneRepMaxFormulas } from "./oneRepMaxFormulas";
import { roundToHalfKg } from "./roundToHalfKg";

export const buildWeekRows = (maxKg: number): LoadTableWeekRow[] => {
  const safeMaxKg = Number.isFinite(maxKg) && maxKg > 0 ? maxKg : 0;

  return LOAD_TABLE_SCHEDULE.map((week) => {
    const weightKg = roundToHalfKg((safeMaxKg * week.percent) / 100);
    return {
      ...week,
      weightKg,
      formulas: oneRepMaxFormulas(weightKg, week.reps),
    };
  });
};
