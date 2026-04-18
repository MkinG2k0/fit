import type { ExerciseSet, SetCalories } from "@/entities/exercise";
import type { SetCalorieUiPhase } from "../model/types";

export type SetRowCalorieDisplay =
  | { kind: "idle" }
  | { kind: "calculating" }
  | { kind: "done"; calories: SetCalories };

export const getSetRowCalorieDisplay = (
  set: ExerciseSet,
  phase: SetCalorieUiPhase | undefined,
): SetRowCalorieDisplay => {
  if (set.calories) {
    return { kind: "done", calories: set.calories };
  }
  if (phase === "calculating") {
    return { kind: "calculating" };
  }
  return { kind: "idle" };
};
