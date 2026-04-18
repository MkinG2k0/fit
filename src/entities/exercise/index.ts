export type {
  CatalogExercise,
  Exercise,
  ExerciseSet,
  ExerciseCategory,
  SetCalories,
  SetCalorieSource,
  TrainingPreset,
} from "./model/types";
export type { ExerciseIconId } from "./model/exerciseIcons";
export {
  DEFAULT_EXERCISE_ICON_ID,
  EXERCISE_ICON_PATHS,
  EXERCISE_ICON_PICKER_IDS,
  defaultIconIdForCategory,
  normalizeExerciseIconId,
} from "./model/exerciseIcons";
export {
  categoryContainsExerciseName,
  findCatalogExerciseByName,
} from "./lib/catalogLookup";
export { normalizeExerciseCategories } from "./lib/normalizeExerciseCategories";
export { useExerciseStore } from "./slice/exerciseStore";
