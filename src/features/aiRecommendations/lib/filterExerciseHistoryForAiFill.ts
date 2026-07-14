import dayjs, { type Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import type { CalendarDay } from "@/entities/calendarDay";
import type { Exercise } from "@/entities/exercise";
import { AI_FILL_HISTORY_MONTHS } from "../model/aiFillConstants";

dayjs.extend(customParseFormat);

const DAY_KEY_FORMAT = "DD-MM-YYYY";

export interface AiFillExerciseIdentity {
  name: string;
  catalogExerciseId?: string;
}

const normalizeExerciseName = (name: string): string =>
  name.trim().toLowerCase();

const parseDayKey = (key: string): Dayjs | null => {
  const parsed = dayjs(key, DAY_KEY_FORMAT, true);
  return parsed.isValid() ? parsed.startOf("day") : null;
};

const exerciseMatchesTarget = (
  candidate: Exercise,
  target: AiFillExerciseIdentity,
): boolean => {
  const targetCatalogId = target.catalogExerciseId?.trim();
  const candidateCatalogId = candidate.catalogExerciseId?.trim();

  if (targetCatalogId && candidateCatalogId) {
    return targetCatalogId === candidateCatalogId;
  }

  return (
    normalizeExerciseName(candidate.name) === normalizeExerciseName(target.name)
  );
};

const exerciseHasLoggedSets = (exercise: Exercise): boolean =>
  exercise.sets.some((set) => set.reps > 0 || set.weight > 0);

/**
 * Фильтрует журнал: только целевое упражнение в окне N календарных месяцев
 * от `now` (включительно сегодня). Совместимо с `buildWorkoutLogText`.
 */
export const filterExerciseHistoryForAiFill = (
  days: Record<string, CalendarDay>,
  exercise: AiFillExerciseIdentity,
  months: number = AI_FILL_HISTORY_MONTHS,
  now: Dayjs = dayjs(),
): Record<string, CalendarDay> => {
  const today = now.startOf("day");
  const from = today.subtract(months, "month");

  const result: Record<string, CalendarDay> = {};

  for (const [key, day] of Object.entries(days)) {
    const date = parseDayKey(key);
    if (!date) {
      continue;
    }

    const inWindow =
      (date.isSame(from, "day") || date.isAfter(from, "day")) &&
      (date.isSame(today, "day") || date.isBefore(today, "day"));
    if (!inWindow) {
      continue;
    }

    const matchedExercises = day.exercises.filter(
      (item) => exerciseMatchesTarget(item, exercise) && exerciseHasLoggedSets(item),
    );

    if (matchedExercises.length === 0) {
      continue;
    }

    result[key] = {
      ...day,
      exercises: matchedExercises,
    };
  }

  return result;
};
