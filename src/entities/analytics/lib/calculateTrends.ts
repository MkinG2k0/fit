import type { TrainingSessionStat, TrendPoint } from "../model/types";

export const calculateTrends = (sessions: TrainingSessionStat[]): TrendPoint[] => {
  return sessions.map((session) => {
    const tonnage = session.exercises.reduce(
      (acc, exercise) => acc + exercise.tonnage,
      0,
    );
    const totalReps = session.exercises.reduce(
      (acc, exercise) => acc + exercise.totalReps,
      0,
    );
    const maxWeight = session.exercises.reduce(
      (acc, exercise) => Math.max(acc, exercise.maxWeight),
      0,
    );

    return {
      date: session.dateKey,
      tonnage,
      totalReps,
      maxWeight,
      sessions: session.exercises.length,
    };
  });
};

export const calculateExerciseTonnageTrend = (
  sessions: TrainingSessionStat[],
  exerciseRef: string,
) => {
  const normalizedRef = exerciseRef.trim().toLowerCase();
  return sessions
    .map((session) => {
      const tonnage = session.exercises
        .filter(
          (exercise) =>
            exercise.id === exerciseRef ||
            exercise.name.trim().toLowerCase() === normalizedRef,
        )
        .reduce((acc, exercise) => acc + exercise.tonnage, 0);
      return {
        date: session.dateKey,
        tonnage,
      };
    })
    .filter((point) => point.tonnage > 0);
};

