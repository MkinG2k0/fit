import type { RgbaColor } from "react-colorful";

export interface ExerciseSet {
  id: string;
  weight: number;
  reps: number;
}

export interface Exercise {
  id: string;
  name: string;
  category: string;
  sets: ExerciseSet[];
  presetName?: string;
  presetColor?: RgbaColor;
}

export interface ExerciseCategory {
  category: string;
  exercises: string[];
}

export interface TrainingPreset {
  presetName: string;
  exercises: string[];
  presetColor: RgbaColor;
}
