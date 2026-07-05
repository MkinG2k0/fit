import type { CalendarDay } from "@/entities/calendarDay";
import { allExercises } from "@/shared/config/constants";
import { calcSetVolumeKg } from "@/shared/lib/calcSetVolumeKg";
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
  const tonnage = sets.reduce(
    (acc, set) => acc + calcSetVolumeKg(set.weight, set.reps),
    0,
  );
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
  exerciseId: string,
  categoryId: string,
  filters: AnalyticsFilters,
) => {
  const matchesExercise =
    filters.exerciseId.length === 0 || exerciseId === filters.exerciseId;
  const matchesCategory = filters.category.length === 0 || categoryId === filters.category;

  return matchesExercise && matchesCategory;
};

const categoryNameById = new Map(
  allExercises.map((group) => [group.id, group.category] as const),
);

const resolveExerciseCategoryName = (categoryId?: string, legacyCategory?: string) => {
  if (categoryId) {
    return categoryNameById.get(categoryId) ?? legacyCategory ?? "";
  }
  return legacyCategory ?? "";
};

export const normalizeTrainingSessions = (
  days: Record<string, CalendarDay>,
  filters: AnalyticsFilters,
): TrainingSessionStat[] => {
  return Object.entries(days)
    .map(([dateKey, day]) => {
      const normalizedExercises = day.exercises
        .filter((exercise) =>
          isExerciseMatched(
            exercise.catalogExerciseId ?? exercise.id,
            exercise.categoryId ?? "",
            filters,
          ),
        )
        .map((exercise) =>
          calculateExerciseSessionStat(
            exercise.catalogExerciseId ?? exercise.id,
            exercise.name,
            resolveExerciseCategoryName(exercise.categoryId, exercise.category),
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

