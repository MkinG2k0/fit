import type { ExerciseIconId } from "@/entities/exercise";

export { ExerciseCard } from "./ui/ExerciseCard";
export { ExerciseCardDisplaySettingsCard } from "./ui/ExerciseCardDisplaySettingsCard";
export { WorkoutSummaryDisplaySettingsCard } from "./ui/WorkoutSummaryDisplaySettingsCard";
export { WorkoutCaloriesSettingsCard } from "./ui/WorkoutCaloriesSettingsCard";
export { useWorkoutCaloriesRecalculationRunner } from "./calories/lib/useWorkoutCaloriesRecalculationRunner";

export interface ExerciseOption {
  name: string;
  group: string;
  iconId?: ExerciseIconId;
}
