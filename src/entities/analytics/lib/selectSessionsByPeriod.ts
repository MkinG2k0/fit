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
  const { start, end } = getPeriodDateRange(period, baseDate);

  return sessions.filter((session) => isInRange(session.dateKey, start, end));
};

export const selectPreviousSessionsByPeriod = (
  sessions: TrainingSessionStat[],
  period: AnalyticsPeriod,
  baseDate = dayjs(),
) => {
  const { start: currentStartDate } = getPeriodDateRange(period, baseDate);
  const periodInDays = PERIOD_TO_DAYS[period];
  const previousEndDate = currentStartDate.subtract(1, "day").endOf("day");
  const previousStartDate = previousEndDate
    .subtract(periodInDays - 1, "day")
    .startOf("day");

  return sessions.filter((session) =>
    isInRange(session.dateKey, previousStartDate, previousEndDate),
  );
};
