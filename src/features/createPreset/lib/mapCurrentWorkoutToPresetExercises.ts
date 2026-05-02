import type { Exercise } from "@/entities/exercise";

export const mapCurrentWorkoutToPresetExercises = (
  currentWorkoutExercises: Exercise[],
): string[] => {
  const selectedExercises: string[] = [];
  const normalizedSelectedExercises = new Set<string>();

  currentWorkoutExercises.forEach((exercise) => {
    const catalogExerciseId = exercise.catalogExerciseId?.trim();
    if (!catalogExerciseId) {
      return;
    }
    if (normalizedSelectedExercises.has(catalogExerciseId)) {
      return;
    }

    normalizedSelectedExercises.add(catalogExerciseId);
    selectedExercises.push(catalogExerciseId);
  });

  return selectedExercises;
};
