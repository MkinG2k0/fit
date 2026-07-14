import dayjs from "dayjs";
import type { CalendarDay } from "@/entities/calendarDay";
import type { Exercise } from "@/entities/exercise";
import { readWorkoutMonthBucketsForKeys } from "@/shared/lib/storage";

const DAY_KEY_FORMAT = "DD-MM-YYYY";
const MONTH_KEY_FORMAT = "MM-YYYY";
const MAX_WEEK = 16;

const isCalendarDay = (value: unknown): value is CalendarDay => {
  if (!value || typeof value !== "object") {
    return false;
  }
  const exercises = (value as { exercises?: unknown }).exercises;
  return Array.isArray(exercises);
};

const exerciseHasLoggedSets = (exercise: Exercise): boolean =>
  exercise.sets.some((set) => set.reps > 0 || set.weight > 0);

const resolveCatalogId = (exercise: Exercise): string =>
  (exercise.catalogExerciseId ?? exercise.id).trim();

const normalizeExerciseName = (name: string): string =>
  name.trim().toLowerCase();

const exerciseMatchesTracked = (
  exercise: Exercise,
  trimmedId: string,
  normalizedName: string | null,
): boolean => {
  if (resolveCatalogId(exercise) === trimmedId) {
    return true;
  }
  if (normalizedName && normalizeExerciseName(exercise.name) === normalizedName) {
    return true;
  }
  return false;
};

const monthKeysFromCreatedAtThroughToday = (
  oldestInclusive: dayjs.Dayjs,
  newestInclusive: dayjs.Dayjs,
): string[] => {
  const keys = new Set<string>();
  for (
    let cursor = oldestInclusive.startOf("month");
    !cursor.isAfter(newestInclusive, "month");
    cursor = cursor.add(1, "month")
  ) {
    keys.add(cursor.format(MONTH_KEY_FORMAT));
  }
  return [...keys];
};

const toCurrentWeek = (sessionCount: number): number =>
  Math.min(MAX_WEEK, Math.floor(sessionCount / 2) + 1);

/**
 * Считает тренировочные дни с `createdAt` (включительно) по сегодня
 * для данного catalogExerciseId и выводит текущую неделю плана.
 */
export const getLoadTableCurrentWeek = async (
  catalogExerciseId: string,
  createdAtIso: string,
  exerciseName?: string,
): Promise<{ sessionCount: number; currentWeek: number }> => {
  const trimmedId = catalogExerciseId.trim();
  if (!trimmedId) {
    return { sessionCount: 0, currentWeek: 1 };
  }

  const createdAt = dayjs(createdAtIso);
  if (!createdAt.isValid()) {
    return { sessionCount: 0, currentWeek: 1 };
  }

  const oldestInclusive = createdAt.startOf("day");
  const newestInclusive = dayjs().startOf("day");

  if (newestInclusive.isBefore(oldestInclusive, "day")) {
    return { sessionCount: 0, currentWeek: 1 };
  }

  const normalizedName = (() => {
    if (exerciseName == null) {
      return null;
    }
    const normalized = normalizeExerciseName(exerciseName);
    return normalized.length > 0 ? normalized : null;
  })();

  const monthKeys = monthKeysFromCreatedAtThroughToday(
    oldestInclusive,
    newestInclusive,
  );
  const bucketsByMonth = await readWorkoutMonthBucketsForKeys(monthKeys);

  let sessionCount = 0;
  for (
    let day = oldestInclusive;
    !day.isAfter(newestInclusive, "day");
    day = day.add(1, "day")
  ) {
    const monthBucket = bucketsByMonth.get(day.format(MONTH_KEY_FORMAT));
    if (!monthBucket) {
      continue;
    }

    const rawDay = monthBucket[day.format(DAY_KEY_FORMAT)] as unknown;
    if (!isCalendarDay(rawDay)) {
      continue;
    }

    const hasSession = rawDay.exercises.some(
      (exercise) =>
        exerciseMatchesTracked(exercise, trimmedId, normalizedName) &&
        exerciseHasLoggedSets(exercise),
    );
    if (hasSession) {
      sessionCount += 1;
    }
  }

  return {
    sessionCount,
    currentWeek: toCurrentWeek(sessionCount),
  };
};
