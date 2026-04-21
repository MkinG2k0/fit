import type { Exercise, ExerciseCategory } from "@/entities/exercise";

export const mapCurrentWorkoutToPresetExercises = (
  currentWorkoutExercises: Exercise[],
  catalogExercises: ExerciseCategory[],
): string[] => {
  const normalizedCatalogExerciseMap = new Map<string, string>();

  catalogExercises.forEach((group) => {
    group.exercises.forEach((exercise) => {
      const normalizedExerciseName = exercise.name.trim().toLowerCase();
      if (!normalizedExerciseName) {
        return;
      }

      if (!normalizedCatalogExerciseMap.has(normalizedExerciseName)) {
        normalizedCatalogExerciseMap.set(normalizedExerciseName, exercise.name);
      }
    });
  });

  const selectedExercises: string[] = [];
  const normalizedSelectedExercises = new Set<string>();

  currentWorkoutExercises.forEach((exercise) => {
    const normalizedExerciseName = exercise.name.trim().toLowerCase();
    if (!normalizedExerciseName) {
      return;
    }

    const catalogExerciseName =
      normalizedCatalogExerciseMap.get(normalizedExerciseName);
    if (!catalogExerciseName) {
      return;
    }

    if (normalizedSelectedExercises.has(normalizedExerciseName)) {
      return;
    }

    normalizedSelectedExercises.add(normalizedExerciseName);
    selectedExercises.push(catalogExerciseName);
  });

  return selectedExercises;
};
