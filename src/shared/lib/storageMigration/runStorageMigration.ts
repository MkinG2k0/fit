import { allExercises } from "@/shared/config/constants";
import {
  readAllWorkoutMonthBuckets,
  writeWorkoutMonthBucket,
} from "@/shared/lib/storage";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const toNormalizedString = (value: unknown): string =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

const toRawString = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

const buildCatalogLookup = () => {
  const byCategoryAndName = new Map<string, string>();
  const allCatalogIds = new Set<string>();
  const categoryIdByCatalogExerciseId = new Map<string, string>();

  allExercises.forEach((group) => {
    const normalizedCategory = toNormalizedString(group.category);
    group.exercises.forEach((exercise) => {
      allCatalogIds.add(exercise.id);
      categoryIdByCatalogExerciseId.set(exercise.id, group.id);
      const normalizedName = toNormalizedString(exercise.name);
      if (!normalizedCategory || !normalizedName) {
        return;
      }
      byCategoryAndName.set(
        `${normalizedCategory}::${normalizedName}`,
        exercise.id,
      );
    });
  });

  return { byCategoryAndName, allCatalogIds, categoryIdByCatalogExerciseId };
};

const migrateExercise = (
  value: unknown,
  byCategoryAndName: Map<string, string>,
  allCatalogIds: Set<string>,
  categoryIdByCatalogExerciseId: Map<string, string>,
): { migratedValue: unknown; isChanged: boolean } => {
  if (!isRecord(value)) {
    return { migratedValue: value, isChanged: false };
  }

  const currentCatalogExerciseId = toRawString(value.catalogExerciseId);
  const currentCategoryId = toRawString(value.categoryId);

  const id = toRawString(value.id);
  const category = toNormalizedString(value.category);
  const name = toNormalizedString(value.name);

  const resolvedCatalogExerciseId =
    (currentCatalogExerciseId && allCatalogIds.has(currentCatalogExerciseId)
      ? currentCatalogExerciseId
      : undefined) ??
    (id && allCatalogIds.has(id) ? id : undefined) ??
    (category && name ? byCategoryAndName.get(`${category}::${name}`) : undefined);
  const resolvedCategoryId =
    currentCategoryId ||
    (resolvedCatalogExerciseId
      ? categoryIdByCatalogExerciseId.get(resolvedCatalogExerciseId) ?? ""
      : "");

  if (!resolvedCatalogExerciseId && !resolvedCategoryId) {
    return { migratedValue: value, isChanged: false };
  }

  const isCatalogExerciseIdChanged =
    resolvedCatalogExerciseId !== undefined &&
    currentCatalogExerciseId !== resolvedCatalogExerciseId;
  const isCategoryIdChanged =
    resolvedCategoryId.length > 0 && currentCategoryId !== resolvedCategoryId;

  if (!isCatalogExerciseIdChanged && !isCategoryIdChanged) {
    return { migratedValue: value, isChanged: false };
  }

  return {
    migratedValue: {
      ...(value as Record<string, unknown>),
      ...(resolvedCatalogExerciseId
        ? { catalogExerciseId: resolvedCatalogExerciseId }
        : {}),
      ...(resolvedCategoryId ? { categoryId: resolvedCategoryId } : {}),
      ...(resolvedCategoryId ? { category: undefined } : {}),
    },
    isChanged: true,
  };
};

const migrateDay = (
  value: unknown,
  byCategoryAndName: Map<string, string>,
  allCatalogIds: Set<string>,
  categoryIdByCatalogExerciseId: Map<string, string>,
): { migratedValue: unknown; isChanged: boolean } => {
  if (!isRecord(value) || !Array.isArray(value.exercises)) {
    return { migratedValue: value, isChanged: false };
  }

  let isChanged = false;
  const migratedExercises = value.exercises.map((exercise) => {
    const result = migrateExercise(
      exercise,
      byCategoryAndName,
      allCatalogIds,
      categoryIdByCatalogExerciseId,
    );
    if (result.isChanged) {
      isChanged = true;
    }
    return result.migratedValue;
  });

  if (!isChanged) {
    return { migratedValue: value, isChanged: false };
  }

  return {
    migratedValue: {
      ...value,
      exercises: migratedExercises,
    },
    isChanged: true,
  };
};

export const runStorageMigration = async (): Promise<void> => {
  const months = await readAllWorkoutMonthBuckets();
  if (!months) {
    return;
  }

  const { byCategoryAndName, allCatalogIds, categoryIdByCatalogExerciseId } =
    buildCatalogLookup();

  for (const [monthKey, monthValue] of Object.entries(months)) {
    if (!isRecord(monthValue)) {
      continue;
    }

    let isMonthChanged = false;
    const migratedMonth: Record<string, unknown> = {};

    for (const [dateKey, dayValue] of Object.entries(monthValue)) {
      const result = migrateDay(
        dayValue,
        byCategoryAndName,
        allCatalogIds,
        categoryIdByCatalogExerciseId,
      );
      migratedMonth[dateKey] = result.migratedValue;
      if (result.isChanged) {
        isMonthChanged = true;
      }
    }

    if (isMonthChanged) {
      await writeWorkoutMonthBucket(monthKey, migratedMonth);
    }
  }
};
