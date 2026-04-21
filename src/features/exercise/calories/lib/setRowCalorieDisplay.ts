import type { ExerciseSet, SetCalories } from "@/entities/exercise";

export type SetRowCalorieDisplay =
  | { kind: "idle" }
  | { kind: "done"; calories: SetCalories };

export const getSetRowCalorieDisplay = (set: ExerciseSet): SetRowCalorieDisplay => {
  if (set.calories) {
    return { kind: "done", calories: set.calories };
  }
  return { kind: "idle" };
};
