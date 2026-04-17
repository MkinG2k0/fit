import {
  defaultIconIdForCategory,
  normalizeExerciseIconId,
} from "../model/exerciseIcons";
import type { CatalogExercise, ExerciseCategory } from "../model/types";

const normalizeCatalogEntry = (
  raw: unknown,
  category: string,
): CatalogExercise => {
  if (typeof raw === "string") {
    return { name: raw, iconId: defaultIconIdForCategory(category) };
  }

  if (raw && typeof raw === "object" && "name" in raw) {
    const name = String((raw as { name: unknown }).name);
    const iconRaw = (raw as { iconId?: unknown }).iconId;

    return { name, iconId: normalizeExerciseIconId(iconRaw) };
  }

  return { name: "", iconId: defaultIconIdForCategory(category) };
};

export const normalizeExerciseCategories = (
  categories: unknown,
): ExerciseCategory[] => {
  if (!Array.isArray(categories)) {
    return [];
  }

  return categories.map((group) => {
    if (!group || typeof group !== "object" || !("category" in group)) {
      return { category: "", exercises: [] };
    }

    const category = String((group as { category: unknown }).category);
    const rawExercises = (group as { exercises?: unknown }).exercises;
    const exercisesList = Array.isArray(rawExercises) ? rawExercises : [];

    return {
      category,
      exercises: exercisesList.map((entry) =>
        normalizeCatalogEntry(entry, category),
      ),
    };
  });
};
