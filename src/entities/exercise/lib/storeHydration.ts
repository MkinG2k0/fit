import { allExercises, trainingPreset } from "@/shared/config/constants";
import {
  buildPresetId,
  extractLegacyCatalogNamePart,
  normalizeLegacyCatalogName,
} from "./exerciseIds";
import type { ExerciseCategory, TrainingPreset } from "../model/types";

export const resolveCatalogExerciseId = (
  ref: string,
  catalog: ExerciseCategory[],
): string | null => {
  const legacyNamePart = extractLegacyCatalogNamePart(ref);
  const normalizedRef = ref.trim().toLowerCase();
  if (!normalizedRef) {
    return null;
  }

  for (const group of catalog) {
    for (const exercise of group.exercises) {
      const normalizedExerciseName = exercise.name.trim().toLowerCase();
      if (
        exercise.id === ref ||
        normalizedExerciseName === normalizedRef ||
        (legacyNamePart !== null &&
          normalizeLegacyCatalogName(exercise.name) === legacyNamePart)
      ) {
        return exercise.id;
      }
    }
  }
  return null;
};

export const mergeExercisesWithDefaults = (
  exercises: ExerciseCategory[],
): ExerciseCategory[] => {
  const mergedByCategory = new Map<
    string,
    {
      id: string;
      category: string;
      exercises: ExerciseCategory["exercises"];
    }
  >();
  const existingByName = new Map<
    string,
    {
      categoryName: string;
      exerciseIndex: number;
    }
  >();

  for (const category of exercises) {
    mergedByCategory.set(category.category, {
      id: category.id,
      category: category.category,
      exercises: [...category.exercises],
    });

    category.exercises.forEach((exercise, exerciseIndex) => {
      existingByName.set(exercise.name.trim().toLowerCase(), {
        categoryName: category.category,
        exerciseIndex,
      });
    });
  }

  for (const defaultCategory of allExercises) {
    if (!mergedByCategory.has(defaultCategory.category)) {
      mergedByCategory.set(defaultCategory.category, {
        id: defaultCategory.id,
        category: defaultCategory.category,
        exercises: [],
      });
    }

    const targetCategory = mergedByCategory.get(defaultCategory.category);
    if (!targetCategory) {
      continue;
    }

    for (const defaultExercise of defaultCategory.exercises) {
      const exerciseNameKey = defaultExercise.name.trim().toLowerCase();
      const existingExerciseMeta = existingByName.get(exerciseNameKey);

      if (existingExerciseMeta) {
        const existingCategory = mergedByCategory.get(
          existingExerciseMeta.categoryName,
        );
        if (!existingCategory) {
          continue;
        }
        existingCategory.exercises[existingExerciseMeta.exerciseIndex] = {
          ...defaultExercise,
        };
      } else {
        targetCategory.exercises.push({ ...defaultExercise });
        existingByName.set(exerciseNameKey, {
          categoryName: targetCategory.category,
          exerciseIndex: targetCategory.exercises.length - 1,
        });
      }
    }
  }

  return Array.from(mergedByCategory.values());
};

const normalizePresetExercises = (
  presetExercises: string[],
  catalog: ExerciseCategory[],
): string[] =>
  presetExercises
    .map((exerciseRef) => resolveCatalogExerciseId(exerciseRef, catalog))
    .filter((exerciseId): exerciseId is string => Boolean(exerciseId));

export const reconcileTrainingPresets = (
  presets: TrainingPreset[],
  catalog: ExerciseCategory[],
): TrainingPreset[] => {
  const defaultPresetById = new Map<string, TrainingPreset>();
  const defaultPresetByName = new Map<string, TrainingPreset>();

  trainingPreset.forEach((preset) => {
    const defaultId = preset.id ?? buildPresetId(preset.presetName);
    defaultPresetById.set(defaultId, preset);
    defaultPresetByName.set(preset.presetName.trim().toLowerCase(), preset);
  });

  const usedDefaultPresetIds = new Set<string>();

  const normalizedPresets = presets.map((preset) => {
    const presetId = preset.id ?? buildPresetId(preset.presetName);
    const defaultPreset =
      defaultPresetById.get(presetId) ??
      defaultPresetByName.get(preset.presetName.trim().toLowerCase());

    if (defaultPreset) {
      const defaultPresetId =
        defaultPreset.id ?? buildPresetId(defaultPreset.presetName);
      usedDefaultPresetIds.add(defaultPresetId);

      return {
        presetName: defaultPreset.presetName,
        exercises: normalizePresetExercises(defaultPreset.exercises, catalog),
        id: defaultPresetId,
      };
    }

    return {
      presetName: preset.presetName,
      exercises: normalizePresetExercises(preset.exercises, catalog),
      id: presetId,
    };
  });

  const missingDefaultPresets = trainingPreset
    .filter((preset) => {
      const presetId = preset.id ?? buildPresetId(preset.presetName);
      return !usedDefaultPresetIds.has(presetId);
    })
    .map((preset) => {
      const presetId = preset.id ?? buildPresetId(preset.presetName);
      return {
        presetName: preset.presetName,
        exercises: normalizePresetExercises(preset.exercises, catalog),
        id: presetId,
      };
    });

  return [...normalizedPresets, ...missingDefaultPresets];
};
