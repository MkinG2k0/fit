import type { ExerciseIconId } from "@/entities/exercise";

export { ExerciseCard } from "./ui/ExerciseCard";

export interface ExerciseOption {
  name: string;
  group: string;
  iconId?: ExerciseIconId;
}
