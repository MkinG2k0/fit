import type { CalendarDay } from "@/entities/calendarDay";
import type {
  AnalyticsFilters,
  ExerciseSessionStat,
  TrainingSessionStat,
} from "../model/types";
import { compareDateKeysAsc } from "./dateKey";

const calculateExerciseSessionStat = (
  exerciseId: string,
  exerciseName: string,
  category: string,
  sets: { weight: number; reps: number }[],
): ExerciseSessionStat => {
  const totalReps = sets.reduce((acc, set) => acc + set.reps, 0);
  const tonnage = sets.reduce((acc, set) => acc + set.weight * set.reps, 0);
  const maxWeight = sets.reduce((acc, set) => Math.max(acc, set.weight), 0);

  return {
    id: exerciseId,
    name: exerciseName,
    category,
    tonnage,
    totalReps,
    maxWeight,
  };
};

const isExerciseMatched = (
  exerciseName: string,
  category: string,
  filters: AnalyticsFilters,
) => {
  const matchesExercise =
    filters.exerciseName.length === 0 ||
    exerciseName.toLowerCase().includes(filters.exerciseName.toLowerCase());
  const matchesCategory =
    filters.category.length === 0 ||
    category.toLowerCase().includes(filters.category.toLowerCase());

  return matchesExercise && matchesCategory;
};

export const normalizeTrainingSessions = (
  days: Record<string, CalendarDay>,
  filters: AnalyticsFilters,
): TrainingSessionStat[] => {
  return Object.entries(days)
    .map(([dateKey, day]) => {
      const normalizedExercises = day.exercises
        .filter((exercise) =>
          isExerciseMatched(exercise.name, exercise.category, filters),
        )
        .map((exercise) =>
          calculateExerciseSessionStat(
            exercise.id,
            exercise.name,
            exercise.category,
            exercise.sets,
          ),
        )
        .filter((exercise) => exercise.tonnage > 0 || exercise.totalReps > 0);

      return {
        dateKey,
        exercises: normalizedExercises,
      };
    })
    .filter((session) => session.exercises.length > 0)
    .sort((left, right) => compareDateKeysAsc(left.dateKey, right.dateKey));
};

