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
export { findCatalogExerciseById, findExerciseCategoryById } from "./lib/catalogLookup";
export { buildCatalogExerciseId, buildCategoryId, buildPresetId } from "./lib/exerciseIds";
export {
  computeExerciseMergeStats,
  type ExerciseMergeStats,
} from "./lib/computeExerciseMergeStats";
export {
  dayExercisesNeedRemap,
  remapDayExercises,
  remapPresetExerciseIds,
  type TargetExerciseMeta,
} from "./lib/mergeCatalogExercise";
export { normalizeExerciseCategories } from "./lib/normalizeExerciseCategories";
export { useExerciseStore } from "./slice/exerciseStore";
