import type { ExerciseIconId } from "@/entities/exercise";

export { ExerciseCard } from "./ui/ExerciseCard";
export { ExerciseCardDisplaySettingsCard } from "./ui/ExerciseCardDisplaySettingsCard";
export { DefaultExercisesSettingsCard } from "./ui/DefaultExercisesSettingsCard";
export { MeasurementTypeSettingsCard } from "./ui/MeasurementTypeSettingsCard";
export { WorkoutSummaryDisplaySettingsCard } from "./ui/WorkoutSummaryDisplaySettingsCard";
export { RestBetweenSetsSettingsCard } from "./ui/RestBetweenSetsSettingsCard";
export { WorkoutCaloriesSettingsCard } from "./ui/WorkoutCaloriesSettingsCard";
export { useWorkoutCaloriesRecalculationRunner } from "./calories/lib/useWorkoutCaloriesRecalculationRunner";

export interface ExerciseOption {
  catalogExerciseId?: string;
  categoryId?: string;
  name: string;
  group: string;
  iconId?: ExerciseIconId;
}
