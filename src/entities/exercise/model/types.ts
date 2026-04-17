import type { RgbaColor } from "react-colorful";

import type { ExerciseIconId } from "./exerciseIcons";

export interface ExerciseSet {
  id: string;
  weight: number;
  reps: number;
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
