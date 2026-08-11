export type {
  CatalogExercise,
  Exercise,
  ExerciseSet,
  ExerciseCategory,
  MeasurementType,
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
  FREE_WEIGHT_MEASUREMENT_TYPE,
  defaultMeasurementStep,
  formatSecondsAsMmSs,
  isStackMeasurementType,
  isTimeMeasurementType,
  normalizeMeasurementStep,
  normalizeMeasurementType,
  parseMmSsToSeconds,
} from "./model/measurementTypes";
export { findCatalogExerciseById, findExerciseCategoryById } from "./lib/catalogLookup";
export {
  buildCatalogNameById,
  resolveWorkoutExerciseDisplayName,
  useCatalogNameById,
} from "./lib/catalogNameIndex";
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
