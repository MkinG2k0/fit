import type { CatalogExercise, ExerciseCategory } from "../model/types";

export const findCatalogExerciseByName = (
  categories: ExerciseCategory[],
  exerciseName: string,
): CatalogExercise | undefined => {
  const target = exerciseName.trim().toLowerCase();
  if (!target) {
    return undefined;
  }

  for (const group of categories) {
    const found = group.exercises.find(
      (exercise) => exercise.name.trim().toLowerCase() === target,
    );
    if (found) {
      return found;
    }
  }

  return undefined;
};

export const categoryContainsExerciseName = (
  group: ExerciseCategory,
  exerciseName: string,
): boolean => {
  const target = exerciseName.trim().toLowerCase();
  if (!target) {
    return false;
  }

  return group.exercises.some(
    (exercise) => exercise.name.trim().toLowerCase() === target,
  );
};
