import { useMemo } from "react";
import type { Exercise, ExerciseCategory } from "../model/types";
import { useExerciseStore } from "../slice/exerciseStore";

/** Builds O(1) lookup of live catalog names by catalog exercise id. */
export const buildCatalogNameById = (
  categories: ExerciseCategory[],
): Map<string, string> => {
  const nameById = new Map<string, string>();
  for (const group of categories) {
    for (const catalogExercise of group.exercises) {
      nameById.set(catalogExercise.id, catalogExercise.name);
    }
  }
  return nameById;
};

/**
 * Live catalog name when id is present in the map; otherwise denormalized
 * day snapshot (`exercise.name`) for orphan / deleted / legacy entries.
 */
export const resolveWorkoutExerciseDisplayName = (
  exercise: Pick<Exercise, "name" | "catalogExerciseId">,
  nameById: ReadonlyMap<string, string>,
): string => {
  const id = exercise.catalogExerciseId?.trim() ?? "";
  if (id && nameById.has(id)) {
    return nameById.get(id)!;
  }
  return exercise.name;
};

/** Shared Map derivation from the exercise catalog store. */
export const useCatalogNameById = (): Map<string, string> => {
  const categories = useExerciseStore((s) => s.exercises);
  return useMemo(() => buildCatalogNameById(categories), [categories]);
};
