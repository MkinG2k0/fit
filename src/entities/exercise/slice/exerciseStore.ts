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
  createExercise: (newExercise: {
    name: string;
    category: string;
    iconId: ExerciseIconId;
    description: string;
    photoDataUrl: string;
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
    photoDataUrl: string;
  }) => void;
  deleteTrainingPreset: (presetName: string) => void;
}

export const useExerciseStore = create<ExerciseStore>()(
  persist(
    (set) => ({
      exercises: allExercises,
      trainingPreset,
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
                      photoDataUrl: newExercise.photoDataUrl.trim(),
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
        photoDataUrl,
      }) =>
        set((state) => {
          const normalizedName = name.trim();
          const normalizedCategory = category.trim();
          const normalizedDescription = description.trim();
          const normalizedPhotoDataUrl = photoDataUrl.trim();
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
                      photoDataUrl: normalizedPhotoDataUrl,
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
