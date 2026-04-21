import dayjs from "dayjs";
import type { AnalyticsPeriod, TrainingSessionStat } from "../model/types";
import { parseDateKey } from "./dateKey";

const PERIOD_TO_DAYS: Record<AnalyticsPeriod, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "365d": 365,
};

const isInRange = (targetDateKey: string, startDate: dayjs.Dayjs, endDate: dayjs.Dayjs) => {
  const targetDate = parseDateKey(targetDateKey);
  if (!targetDate) {
    return false;
  }

  return (
    targetDate.valueOf() >= startDate.startOf("day").valueOf() &&
    targetDate.valueOf() <= endDate.endOf("day").valueOf()
  );
};

export const selectSessionsByPeriod = (
  sessions: TrainingSessionStat[],
  period: AnalyticsPeriod,
  baseDate = dayjs(),
) => {
  const periodInDays = PERIOD_TO_DAYS[period];
  const endDate = baseDate.endOf("day");
  const startDate = endDate.subtract(periodInDays - 1, "day").startOf("day");

  return sessions.filter((session) => isInRange(session.dateKey, startDate, endDate));
};

export const selectPreviousSessionsByPeriod = (
  sessions: TrainingSessionStat[],
  period: AnalyticsPeriod,
  baseDate = dayjs(),
) => {
  const periodInDays = PERIOD_TO_DAYS[period];
  const currentStartDate = baseDate
    .endOf("day")
    .subtract(periodInDays - 1, "day")
    .startOf("day");
  const previousEndDate = currentStartDate.subtract(1, "day").endOf("day");
  const previousStartDate = previousEndDate
    .subtract(periodInDays - 1, "day")
    .startOf("day");

  return sessions.filter((session) =>
    isInRange(session.dateKey, previousStartDate, previousEndDate),
  );
};

