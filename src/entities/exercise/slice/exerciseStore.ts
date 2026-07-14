import dayjs from "dayjs";
import "dayjs/locale/ru";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { zustandAppStorage } from "@/shared/lib/storageAdapter";
import { createRandomUuid } from "@/shared/lib";
import { allExercises, trainingPreset } from "@/shared/config/constants";
import { findCatalogExerciseById } from "../lib/catalogLookup";
import { buildCategoryId, buildPresetId } from "../lib/exerciseIds";
import { remapPresetExerciseIds } from "../lib/mergeCatalogExercise";
import { normalizeExerciseCategories } from "../lib/normalizeExerciseCategories";
import {
  mergeExercisesWithDefaults,
  reconcileTrainingPresets,
  resolveCatalogExerciseId,
} from "../lib/storeHydration";
import type { ExerciseIconId } from "../model/exerciseIcons";
import type { ExerciseCategory, TrainingPreset } from "../model/types";

dayjs.locale("ru");

interface ExerciseStore {
  exercises: ExerciseCategory[];
  trainingPreset: TrainingPreset[];
  syncDefaultExercises: () => {
    replacedExerciseNames: string[];
    addedExerciseNames: string[];
  };
  createExercise: (newExercise: {
    name: string;
    category: string;
    iconId: ExerciseIconId;
    description: string;
    photoDataUrls: string[];
  }) => void;
  createCategory: (categoryName: string) => void;
  renameCategory: (categoryId: string, newCategoryName: string) => void;
  deleteCategory: (categoryId: string) => void;
  createTrainingPreset: (newTrainingPreset: TrainingPreset) => void;
  updateTrainingPreset: (
    oldPresetId: string,
    updatedTrainingPreset: TrainingPreset,
  ) => void;
  deleteExercise: (exerciseId: string) => void;
  /** Source → target: пресеты ремап+дедуп, source удаляется из каталога; meta target не трогаем (D-04). */
  mergeExercises: (sourceId: string, targetId: string) => boolean;
  updateExercise: (params: {
    id: string;
    name: string;
    category: string;
    iconId: ExerciseIconId;
    description: string;
    photoDataUrls: string[];
  }) => void;
  deleteTrainingPreset: (presetId: string) => void;
}

