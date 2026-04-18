import type { ExerciseIconId } from "@/entities/exercise";

export { ExerciseCard } from "./ui/ExerciseCard";
export { WorkoutCaloriesSettingsCard } from "./ui/WorkoutCaloriesSettingsCard";

export interface ExerciseOption {
  name: string;
  group: string;
  iconId?: ExerciseIconId;
}
