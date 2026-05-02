import type { ExerciseIconId } from "@/entities/exercise";

export interface NewExercise {
  category: string;
  name: string;
  iconId: ExerciseIconId;
  description: string;
  photoDataUrls: string[];
}

/** Исходное упражнение в каталоге при открытии диалога редактирования. */
export interface CatalogExerciseEditSource {
  id: string;
  name: string;
  category: string;
  iconId: ExerciseIconId;
  description: string;
  photoDataUrls: string[];
}
