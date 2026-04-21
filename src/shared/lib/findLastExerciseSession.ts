import dayjs from "dayjs";
import "dayjs/locale/ru";
import type { CalendarDay } from "@/entities/calendarDay";
import type { Exercise, ExerciseSet } from "@/entities/exercise";
import { readAllWorkoutMonthBuckets } from "./storage";

dayjs.locale("ru");

const DAY_KEY_REGEX = /^(\d{2})-(\d{2})-(\d{4})$/;
const REPS_WEIGHT_SEPARATOR = "×";
const SET_DISPLAY_SEPARATOR = " · ";

const normalizeExerciseName = (name: string): string =>
  name.trim().toLowerCase();

const parseDayKey = (key: string): dayjs.Dayjs | null => {
  const match = DAY_KEY_REGEX.exec(key);
  if (!match) {
    return null;
  }
  const [, dd, mm, yyyy] = match;
  const parsed = dayjs(`${yyyy}-${mm}-${dd}`);
  return parsed.isValid() ? parsed : null;
};

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

export const findLastExerciseSession = async (
  exerciseName: string,
  beforeDate: dayjs.Dayjs,
): Promise<LastExerciseSession | null> => {
  const normalizedTarget = normalizeExerciseName(exerciseName);
  if (!normalizedTarget) {
    return null;
  }

  const beforeStart = beforeDate.startOf("day");
  const buckets = await readAllWorkoutMonthBuckets();
  if (!buckets) {
    return null;
  }

  let bestDay: dayjs.Dayjs | null = null;
  let bestExercise: Exercise | null = null;

  for (const monthBucket of Object.values(buckets)) {
    if (!monthBucket || typeof monthBucket !== "object") {
      continue;
    }

    for (const [dayKey, rawDay] of Object.entries(
      monthBucket as Record<string, unknown>,
    )) {
      const day = parseDayKey(dayKey);
      if (!day || !day.isBefore(beforeStart)) {
        continue;
      }
      if (!isCalendarDay(rawDay)) {
        continue;
      }

      const exercise = pickExerciseOnDay(rawDay.exercises, normalizedTarget);
      if (!exercise) {
        continue;
      }

      if (!bestDay || day.isAfter(bestDay, "day")) {
        bestDay = day;
        bestExercise = exercise;
      }
    }
  }

  if (!bestDay || !bestExercise) {
    return null;
  }

  const summaryParts = bestExercise.sets
    .map(formatSetCompact)
    .filter((part) => part.length > 0);

  if (summaryParts.length === 0) {
    return null;
  }

  return {
    dateLabel: bestDay.format("D MMM"),
    setsSummary: summaryParts.join(SET_DISPLAY_SEPARATOR),
  };
};
