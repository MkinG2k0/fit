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

export interface ExerciseTonnageTrendRef {
  catalogExerciseId?: string;
  exerciseName: string;
}

const isExerciseTonnageMatch = (
  exercise: TrainingSessionStat["exercises"][number],
  refs: ExerciseTonnageTrendRef,
) => {
  const catalogExerciseId = refs.catalogExerciseId?.trim();
  if (catalogExerciseId && exercise.id === catalogExerciseId) {
    return true;
  }

  const normalizedName = refs.exerciseName.trim().toLowerCase();
  return (
    normalizedName.length > 0 &&
    exercise.name.trim().toLowerCase() === normalizedName
  );
};

export const calculateExerciseTonnageTrend = (
  sessions: TrainingSessionStat[],
  refs: ExerciseTonnageTrendRef,
) => {
  return sessions
    .map((session) => {
      const matchedExercises = session.exercises.filter((exercise) =>
        isExerciseTonnageMatch(exercise, refs),
      );
      const tonnage = matchedExercises.reduce(
        (acc, exercise) => acc + exercise.tonnage,
        0,
      );
      const maxWeight = matchedExercises.reduce(
        (acc, exercise) => Math.max(acc, exercise.maxWeight),
        0,
      );
      return {
        date: session.dateKey,
        tonnage,
        maxWeight,
      };
    })
    .filter((point) => point.tonnage > 0);
};

