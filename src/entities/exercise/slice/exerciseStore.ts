import dayjs from "dayjs";
import "dayjs/locale/ru";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { allExercises, trainingPreset } from "@/shared/config/constants";
import type { ExerciseCategory, TrainingPreset } from "../model/types";

dayjs.locale("ru");

interface ExerciseStore {
  exercises: ExerciseCategory[];
  trainingPreset: TrainingPreset[];
  createExercise: (newExercise: { name: string; category: string }) => void;
  createCategory: (categoryName: string) => void;
  renameCategory: (oldCategoryName: string, newCategoryName: string) => void;
  deleteCategory: (categoryName: string) => void;
  createTrainingPreset: (newTrainingPreset: TrainingPreset) => void;
  updateTrainingPreset: (
    oldPresetName: string,
    updatedTrainingPreset: TrainingPreset,
  ) => void;
  deleteExercise: (exerciseName: string, category: string) => void;
  deleteTrainingPreset: (presetName: string) => void;
}

interface PersistedExerciseStore {
  exercises?: ExerciseCategory[];
  trainingPreset?: TrainingPreset[];
}

const normalizeKey = (value: string) => value.trim().toLowerCase();

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const isValidColor = (
  value: unknown,
): value is TrainingPreset["presetColor"] =>
  isRecord(value) &&
  typeof value.r === "number" &&
  typeof value.g === "number" &&
  typeof value.b === "number" &&
  typeof value.a === "number";

const dedupeExercises = (exercises: string[]): string[] => {
  const exerciseMap = new Map<string, string>();

  exercises.forEach((exerciseName) => {
    const normalizedExerciseName = exerciseName.trim();

    if (!normalizedExerciseName) {
      return;
    }

    const exerciseKey = normalizeKey(normalizedExerciseName);

    if (!exerciseMap.has(exerciseKey)) {
      exerciseMap.set(exerciseKey, normalizedExerciseName);
    }
  });

  return Array.from(exerciseMap.values());
};

const mergeExerciseCategories = (
  defaultCategories: ExerciseCategory[],
  persistedCategories: ExerciseCategory[],
): ExerciseCategory[] => {
  const categoryMap = new Map<string, ExerciseCategory>();

  defaultCategories.forEach(({ category, exercises }) => {
    const normalizedCategoryName = category.trim();

    if (!normalizedCategoryName) {
      return;
    }

    const categoryKey = normalizeKey(normalizedCategoryName);
    const existingCategory = categoryMap.get(categoryKey);

    categoryMap.set(categoryKey, {
      category: existingCategory?.category ?? normalizedCategoryName,
      exercises: dedupeExercises([...(existingCategory?.exercises ?? []), ...exercises]),
    });
  });

  persistedCategories.forEach(({ category, exercises }) => {
    const normalizedCategoryName = category.trim();

    if (!normalizedCategoryName) {
      return;
    }

    const categoryKey = normalizeKey(normalizedCategoryName);
    const existingCategory = categoryMap.get(categoryKey);

    categoryMap.set(categoryKey, {
      category: normalizedCategoryName,
      exercises: dedupeExercises([...exercises, ...(existingCategory?.exercises ?? [])]),
    });
  });

  return Array.from(categoryMap.values());
};

const mergeTrainingPresets = (
  defaultPresets: TrainingPreset[],
  persistedPresets: TrainingPreset[],
): TrainingPreset[] => {
  const presetMap = new Map<string, TrainingPreset>();

  defaultPresets.forEach((preset) => {
    const normalizedPresetName = preset.presetName.trim();

    if (!normalizedPresetName) {
      return;
    }

    const presetKey = normalizeKey(normalizedPresetName);

    presetMap.set(presetKey, {
      ...preset,
      presetName: normalizedPresetName,
      exercises: dedupeExercises(preset.exercises),
    });
  });

  persistedPresets.forEach((preset) => {
    const normalizedPresetName = preset.presetName.trim();

    if (!normalizedPresetName) {
      return;
    }

    const presetKey = normalizeKey(normalizedPresetName);
    const existingPreset = presetMap.get(presetKey);

    presetMap.set(presetKey, {
      ...preset,
      presetName: normalizedPresetName,
      exercises: dedupeExercises([
        ...preset.exercises,
        ...(existingPreset?.exercises ?? []),
      ]),
      presetColor: preset.presetColor,
    });
  });

  return Array.from(presetMap.values());
};

