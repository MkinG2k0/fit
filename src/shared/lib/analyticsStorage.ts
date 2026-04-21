import type { CalendarDay } from "@/entities/calendarDay";
import type { Exercise, ExerciseSet } from "@/entities/exercise";
import type { RgbaColor } from "react-colorful";
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
  const name = toSafeString(value.name);
  const category = toSafeString(value.category);
  if (id.length === 0 || name.length === 0 || category.length === 0) {
    return null;
  }

  const rawSets = Array.isArray(value.sets) ? value.sets : [];
  const sets = rawSets
    .map((set) => parseExerciseSet(set))
    .filter((set): set is ExerciseSet => set !== null);

  const parsedPresetColor = parsePresetColor(value.presetColor);

  return {
    id,
    name,
    category,
    sets,
    presetName:
      typeof value.presetName === "string" ? value.presetName : undefined,
    presetColor: parsedPresetColor,
  };
};

const parsePresetColor = (value: unknown): RgbaColor | undefined => {
  if (
    !isObjectRecord(value) ||
    typeof value.r !== "number" ||
    typeof value.g !== "number" ||
    typeof value.b !== "number" ||
    typeof value.a !== "number"
  ) {
    return undefined;
  }

  return {
    r: value.r,
    g: value.g,
    b: value.b,
    a: value.a,
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

