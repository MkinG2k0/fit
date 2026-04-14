import type {
  ExerciseAnalyticsSummary,
  FrequencyMetrics,
  RepMetrics,
  TrainingSessionStat,
  VolumeMetrics,
  WeightMetrics,
} from "../model/types";
import { compareDateKeysAsc, parseDateKey } from "./dateKey";

const EMPTY_VOLUME: VolumeMetrics = {
  totalTonnage: 0,
  averageTonnagePerTrainingDay: 0,
  bestDayTonnage: 0,
};

const EMPTY_WEIGHT: WeightMetrics = {
  maxWeight: 0,
  averageWorkingWeight: 0,
};

const EMPTY_REPS: RepMetrics = {
  totalReps: 0,
  averageRepsPerSet: 0,
  bestSetReps: 0,
};

const EMPTY_FREQUENCY: FrequencyMetrics = {
  trainingDays: 0,
  totalSessions: 0,
  averageSessionsPerWeek: 0,
  currentStreakDays: 0,
};

const getCurrentStreakDays = (sortedDateKeys: string[]) => {
  if (sortedDateKeys.length === 0) {
    return 0;
  }

  const daysSet = new Set(sortedDateKeys);
  let streak = 0;
  let cursorDate = parseDateKey(sortedDateKeys[sortedDateKeys.length - 1]);
  while (cursorDate && daysSet.has(cursorDate.format("DD-MM-YYYY"))) {
    streak += 1;
    cursorDate = cursorDate.subtract(1, "day");
  }

  return streak;
};

const getSetsFromSession = (session: TrainingSessionStat) => {
  return session.exercises.map((exercise) => ({
    reps: exercise.totalReps,
    weight: exercise.maxWeight,
  }));
};

export const calculateSummaryMetrics = (
  sessions: TrainingSessionStat[],
): ExerciseAnalyticsSummary => {
  if (sessions.length === 0) {
    return {
      volume: EMPTY_VOLUME,
      weight: EMPTY_WEIGHT,
      reps: EMPTY_REPS,
      frequency: EMPTY_FREQUENCY,
    };
  }

  const dailyTonnage = sessions.map((session) =>
    session.exercises.reduce((acc, exercise) => acc + exercise.tonnage, 0),
  );
  const totalTonnage = dailyTonnage.reduce((acc, value) => acc + value, 0);
  const bestDayTonnage = dailyTonnage.reduce((acc, value) => Math.max(acc, value), 0);
  const averageTonnagePerTrainingDay = totalTonnage / sessions.length;

  const allSets = sessions.flatMap((session) => getSetsFromSession(session));
  const maxWeight = allSets.reduce((acc, set) => Math.max(acc, set.weight), 0);
  const totalReps = allSets.reduce((acc, set) => acc + set.reps, 0);
  const bestSetReps = allSets.reduce((acc, set) => Math.max(acc, set.reps), 0);
  const averageRepsPerSet = allSets.length > 0 ? totalReps / allSets.length : 0;
  const totalWorkingWeight = allSets.reduce((acc, set) => acc + set.weight, 0);
  const averageWorkingWeight =
    allSets.length > 0 ? totalWorkingWeight / allSets.length : 0;

  const sortedDateKeys = sessions
    .map((session) => session.dateKey)
    .sort(compareDateKeysAsc);
  const firstDate = parseDateKey(sortedDateKeys[0]);
  const lastDate = parseDateKey(sortedDateKeys[sortedDateKeys.length - 1]);
  const weekSpan =
    firstDate && lastDate
      ? Math.max(1, Math.ceil(lastDate.diff(firstDate, "day") / 7) + 1)
      : 1;
  const totalSessions = sessions.reduce(
    (acc, session) => acc + session.exercises.length,
    0,
  );

  return {
    volume: {
      totalTonnage,
      averageTonnagePerTrainingDay,
      bestDayTonnage,
    },
    weight: {
      maxWeight,
      averageWorkingWeight,
    },
    reps: {
      totalReps,
      averageRepsPerSet,
      bestSetReps,
    },
    frequency: {
      trainingDays: sessions.length,
      totalSessions,
      averageSessionsPerWeek: totalSessions / weekSpan,
      currentStreakDays: getCurrentStreakDays(sortedDateKeys),
    },
  };
};

