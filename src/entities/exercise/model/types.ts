import type { ExerciseIconId } from "./exerciseIcons";
import type { MeasurementType } from "./measurementTypes";

export type SetCalorieSource = "heart_rate" | "met_fallback";
export type { MeasurementType } from "./measurementTypes";

export interface SetCalories {
  kcal: number;
  source: SetCalorieSource;
  avgHr?: number;
}

export interface ExerciseSet {
  id: string;
  weight: number;
  reps: number;
  /** ISO 8601 — начало окна для расчёта калорий подхода. */
  startTime?: string;
  /** ISO 8601 — момент «Добавить подход» для цепочки окон ккал. */
  endTime?: string;
  calories?: SetCalories;
}

export interface Exercise {
  id: string;
  catalogExerciseId?: string;
  categoryId?: string;
  name: string;
  category?: string;
  /** Иконка из каталога; если нет — в UI используется иконка по категории. */
  iconId?: ExerciseIconId;
  sets: ExerciseSet[];
  presetName?: string;
}

export interface CatalogExercise {
  id: string;
  name: string;
  iconId: ExerciseIconId;
  description: string;
  photoDataUrls: string[];
  /** How set weight/reps are interpreted in the logging UI. */
  measurementType: MeasurementType;
  /** Step for stack_kg / stack_lbs; omitted for free_weight and time. */
  measurementStep?: number;
}

export interface ExerciseCategory {
  id: string;
  category: string;
  exercises: CatalogExercise[];
}

export interface TrainingPreset {
  id?: string;
  presetName: string;
  exercises: string[];
}
