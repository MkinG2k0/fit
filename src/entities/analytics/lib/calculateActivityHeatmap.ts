import dayjs from "dayjs";
import type { ActivityHeatmap, AnalyticsPeriod, TrainingSessionStat } from "../model/types";
import { parseDateKey } from "./dateKey";

const PERIOD_TO_DAYS: Record<AnalyticsPeriod, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "365d": 365,
};

const toIntensity = (sessions: number, maxSessions: number): 0 | 1 | 2 | 3 | 4 => {
  if (sessions === 0 || maxSessions === 0) {
    return 0;
  }
  const ratio = sessions / maxSessions;
  if (ratio >= 0.8) {
    return 4;
  }
  if (ratio >= 0.55) {
    return 3;
  }
  if (ratio >= 0.3) {
    return 2;
  }
  return 1;
};

export const calculateActivityHeatmap = (
  sessions: TrainingSessionStat[],
  period: AnalyticsPeriod,
  baseDate = dayjs(),
): ActivityHeatmap => {
  const days = PERIOD_TO_DAYS[period];
  const endDate = baseDate.endOf("day");
  const startDate = endDate.subtract(days - 1, "day").startOf("day");
  const weeks = Math.ceil(days / 7);

  const sessionsByDate = sessions.reduce<Record<string, number>>((acc, session) => {
    const parsedDate = parseDateKey(session.dateKey);
    if (!parsedDate || parsedDate.isBefore(startDate) || parsedDate.isAfter(endDate)) {
      return acc;
    }
    acc[session.dateKey] = (acc[session.dateKey] ?? 0) + session.exercises.length;
    return acc;
  }, {});

  const maxSessions = Object.values(sessionsByDate).reduce(
    (acc, value) => Math.max(acc, value),
    0,
  );

  const cells = Array.from({ length: days }, (_, index) => {
    const date = startDate.add(index, "day");
    const dateKey = date.format("DD-MM-YYYY");
    const sessionsCount = sessionsByDate[dateKey] ?? 0;

    return {
      id: `${dateKey}-${index}`,
      dateKey,
      weekIndex: Math.floor(index / 7),
      dayIndex: (date.day() + 6) % 7,
      sessions: sessionsCount,
      intensity: toIntensity(sessionsCount, maxSessions),
    };
  });

  return {
    weeks,
    cells,
  };
};
