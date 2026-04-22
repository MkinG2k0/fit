import { allExercises } from "@/shared/config/constants";
import {
  defaultIconIdForCategory,
  normalizeExerciseIconId,
  type ExerciseIconId,
} from "../model/exerciseIcons";
import type { CatalogExercise, ExerciseCategory } from "../model/types";

const BUILTIN_ICON_KEY_SEPARATOR = "\u0000";

const buildBuiltinExerciseIconMap = (): ReadonlyMap<
  string,
  ExerciseIconId
> => {
  const map = new Map<string, ExerciseIconId>();

  for (const group of allExercises) {
    const categoryKey = group.category.trim().toLowerCase();

    for (const exercise of group.exercises) {
      const nameKey = exercise.name.trim().toLowerCase();

      map.set(
        `${categoryKey}${BUILTIN_ICON_KEY_SEPARATOR}${nameKey}`,
        exercise.iconId,
      );
    }
  }

  return map;
};

const builtinExerciseIconKey = (category: string, name: string): string =>
  `${category.trim().toLowerCase()}${BUILTIN_ICON_KEY_SEPARATOR}${name.trim().toLowerCase()}`;

const normalizeCatalogEntry = (
  raw: unknown,
  category: string,
  builtinIcons: ReadonlyMap<string, ExerciseIconId>,
): CatalogExercise => {
  if (typeof raw === "string") {
    const name = raw;

    return {
      name,
      iconId:
        builtinIcons.get(builtinExerciseIconKey(category, name)) ??
        defaultIconIdForCategory(category),
      description: "",
      photoDataUrls: [],
    };
  }

  if (raw && typeof raw === "object" && "name" in raw) {
    const name = String((raw as { name: unknown }).name);
    const iconRaw = (raw as { iconId?: unknown }).iconId;
    const descriptionRaw = (raw as { description?: unknown }).description;
    const photoDataUrlsRaw = (raw as { photoDataUrls?: unknown }).photoDataUrls;
    const photoDataUrlLegacyRaw = (raw as { photoDataUrl?: unknown }).photoDataUrl;
    const description =
      typeof descriptionRaw === "string" ? descriptionRaw.trim() : "";
    const photoDataUrls = Array.isArray(photoDataUrlsRaw)
      ? photoDataUrlsRaw
          .filter((value): value is string => typeof value === "string")
          .map((value) => value.trim())
          .filter((value) => value.length > 0)
      : typeof photoDataUrlLegacyRaw === "string" &&
          photoDataUrlLegacyRaw.trim().length > 0
        ? [photoDataUrlLegacyRaw.trim()]
        : [];
    const fromBuiltin = builtinIcons.get(
      builtinExerciseIconKey(category, name),
    );

    if (fromBuiltin !== undefined) {
      return { name, iconId: fromBuiltin, description, photoDataUrls };
    }

    const iconId =
      iconRaw === undefined
        ? defaultIconIdForCategory(category)
        : normalizeExerciseIconId(iconRaw);

    return { name, iconId, description, photoDataUrls };
  }

  return {
    name: "",
    iconId: defaultIconIdForCategory(category),
    description: "",
    photoDataUrls: [],
  };
};

export const normalizeExerciseCategories = (
  categories: unknown,
): ExerciseCategory[] => {
  if (!Array.isArray(categories)) {
    return [];
  }

  const builtinIcons = buildBuiltinExerciseIconMap();

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
        normalizeCatalogEntry(entry, category, builtinIcons),
      ),
    };
  });
};
