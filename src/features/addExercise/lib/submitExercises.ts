import {
  findCatalogExerciseById,
  type ExerciseCategory,
  type ExerciseIconId,
  type TrainingPreset,
} from "@/entities/exercise";

export const submitExercises = (
  selectedExerciseCheckboxes: string[],
  selectedPresetCheckboxes: string[],
  allExercises: ExerciseCategory[],
  trainingPreset: TrainingPreset[],
  addExercise: (
    name: string,
    group: string,
    presetName?: string,
    iconId?: ExerciseIconId,
    catalogExerciseId?: string,
    categoryId?: string,
  ) => void,
) => {
  selectedExerciseCheckboxes.forEach((exerciseId) => {
    const categoryGroup = allExercises.find((group) =>
      group.exercises.some((exercise) => exercise.id === exerciseId),
    );
    const category = categoryGroup?.category;
    const categoryId = categoryGroup?.id;
    const catalogEntry = findCatalogExerciseById(allExercises, exerciseId);
    if (category && catalogEntry && categoryId) {
      addExercise(
        catalogEntry.name,
        category,
        undefined,
        catalogEntry.iconId,
        catalogEntry.id,
        categoryId,
      );
    }
  });

  selectedPresetCheckboxes.forEach((selectedPresetId) => {
    const preset = trainingPreset.find((p) => p.id === selectedPresetId);
    if (preset) {
      preset.exercises.forEach((exerciseRef) => {
        const catalogEntry = findCatalogExerciseById(allExercises, exerciseRef);
        const categoryGroup = allExercises.find((group) =>
          group.exercises.some((exercise) => exercise.id === catalogEntry?.id),
        );
        const category = categoryGroup?.category;
        const categoryId = categoryGroup?.id;
        if (category && catalogEntry && categoryId) {
          addExercise(
            catalogEntry.name,
            category,
            preset.presetName,
            catalogEntry.iconId,
            catalogEntry.id,
            categoryId,
          );
        }
      });
    }
  });
};
