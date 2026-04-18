import type { SetCalories } from "@/entities/exercise";
import type { Exercise } from "@/entities/exercise";
import type { SetCalorieProfileInput, SetCalorieWindowInput } from "../model/types";
import {
  calcMetFallbackCalories,
  tryHeartRateSetCalories,
  type CalcSetCaloriesDeps,
} from "./calcSetCalories";

const MAX_HR_ATTEMPTS = 3;
const RETRY_DELAY_MS = 20_000;

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });

/**
 * До 3 попыток HR с паузой 20 с; при kcal &gt; 0 по пульсу — сразу выход.
 * Иначе MET-fallback.
 */
export const calcSetCaloriesWithRetries = async (
  window: SetCalorieWindowInput,
  profile: SetCalorieProfileInput,
  exercise: Exercise,
  deps: CalcSetCaloriesDeps,
): Promise<SetCalories> => {
  for (let attempt = 0; attempt < MAX_HR_ATTEMPTS; attempt += 1) {
    const hr = await tryHeartRateSetCalories(window, profile, deps);
    if (hr !== null && hr.kcal > 0) {
      return hr;
    }
    if (attempt < MAX_HR_ATTEMPTS - 1) {
      await delay(RETRY_DELAY_MS);
    }
  }
  return calcMetFallbackCalories(window, profile, exercise);
};
