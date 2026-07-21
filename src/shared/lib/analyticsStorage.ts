import type { CalendarDay } from "@/entities/calendarDay";
import type { Exercise, ExerciseSet } from "@/entities/exercise";
import { readAllWorkoutMonthBuckets } from "./storage";

const isObjectRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const toSafeNumber = (value: unknown) => {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
};

const toSafeString = (value: unknown) => {
  return typeof value === "string" ? value : "";
};

const parseExerciseSet = (value: unknown): ExerciseSet | null => {
  if (!isObjectRecord(value)) {
    return null;
  }

  const id = toSafeString(value.id);
  if (id.length === 0) {
    return null;
  }

  return {
    id,
    weight: toSafeNumber(value.weight),
    reps: toSafeNumber(value.reps),
  };
};

const parseExercise = (value: unknown): Exercise | null => {
  if (!isObjectRecord(value)) {
    return null;
  }

  const id = toSafeString(value.id);
  const catalogExerciseId = toSafeString(value.catalogExerciseId);
  const name = toSafeString(value.name);
  const category = toSafeString(value.category);
  const categoryId = toSafeString(value.categoryId);
  if (id.length === 0 || name.length === 0) {
    return null;
  }

  const rawSets = Array.isArray(value.sets) ? value.sets : [];
  const sets = rawSets
    .map((set) => parseExerciseSet(set))
    .filter((set): set is ExerciseSet => set !== null);

  return {
    id,
    name,
    ...(catalogExerciseId.length > 0 ? { catalogExerciseId } : {}),
    ...(category.length > 0 ? { category } : {}),
    ...(categoryId.length > 0 ? { categoryId } : {}),
    sets,
    presetName:
      typeof value.presetName === "string" ? value.presetName : undefined,
  };
};

const parseCalendarDay = (value: unknown): CalendarDay | null => {
  if (!isObjectRecord(value)) {
    return null;
  }

  const rawExercises = Array.isArray(value.exercises) ? value.exercises : [];
  const exercises = rawExercises
    .map((exercise) => parseExercise(exercise))
    .filter((exercise): exercise is Exercise => exercise !== null);

  return {
    exercises,
  };
};

export const readAllTrainingDaysFromStorage = async () => {
  const months = await readAllWorkoutMonthBuckets();
  if (!months) {
    return {};
  }

  const mergedDays: Record<string, CalendarDay> = {};

  Object.values(months).forEach((parsedMonth) => {
    if (!isObjectRecord(parsedMonth)) {
      return;
    }

    Object.entries(parsedMonth).forEach(([dateKey, dayValue]) => {
      const safeDay = parseCalendarDay(dayValue);
      if (!safeDay) {
        return;
      }
      mergedDays[dateKey] = safeDay;
    });
  });

  return mergedDays;
};

