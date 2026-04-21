import dayjs from "dayjs";
import "dayjs/locale/ru";
import type { CalendarDay } from "@/entities/calendarDay";
import type { Exercise, ExerciseSet } from "@/entities/exercise";
import { readWorkoutMonthBucketsForKeys } from "./storage";

dayjs.locale("ru");

const REPS_WEIGHT_SEPARATOR = "×";
const SET_DISPLAY_SEPARATOR = " · ";
/** Ключ дня в бакете месяца журнала. */
const DAY_KEY_FORMAT = "DD-MM-YYYY";
/** Ключ месяца в storage. */
const MONTH_KEY_FORMAT = "MM-YYYY";

const normalizeExerciseName = (name: string): string =>
  name.trim().toLowerCase();

const isCalendarDay = (value: unknown): value is CalendarDay => {
  if (!value || typeof value !== "object") {
    return false;
  }
  const exercises = (value as { exercises?: unknown }).exercises;
  return Array.isArray(exercises);
};

const setHasLoggedValues = (set: ExerciseSet): boolean =>
  set.reps > 0 || set.weight > 0;

const exerciseHasLoggedSets = (exercise: Exercise): boolean =>
  exercise.sets.some(setHasLoggedValues);

const formatSetCompact = (set: ExerciseSet): string => {
  const hasReps = set.reps > 0;
  const hasWeight = set.weight > 0;
  if (hasReps && hasWeight) {
    return `${set.reps}${REPS_WEIGHT_SEPARATOR}${set.weight}`;
  }
  if (hasReps) {
    return `${set.reps} повт.`;
  }
  if (hasWeight) {
    return `${set.weight} кг`;
  }
  return "";
};

export interface LastExerciseSession {
  /** Дата прошлой тренировки для подписи, например «10 апр.» */
  dateLabel: string;
  /** Краткая сводка подходов, например «12×22 · 10×22» */
  setsSummary: string;
}

const pickExerciseOnDay = (
  exercises: Exercise[],
  normalizedTarget: string,
): Exercise | null => {
  const matches = exercises.filter(
    (item) => normalizeExerciseName(item.name) === normalizedTarget,
  );
  if (matches.length === 0) {
    return null;
  }
  const withData = matches.filter(exerciseHasLoggedSets);
  return (withData.length > 0 ? withData[0] : matches[0]) ?? null;
};

/**
 * Полуинтервал [oldestInclusive, beforeStart): все дни, которые попадают в окно
 * «месяц назад от выбранной даты», не включая саму выбранную дату.
 */
const monthKeysTouchingLookbackWindow = (
  oldestInclusive: dayjs.Dayjs,
  beforeStart: dayjs.Dayjs,
): string[] => {
  const keys = new Set<string>();
  for (
    let cursor = oldestInclusive;
    cursor.isBefore(beforeStart, "day");
    cursor = cursor.add(1, "day")
  ) {
    keys.add(cursor.format(MONTH_KEY_FORMAT));
  }
  return [...keys];
};

/** Дни от вчера относительно `beforeStart` к `oldestInclusive`, новые первыми. */
const lookbackDaysNewestFirst = (
  beforeStart: dayjs.Dayjs,
  oldestInclusive: dayjs.Dayjs,
): dayjs.Dayjs[] => {
  const days: dayjs.Dayjs[] = [];
  for (
    let day = beforeStart.subtract(1, "day");
    !day.isBefore(oldestInclusive, "day");
    day = day.subtract(1, "day")
  ) {
    days.push(day);
  }
  return days;
};

const toLastSessionOrSkip = (
  day: dayjs.Dayjs,
  exercise: Exercise,
): LastExerciseSession | null => {
  const summaryParts = exercise.sets
    .map(formatSetCompact)
    .filter((part) => part.length > 0);

  if (summaryParts.length === 0) {
    return null;
  }

  return {
    dateLabel: day.format("D MMM"),
    setsSummary: summaryParts.join(SET_DISPLAY_SEPARATOR),
  };
};

export const findLastExerciseSession = async (
  exerciseName: string,
  beforeDate: dayjs.Dayjs,
): Promise<LastExerciseSession | null> => {
  const normalizedTarget = normalizeExerciseName(exerciseName);
  if (!normalizedTarget) {
    return null;
  }

  const beforeStart = beforeDate.startOf("day");
  const oldestInclusive = beforeStart.subtract(1, "month").startOf("day");

  const monthKeys = monthKeysTouchingLookbackWindow(
    oldestInclusive,
    beforeStart,
  );
  const bucketsByMonth = await readWorkoutMonthBucketsForKeys(monthKeys);

  for (const day of lookbackDaysNewestFirst(beforeStart, oldestInclusive)) {
    const monthBucket = bucketsByMonth.get(day.format(MONTH_KEY_FORMAT));
    if (!monthBucket) {
      continue;
    }

    const rawDay = monthBucket[day.format(DAY_KEY_FORMAT)] as unknown;
    if (!isCalendarDay(rawDay)) {
      continue;
    }

    const exercise = pickExerciseOnDay(rawDay.exercises, normalizedTarget);
    if (!exercise) {
      continue;
    }

    const session = toLastSessionOrSkip(day, exercise);
    if (session) {
      return session;
    }
  }

  return null;
};
