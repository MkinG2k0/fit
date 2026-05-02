import type { CatalogExercise, ExerciseCategory } from "../model/types";
import {
  extractLegacyCatalogNamePart,
  normalizeLegacyCatalogName,
} from "./exerciseIds";

export const findCatalogExerciseById = (
  categories: ExerciseCategory[],
  exerciseId: string,
): CatalogExercise | undefined => {
  const target = exerciseId.trim();
  if (!target) {
    return undefined;
  }

  for (const group of categories) {
    const found = group.exercises.find((exercise) => exercise.id === target);
    if (found) {
      return found;
    }
  }

  const legacyNamePart = extractLegacyCatalogNamePart(target);
  if (!legacyNamePart) {
    return undefined;
  }

  for (const group of categories) {
    const found = group.exercises.find(
      (exercise) => normalizeLegacyCatalogName(exercise.name) === legacyNamePart,
    );
    if (found) {
      return found;
    }
  }

  return undefined;
};

export const findExerciseCategoryById = (
  categories: ExerciseCategory[],
  categoryId: string,
): ExerciseCategory | undefined => {
  const target = categoryId.trim();
  if (!target) {
    return undefined;
  }
  return categories.find((group) => group.id === target);
};
