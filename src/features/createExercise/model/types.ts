import type { ExerciseIconId } from "@/entities/exercise";

export interface NewExercise {
  category: string;
  name: string;
  iconId: ExerciseIconId;
}
