import { allExercises } from "@/shared/config/constants";
import {
  defaultIconIdForCategory,
  normalizeExerciseIconId,
  type ExerciseIconId,
} from "../model/exerciseIcons";
import {
  FREE_WEIGHT_MEASUREMENT_TYPE,
  normalizeMeasurementStep,
  normalizeMeasurementType,
} from "../model/measurementTypes";
import { buildCatalogExerciseId, buildCategoryId } from "./exerciseIds";
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

const resolveMeasurementFields = (
  raw: { measurementType?: unknown; measurementStep?: unknown } | undefined,
): Pick<CatalogExercise, "measurementType" | "measurementStep"> => {
  const measurementType = normalizeMeasurementType(raw?.measurementType);
  const measurementStep = normalizeMeasurementStep(
    measurementType,
    raw?.measurementStep,
  );

  return measurementStep === undefined
    ? { measurementType }
    : { measurementType, measurementStep };
};

const normalizeCatalogEntry = (
  raw: unknown,
  category: string,
  builtinIcons: ReadonlyMap<string, ExerciseIconId>,
): CatalogExercise => {
  if (typeof raw === "string") {
    const name = raw;

    return {
      id: buildCatalogExerciseId(category, name),
      name,
      iconId:
        builtinIcons.get(builtinExerciseIconKey(category, name)) ??
        defaultIconIdForCategory(category),
      description: "",
      photoDataUrls: [],
      measurementType: FREE_WEIGHT_MEASUREMENT_TYPE,
    };
  }

  if (raw && typeof raw === "object" && "name" in raw) {
    const entry = raw as {
      id?: unknown;
      name: unknown;
      iconId?: unknown;
      description?: unknown;
      photoDataUrls?: unknown;
      photoDataUrl?: unknown;
      measurementType?: unknown;
      measurementStep?: unknown;
    };
    const name = String(entry.name);
    const iconRaw = entry.iconId;
    const descriptionRaw = entry.description;
    const photoDataUrlsRaw = entry.photoDataUrls;
    const photoDataUrlLegacyRaw = entry.photoDataUrl;
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
    const measurementFields = resolveMeasurementFields(entry);
    const id =
      typeof entry.id === "string" && entry.id.trim().length > 0
        ? entry.id
        : buildCatalogExerciseId(category, name);

    if (fromBuiltin !== undefined) {
      return {
        id,
        name,
        iconId: fromBuiltin,
        description,
        photoDataUrls,
        ...measurementFields,
      };
    }

    const iconId =
      iconRaw === undefined
        ? defaultIconIdForCategory(category)
        : normalizeExerciseIconId(iconRaw);

    return {
      id,
      name,
      iconId,
      description,
      photoDataUrls,
      ...measurementFields,
    };
  }

  return {
    id: buildCatalogExerciseId(category, ""),
    name: "",
    iconId: defaultIconIdForCategory(category),
    description: "",
    photoDataUrls: [],
    measurementType: FREE_WEIGHT_MEASUREMENT_TYPE,
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
      return { id: "", category: "", exercises: [] };
    }

    const category = String((group as { category: unknown }).category);
    const categoryIdRaw = (group as { id?: unknown }).id;
    const rawExercises = (group as { exercises?: unknown }).exercises;
    const exercisesList = Array.isArray(rawExercises) ? rawExercises : [];

    return {
      id:
        typeof categoryIdRaw === "string" && categoryIdRaw.trim().length > 0
          ? categoryIdRaw
          : buildCategoryId(category),
      category,
      exercises: exercisesList.map((entry) =>
        normalizeCatalogEntry(entry, category, builtinIcons),
      ),
    };
  });
};
