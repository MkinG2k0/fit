import dayjs from "dayjs";
import type { AnalyticsPeriod, ExerciseTrendRow, TrainingSessionStat } from "../model/types";

const PERIOD_TO_DAYS: Record<AnalyticsPeriod, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "365d": 365,
};

const getTrendDatesByPeriod = (period: AnalyticsPeriod) => {
  const periodInDays = PERIOD_TO_DAYS[period];
  const endDate = dayjs().endOf("day");

  return Array.from({ length: periodInDays }, (_, index) =>
    endDate.subtract(periodInDays - 1 - index, "day").format("DD-MM-YYYY"),
  );
};

export const calculateExerciseRows = (
  sessions: TrainingSessionStat[],
  period: AnalyticsPeriod,
): ExerciseTrendRow[] => {
  const sortedSessions = [...sessions];
  const trendDates = getTrendDatesByPeriod(period);

  const rowsMap = new Map<
    string,
    {
      id: string;
      name: string;
      sessions: number;
      tonnage: number;
      trendByDate: Map<string, number>;
    }
  >();

  sortedSessions.forEach((session) => {
    session.exercises.forEach((exercise) => {
      if (!rowsMap.has(exercise.name)) {
        rowsMap.set(exercise.name, {
          id: exercise.id || exercise.name,
          name: exercise.name,
          sessions: 0,
          tonnage: 0,
          trendByDate: new Map<string, number>(),
        });
      }
      const row = rowsMap.get(exercise.name);
      if (!row) {
        return;
      }
      row.sessions += 1;
      row.tonnage += exercise.tonnage;
      row.trendByDate.set(
        session.dateKey,
        (row.trendByDate.get(session.dateKey) ?? 0) + exercise.tonnage,
      );
    });
  });

  return Array.from(rowsMap.values())
    .sort((left, right) => right.tonnage - left.tonnage)
    .map((row) => ({
      id: row.id,
      name: row.name,
      sessions: row.sessions,
      tonnage: row.tonnage,
      trend: trendDates.map((dateKey) => ({
        dateKey,
        tonnage: row.trendByDate.get(dateKey) ?? 0,
      })),
    }));
};
