import dayjs from "dayjs";
import "dayjs/locale/ru";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { zustandAppStorage } from "@/shared/lib/storageAdapter";
import { allExercises, trainingPreset } from "@/shared/config/constants";
import { normalizeExerciseCategories } from "../lib/normalizeExerciseCategories";
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
  renameCategory: (oldCategoryName: string, newCategoryName: string) => void;
  deleteCategory: (categoryName: string) => void;
  createTrainingPreset: (newTrainingPreset: TrainingPreset) => void;
  updateTrainingPreset: (
    oldPresetName: string,
    updatedTrainingPreset: TrainingPreset,
  ) => void;
  deleteExercise: (exerciseName: string, category: string) => void;
  updateExercise: (params: {
    previousName: string;
    previousCategory: string;
    name: string;
    category: string;
    iconId: ExerciseIconId;
    description: string;
    photoDataUrls: string[];
  }) => void;
  deleteTrainingPreset: (presetName: string) => void;
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
          const mergedByCategory = new Map<
            string,
            { category: string; exercises: ExerciseCategory["exercises"] }
          >();
          const existingByName = new Map<
            string,
            {
              categoryName: string;
              exerciseIndex: number;
            }
          >();

          for (const category of state.exercises) {
            mergedByCategory.set(category.category, {
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
                report.replacedExerciseNames.push(defaultExercise.name);
              } else {
                targetCategory.exercises.push({ ...defaultExercise });
                report.addedExerciseNames.push(defaultExercise.name);
                existingByName.set(exerciseNameKey, {
                  categoryName: targetCategory.category,
                  exerciseIndex: targetCategory.exercises.length - 1,
                });
              }
            }
          }

          return {
            exercises: Array.from(mergedByCategory.values()),
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
              preset.presetName === oldPresetName
                ? updatedTrainingPreset
                : preset,
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
                    (exercise) => exercise.name !== exerciseName,
                  ),
                }
              : exerciseGroup,
          );
          return { exercises: updatedExercises };
        }),
      updateExercise: ({
        previousName,
        previousCategory,
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

          const sourceGroup = state.exercises.find(
            (group) => group.category === previousCategory,
          );
          const sourceExists = sourceGroup?.exercises.some(
            (exercise) => exercise.name === previousName,
          );
          if (!sourceExists) {
            return state;
          }

          const isSelf = (groupCategory: string, exerciseName: string) =>
            groupCategory === previousCategory && exerciseName === previousName;

          const nameTakenElsewhere = state.exercises.some((group) =>
            group.exercises.some(
              (exercise) =>
                exercise.name.trim().toLowerCase() ===
                  normalizedName.toLowerCase() &&
                !isSelf(group.category, exercise.name),
            ),
          );

          if (nameTakenElsewhere) {
            return state;
          }

          const exercisesWithoutPrevious = state.exercises.map((group) =>
            group.category === previousCategory
              ? {
                  ...group,
                  exercises: group.exercises.filter(
                    (exercise) => exercise.name !== previousName,
                  ),
                }
              : group,
          );

          const nextExercises = exercisesWithoutPrevious.map((group) =>
            group.category === normalizedCategory
              ? {
                  ...group,
                  exercises: [
                    ...group.exercises,
                    {
                      name: normalizedName,
                      iconId,
                      description: normalizedDescription,
                      photoDataUrls: normalizedPhotoDataUrls,
                    },
                  ],
                }
              : group,
          );

          const nextPresets =
            previousName === normalizedName
              ? state.trainingPreset
              : state.trainingPreset.map((preset) => ({
                  ...preset,
                  exercises: preset.exercises.map((exerciseName) =>
                    exerciseName === previousName ? normalizedName : exerciseName,
                  ),
                }));

          return {
            exercises: nextExercises,
            trainingPreset: nextPresets,
          };
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
      storage: createJSONStorage(() => zustandAppStorage),
      merge: (persistedState, currentState) => {
        const persisted = (persistedState ?? {}) as Partial<ExerciseStore>;
        const merged: ExerciseStore = {
          ...currentState,
          ...persisted,
          trainingPreset:
            persisted.trainingPreset ?? currentState.trainingPreset,
        };

        return {
          ...merged,
          exercises: normalizeExerciseCategories(merged.exercises),
        };
      },
    },
  ),
);
