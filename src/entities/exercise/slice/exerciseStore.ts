import dayjs from "dayjs";
import "dayjs/locale/ru";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ExerciseCategory, TrainingPreset } from "../model/types";
import { allExercises, trainingPreset } from "@/shared/config/constants";

dayjs.locale("ru");

interface ExerciseStore {
  exercises: ExerciseCategory[];
  trainingPreset: TrainingPreset[];
  createExercise: (newExercise: { name: string; category: string }) => void;
  createTrainingPreset: (newTrainingPreset: TrainingPreset) => void;
  deleteExercise: (exerciseName: string, category: string) => void;
  deleteTrainingPreset: (presetName: string) => void;
}

export const useExerciseStore = create<ExerciseStore>()(
  persist(
    (set) => ({
      exercises: allExercises,
      trainingPreset: trainingPreset,
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
      createTrainingPreset: (newTrainingPreset) =>
        set((state) => {
          return {
            trainingPreset: [...state.trainingPreset, newTrainingPreset],
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
    { name: "exercise-store" },
  ),
);

