import {
  findCatalogExerciseByName,
  type ExerciseCategory,
  type ExerciseIconId,
  type TrainingPreset,
} from "@/entities/exercise";
import type { RgbaColor } from "react-colorful";

export const submitExercises = (
  selectedExerciseCheckboxes: string[],
  selectedPresetCheckboxes: string[],
  allExercises: ExerciseCategory[],
  trainingPreset: TrainingPreset[],
  addExercise: (
    name: string,
    group: string,
    presetName?: string,
    presetColor?: RgbaColor,
    iconId?: ExerciseIconId,
  ) => void,
) => {
  selectedExerciseCheckboxes.forEach((exerciseName) => {
    const category = allExercises.find((group) =>
      group.exercises.some((exercise) => exercise.name === exerciseName),
    )?.category;
    const catalogEntry = findCatalogExerciseByName(allExercises, exerciseName);
    if (category && catalogEntry) {
      addExercise(exerciseName, category, undefined, undefined, catalogEntry.iconId);
    }
  });

  selectedPresetCheckboxes.forEach((selectedPresetName) => {
    const preset = trainingPreset.find(
      (p) => p.presetName === selectedPresetName,
    );
    if (preset) {
      preset.exercises.forEach((exerciseName) => {
        const category = allExercises.find((group) =>
          group.exercises.some((exercise) => exercise.name === exerciseName),
        )?.category;
        const catalogEntry = findCatalogExerciseByName(
          allExercises,
          exerciseName,
        );
        if (category && catalogEntry) {
          addExercise(
            exerciseName,
            category,
            preset.presetName,
            preset.presetColor,
            catalogEntry.iconId,
          );
        }
      });
    }
  });
};
