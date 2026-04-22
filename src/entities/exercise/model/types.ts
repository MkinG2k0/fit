import type { RgbaColor } from "react-colorful";

import type { ExerciseIconId } from "./exerciseIcons";

export type SetCalorieSource = "heart_rate" | "met_fallback";

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
  name: string;
  category: string;
  /** Иконка из каталога; если нет — в UI используется иконка по категории. */
  iconId?: ExerciseIconId;
  sets: ExerciseSet[];
  presetName?: string;
  presetColor?: RgbaColor;
}

export interface CatalogExercise {
  name: string;
  iconId: ExerciseIconId;
  description: string;
  photoDataUrls: string[];
}

export interface ExerciseCategory {
  category: string;
  exercises: CatalogExercise[];
}

export interface TrainingPreset {
  presetName: string;
  exercises: string[];
  presetColor: RgbaColor;
}
