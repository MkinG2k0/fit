import type { CalendarDay } from "@/entities/calendarDay";
import type { Exercise } from "../model/types";

export interface ExerciseMergeStats {
  totalReps: number;
  sessionCount: number;
  setCount: number;
}

const resolveCatalogId = (exercise: Exercise): string =>
  exercise.catalogExerciseId ?? exercise.id;

/**
 * Считает агрегаты по журналу для каталожного id:
 * totalReps / sessionCount (дней с подходами) / setCount.
 */
export const computeExerciseMergeStats = (
  days: Record<string, CalendarDay>,
  catalogExerciseId: string,
): ExerciseMergeStats => {
  let totalReps = 0;
  let setCount = 0;
  let sessionCount = 0;

  for (const day of Object.values(days)) {
    let dayHasMatch = false;
    for (const exercise of day.exercises) {
      if (resolveCatalogId(exercise) !== catalogExerciseId) {
        continue;
      }
      dayHasMatch = true;
      for (const set of exercise.sets) {
        totalReps += set.reps;
        setCount += 1;
      }
    }
    if (dayHasMatch) {
      sessionCount += 1;
    }
  }

  return { totalReps, sessionCount, setCount };
};
