import type { SetCalories } from "@/entities/exercise";
import type { Exercise } from "@/entities/exercise";
import { MET_BY_EXERCISE_KEY } from "./metTable";
import { mapExerciseToMetKey } from "./mapExerciseToMetKey";
import type { SetCalorieProfileInput, SetCalorieWindowInput } from "../model/types";

/** Перевод кДж → ккал в формулах Keytel et al. */
const KJ_PER_KCAL = 4.184;

const MIN_DURATION_MINUTES = 1 / 60;

const MIN_HR_SAMPLES = 2;

const kcalPerMinuteFromHr = (
  avgHr: number,
  profile: SetCalorieProfileInput,
): number => {
  const { userWeightKg, userAge, isMale } = profile;
  if (isMale) {
    return (
      (-55.0969 +
        0.6309 * avgHr +
        0.1988 * userWeightKg +
        0.2017 * userAge) /
      KJ_PER_KCAL
    );
  }
  return (
    (-20.4022 +
      0.4472 * avgHr -
      0.1263 * userWeightKg +
      0.074 * userAge) /
    KJ_PER_KCAL
  );
};

export const durationMinutesForWindow = (
  window: SetCalorieWindowInput,
): number => {
  const ms = Math.max(0, window.endTime.getTime() - window.startTime.getTime());
  return Math.max(ms / 60_000, MIN_DURATION_MINUTES);
};

export interface CalcSetCaloriesDeps {
  readHeartRateBpm: (start: Date, end: Date) => Promise<number[]>;
}

/**
 * Ветка по пульсу: null если данных мало или ошибка чтения (тогда снаружи — ретраи / MET).
 */
export const tryHeartRateSetCalories = async (
  window: SetCalorieWindowInput,
  profile: SetCalorieProfileInput,
  deps: CalcSetCaloriesDeps,
): Promise<SetCalories | null> => {
  try {
    const bpm = await deps.readHeartRateBpm(
      window.startTime,
      window.endTime,
    );
    if (bpm.length < MIN_HR_SAMPLES) {
      return null;
    }
    const avgHr =
      bpm.reduce((sum, v) => sum + v, 0) / Math.max(bpm.length, 1);
    const durMin = durationMinutesForWindow(window);
    const kcalPerMin = kcalPerMinuteFromHr(avgHr, profile);
    const kcal = Math.max(0, kcalPerMin * durMin);
    return {
      kcal,
      source: "heart_rate",
      avgHr,
    };
  } catch {
    return null;
  }
};

export const calcMetFallbackCalories = (
  window: SetCalorieWindowInput,
  profile: SetCalorieProfileInput,
  exercise: Exercise,
): SetCalories => {
  const durMin = durationMinutesForWindow(window);
  const metKey = mapExerciseToMetKey(exercise);
  const met = MET_BY_EXERCISE_KEY[metKey] ?? MET_BY_EXERCISE_KEY.default;
  return {
    kcal: met * profile.userWeightKg * (durMin / 60),
    source: "met_fallback",
  };
};