export const useExerciseStore = create<ExerciseStore>()(
  persist(
    (set) => ({
      exercises: allExercises,
      trainingPreset,
      syncDefaultExercises: () => {
        const report = {
          replacedExerciseNames: [] as string[],
          addedExerciseNames: [] as string[],
        };

        set((state) => {
          const existingNames = new Set(
            state.exercises.flatMap((category) =>
              category.exercises.map((exercise) =>
                exercise.name.trim().toLowerCase(),
              ),
            ),
          );

          for (const defaultCategory of allExercises) {
            for (const defaultExercise of defaultCategory.exercises) {
              const nameKey = defaultExercise.name.trim().toLowerCase();
              if (existingNames.has(nameKey)) {
                report.replacedExerciseNames.push(defaultExercise.name);
              } else {
                report.addedExerciseNames.push(defaultExercise.name);
              }
            }
          }

          return {
            exercises: mergeExercisesWithDefaults(state.exercises),
          };
        });

        return report;
      },
      createExercise: (newExercise) =>
        set((state) => {
          const newExerciseArray = state.exercises.map((exerciseGroup) =>
            exerciseGroup.category === newExercise.category
              ? {
                  ...exerciseGroup,
                  exercises: [
                    ...exerciseGroup.exercises,
                    {
                      id: createRandomUuid(),
                      name: newExercise.name,
                      iconId: newExercise.iconId,
                      description: newExercise.description.trim(),
                      photoDataUrls: newExercise.photoDataUrls
                        .map((photoDataUrl) => photoDataUrl.trim())
                        .filter((photoDataUrl) => photoDataUrl.length > 0),
                    },
                  ],
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
              {
                id: buildCategoryId(normalizedCategoryName),
                category: normalizedCategoryName,
                exercises: [],
              },
            ],
          };
        }),
      renameCategory: (categoryId, newCategoryName) =>
        set((state) => {
          const normalizedNewCategoryName = newCategoryName.trim();

          if (!normalizedNewCategoryName) {
            return state;
          }

          const isCategoryExists = state.exercises.some(
            (exerciseGroup) =>
              exerciseGroup.category.toLowerCase() ===
                normalizedNewCategoryName.toLowerCase() &&
              exerciseGroup.id !== categoryId,
          );

          if (isCategoryExists) {
            return state;
          }

          return {
            exercises: state.exercises.map((exerciseGroup) =>
              exerciseGroup.id === categoryId
                ? {
                    ...exerciseGroup,
                    id: buildCategoryId(normalizedNewCategoryName),
                    category: normalizedNewCategoryName,
                  }
                : exerciseGroup,
            ),
          };
        }),
      deleteCategory: (categoryId) =>
        set((state) => {
          return {
            exercises: state.exercises.filter(
              (exerciseGroup) => exerciseGroup.id !== categoryId,
            ),
          };
        }),
      createTrainingPreset: (newTrainingPreset) =>
        set((state) => {
          const exerciseIds = newTrainingPreset.exercises
            .map((exerciseRef) =>
              resolveCatalogExerciseId(exerciseRef, state.exercises),
            )
            .filter((exerciseId): exerciseId is string => Boolean(exerciseId));
          return {
            trainingPreset: [
              ...state.trainingPreset,
              {
                ...newTrainingPreset,
                exercises: exerciseIds,
                id:
                  newTrainingPreset.id ??
                  buildPresetId(newTrainingPreset.presetName),
              },
            ],
          };
        }),
      updateTrainingPreset: (oldPresetId, updatedTrainingPreset) =>
        set((state) => {
          const exerciseIds = updatedTrainingPreset.exercises
            .map((exerciseRef) =>
              resolveCatalogExerciseId(exerciseRef, state.exercises),
            )
            .filter((exerciseId): exerciseId is string => Boolean(exerciseId));
          return {
            trainingPreset: state.trainingPreset.map((preset) =>
              preset.id === oldPresetId
                ? {
                    ...updatedTrainingPreset,
                    exercises: exerciseIds,
                    id:
                      updatedTrainingPreset.id ??
                      buildPresetId(updatedTrainingPreset.presetName),
                  }
                : preset,
            ),
          };
        }),
      deleteExercise: (exerciseId) =>
        set((state) => {
          const updatedExercises = state.exercises.map((exerciseGroup) =>
            ({
              ...exerciseGroup,
              exercises: exerciseGroup.exercises.filter(
                (exercise) => exercise.id !== exerciseId,
              ),
            }),
          );
          return { exercises: updatedExercises };
        }),
      mergeExercises: (sourceId, targetId) => {
        if (!sourceId || !targetId || sourceId === targetId) {
          return false;
        }

        let didMerge = false;
        set((state) => {
          const source = findCatalogExerciseById(state.exercises, sourceId);
          const target = findCatalogExerciseById(state.exercises, targetId);
          if (!source || !target) {
            return state;
          }

          didMerge = true;
          return {
            exercises: state.exercises.map((exerciseGroup) => ({
              ...exerciseGroup,
              exercises: exerciseGroup.exercises.filter(
                (exercise) => exercise.id !== sourceId,
              ),
            })),
            trainingPreset: remapPresetExerciseIds(
              state.trainingPreset,
              sourceId,
              targetId,
            ),
          };
        });
        return didMerge;
      },
      updateExercise: ({
        id,
        name,
        category,
        iconId,
        description,
        photoDataUrls,
      }) =>
        set((state) => {
          const normalizedName = name.trim();
          const normalizedCategory = category.trim();
          const normalizedDescription = description.trim();
          const normalizedPhotoDataUrls = photoDataUrls
            .map((photoDataUrl) => photoDataUrl.trim())
            .filter((photoDataUrl) => photoDataUrl.length > 0);
          if (!normalizedName || !normalizedCategory) {
            return state;
          }

          const sourceExists = state.exercises.some((group) =>
            group.exercises.some((exercise) => exercise.id === id),
          );
          if (!sourceExists) {
            return state;
          }

          const nameTakenElsewhere = state.exercises.some((group) =>
            group.exercises.some(
              (exercise) =>
                exercise.name.trim().toLowerCase() ===
                  normalizedName.toLowerCase() &&
                exercise.id !== id,
            ),
          );

          if (nameTakenElsewhere) {
            return state;
          }

          const exercisesWithoutPrevious = state.exercises.map((group) =>
            ({
              ...group,
              exercises: group.exercises.filter((exercise) => exercise.id !== id),
            }),
          );

          const nextExercises = exercisesWithoutPrevious.map((group) =>
            group.category === normalizedCategory
              ? {
                  ...group,
                  exercises: [
                    ...group.exercises,
                    {
                      id,
                      name: normalizedName,
                      iconId,
                      description: normalizedDescription,
                      photoDataUrls: normalizedPhotoDataUrls,
                    },
                  ],
                }
              : group,
          );

          return {
            exercises: nextExercises,
          };
        }),
      deleteTrainingPreset: (presetId) =>
        set((state) => {
          return {
            trainingPreset: state.trainingPreset.filter(
              (preset) => preset.id !== presetId,
            ),
          };
        }),
    }),
    {
      name: "exercise-store",
      storage: createJSONStorage(() => zustandAppStorage),
      merge: (persistedState, currentState) => {
        const persisted = (persistedState ?? {}) as Partial<ExerciseStore>;
        const merged: ExerciseStore = {
          ...currentState,
          ...persisted,
          trainingPreset:
            persisted.trainingPreset ?? currentState.trainingPreset,
        };
        const normalizedExercises = normalizeExerciseCategories(
          mergeExercisesWithDefaults(merged.exercises),
        );

        return {
          ...merged,
          exercises: normalizedExercises,
          trainingPreset: reconcileTrainingPresets(
            merged.trainingPreset,
            normalizedExercises,
          ),
        };
      },
    },
  ),
);
