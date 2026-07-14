import { LOAD_TABLE_SCHEDULE } from "../model/schedule";
import { roundToHalfKg } from "./roundToHalfKg";

const PLAN_SET_COUNT = 3;
const MIN_WEEK = 1;
const MAX_WEEK = 16;

export interface PlanSetValues {
  weight: number;
  reps: number;
}

/** Ровно 3 одинаковых плановых подхода для недели × maxKg. */
export const getPlanSetsForWeek = (
  maxKg: number,
  week: number,
): PlanSetValues[] => {
  const clampedWeek = Math.min(
    MAX_WEEK,
    Math.max(MIN_WEEK, Math.round(week)),
  );
  const scheduleRow =
    LOAD_TABLE_SCHEDULE.find((row) => row.week === clampedWeek) ??
    LOAD_TABLE_SCHEDULE[0]!;

  const safeMaxKg = Number.isFinite(maxKg) && maxKg > 0 ? maxKg : 0;
  const weight = roundToHalfKg((safeMaxKg * scheduleRow.percent) / 100);
  const reps = scheduleRow.reps;

  return Array.from({ length: PLAN_SET_COUNT }, () => ({ weight, reps }));
};
