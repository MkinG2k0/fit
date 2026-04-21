import type { SetCalories } from "@/entities/exercise";
import type { Exercise } from "@/entities/exercise";
import type { SetCalorieProfileInput } from "../model/types";
import {
  calcMetFallbackCalories,
  tryHeartRateSetCalories,
  type CalcSetCaloriesDeps,
} from "./calcSetCalories";
import { collectPendingSetWindows } from "./collectPendingSetWindows";

export interface SetCaloriesPatch {
  exerciseId: string;
  setId: string;
  calories: SetCalories;
}

interface RecalculateMissingSetCaloriesParams {
  exercises: Exercise[];
  profile: SetCalorieProfileInput;
  deps: CalcSetCaloriesDeps;
  now?: Date;
}

export const recalculateMissingSetCalories = async ({
  exercises,
  profile,
  deps,
  now = new Date(),
}: RecalculateMissingSetCaloriesParams): Promise<SetCaloriesPatch[]> => {
  const pending = collectPendingSetWindows(exercises, now);
  if (pending.length === 0) {
    return [];
  }

  const patches: SetCaloriesPatch[] = [];
  for (const item of pending) {
    const window = {
      startTime: item.startTime,
      endTime: item.endTime,
    };
    const hr = await tryHeartRateSetCalories(window, profile, deps);
    const calories =
      hr !== null && hr.kcal > 0
        ? hr
        : calcMetFallbackCalories(window, profile, item.exercise);
    patches.push({
      exerciseId: item.exercise.id,
      setId: item.setId,
      calories,
    });
  }

  return patches;
};