const parsePersistedState = (persistedState: unknown): PersistedExerciseStore => {
  if (!isRecord(persistedState)) {
    return {};
  }

  const exercises = Array.isArray(persistedState.exercises)
    ? persistedState.exercises
        .filter(
          (item): item is ExerciseCategory =>
            isRecord(item) &&
            typeof item.category === "string" &&
            isStringArray(item.exercises),
        )
        .map((item) => ({
          category: item.category.trim(),
          exercises: dedupeExercises(item.exercises),
        }))
    : [];

  const trainingPresetData = Array.isArray(persistedState.trainingPreset)
    ? persistedState.trainingPreset
        .filter(
          (item): item is TrainingPreset =>
            isRecord(item) &&
            typeof item.presetName === "string" &&
            isStringArray(item.exercises) &&
            isValidColor(item.presetColor),
        )
        .map((item) => ({
          presetName: item.presetName.trim(),
          exercises: dedupeExercises(item.exercises),
          presetColor: item.presetColor,
        }))
    : [];

  return {
    exercises,
    trainingPreset: trainingPresetData,
  };
};

const normalizedDefaultExercises = mergeExerciseCategories(allExercises, []);
const normalizedDefaultPresets = mergeTrainingPresets(trainingPreset, []);

export const useExerciseStore = create<ExerciseStore>()(
  persist(
    (set) => ({
      exercises: normalizedDefaultExercises,
      trainingPreset: normalizedDefaultPresets,
      createExercise: (newExercise) =>
        set((state) => {
          const newExerciseArray = state.exercises.map((exerciseGroup) =>
            exerciseGroup.category === newExercise.category
              ? {
                  ...exerciseGroup,
                  exercises: [...exerciseGroup.exercises, newExercise.name],
                }
              : exerciseGroup,
          );
          return { exercises: newExerciseArray };
        }),
      createCategory: (categoryName) =>
        set((state) => {
          const normalizedCategoryName = categoryName.trim();

          if (!normalizedCategoryName) {
            return state;
          }

          const isCategoryExists = state.exercises.some(
            (exerciseGroup) =>
              exerciseGroup.category.toLowerCase() ===
              normalizedCategoryName.toLowerCase(),
          );

          if (isCategoryExists) {
            return state;
          }

          return {
            exercises: [
              ...state.exercises,
              { category: normalizedCategoryName, exercises: [] },
            ],
          };
        }),
      renameCategory: (oldCategoryName, newCategoryName) =>
        set((state) => {
          const normalizedNewCategoryName = newCategoryName.trim();

          if (!normalizedNewCategoryName) {
            return state;
          }

          const isCategoryExists = state.exercises.some(
            (exerciseGroup) =>
              exerciseGroup.category.toLowerCase() ===
                normalizedNewCategoryName.toLowerCase() &&
              exerciseGroup.category.toLowerCase() !==
                oldCategoryName.toLowerCase(),
          );

          if (isCategoryExists) {
            return state;
          }

          return {
            exercises: state.exercises.map((exerciseGroup) =>
              exerciseGroup.category === oldCategoryName
                ? { ...exerciseGroup, category: normalizedNewCategoryName }
                : exerciseGroup,
            ),
          };
        }),
      deleteCategory: (categoryName) =>
        set((state) => {
          return {
            exercises: state.exercises.filter(
              (exerciseGroup) => exerciseGroup.category !== categoryName,
            ),
          };
        }),
      createTrainingPreset: (newTrainingPreset) =>
        set((state) => {
          return {
            trainingPreset: [...state.trainingPreset, newTrainingPreset],
          };
        }),
      updateTrainingPreset: (oldPresetName, updatedTrainingPreset) =>
        set((state) => {
          return {
            trainingPreset: state.trainingPreset.map((preset) =>
              preset.presetName === oldPresetName ? updatedTrainingPreset : preset,
            ),
          };
        }),
      deleteExercise: (exerciseName, category) =>
        set((state) => {
          const updatedExercises = state.exercises.map((exerciseGroup) =>
            exerciseGroup.category === category
              ? {
                  ...exerciseGroup,
                  exercises: exerciseGroup.exercises.filter(
                    (exercise) => exercise !== exerciseName,
                  ),
                }
              : exerciseGroup,
          );
          return { exercises: updatedExercises };
        }),
      deleteTrainingPreset: (presetName) =>
        set((state) => {
          return {
            trainingPreset: state.trainingPreset.filter(
              (preset) => preset.presetName !== presetName,
            ),
          };
        }),
    }),
    {
      name: "exercise-store",
      version: 1,
      migrate: (persistedState) => {
        const parsedPersistedState = parsePersistedState(persistedState);

        return {
          exercises: mergeExerciseCategories(
            allExercises,
            parsedPersistedState.exercises ?? [],
          ),
          trainingPreset: mergeTrainingPresets(
            trainingPreset,
            parsedPersistedState.trainingPreset ?? [],
          ),
        };
      },
    },
  ),
);

