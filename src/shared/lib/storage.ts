import dayjs from "dayjs";
import type { CalendarDay } from "@/entities/calendarDay";
import {
  appStorage,
  listWorkoutMonthKeys,
  registerWorkoutMonthKey,
} from "./storageAdapter";

/** Ключи месяцев тренировочного журнала в localStorage (`MM-YYYY`). */
export const MONTH_YEAR_STORAGE_KEY_REGEX = /^(0[1-9]|1[0-2])-\d{4}$/;

const monthYearRegex = MONTH_YEAR_STORAGE_KEY_REGEX;

const readMonthBucket = async (
  monthKey: string,
): Promise<Record<string, CalendarDay>> => {
  const parsed = await appStorage.getJson<unknown>(monthKey);
  if (!parsed || typeof parsed !== "object") {
    return {};
  }

  return parsed as Record<string, CalendarDay>;
};

/** Параллельное чтение выбранных месяцев журнала (ключ `MM-YYYY`). */
export const readWorkoutMonthBucketsForKeys = async (
  monthKeys: string[],
): Promise<Map<string, Record<string, CalendarDay>>> => {
  const filtered = [...new Set(monthKeys)].filter((key) =>
    MONTH_YEAR_STORAGE_KEY_REGEX.test(key),
  );
  if (filtered.length === 0) {
    return new Map();
  }
  const entries = await Promise.all(
    filtered.map(
      async (key) => [key, await readMonthBucket(key)] as const,
    ),
  );
  return new Map(entries);
};

export const getDaysFromLocalStorage = async (date: dayjs.Dayjs) => {
  const prevDate = dayjs(date.add(-1, "month"));
  const prevDateKey = prevDate.format("MM-YYYY");
  const nextDate = dayjs(date.add(1, "month"));
  const nextDateKey = nextDate.format("MM-YYYY");
  const currentDateKey = date.format("MM-YYYY");

  const [prevDays, currentDays, nextDays] = await Promise.all([
    readMonthBucket(prevDateKey),
    readMonthBucket(currentDateKey),
    readMonthBucket(nextDateKey),
  ]);

  return {
    ...prevDays,
    ...currentDays,
    ...nextDays,
  };
};

export const saveDaysToLocalStorage = async (
  date: dayjs.Dayjs,
  newDays: Record<string, CalendarDay>,
) => {
  let daysToSave = {};
  for (const key in newDays) {
    if (key.includes(date.format("MM-YYYY"))) {
      daysToSave = {
        ...daysToSave,
        [key]: newDays[key],
      };
    }
  }
  const monthKey = date.format("MM-YYYY");
  await appStorage.setJson(monthKey, daysToSave);
  await registerWorkoutMonthKey(monthKey, MONTH_YEAR_STORAGE_KEY_REGEX);
};

export const getAllExercisesFromStorage = async () => {
  const keys = await listWorkoutMonthKeys(monthYearRegex);

  const allExercises = [];
  for (const key of keys) {
    const value = await appStorage.getString(key);
    if (value) {
      try {
        allExercises.push(JSON.parse(value));
      } catch {
        continue;
      }
    }
  }
  return allExercises;
};

/** Снимок всех сохранённых месяцев журнала (объект дней по ключу `DD-MM-YYYY`). */
export const readAllWorkoutMonthBuckets = async (): Promise<Record<
  string,
  unknown
> | null> => {
  const keys = await listWorkoutMonthKeys(MONTH_YEAR_STORAGE_KEY_REGEX);
  if (keys.length === 0) {
    return null;
  }
  const months: Record<string, unknown> = {};
  for (const key of keys) {
    const raw = await appStorage.getString(key);
    if (!raw) {
      continue;
    }
    try {
      months[key] = JSON.parse(raw) as unknown;
    } catch {
      continue;
    }
  }
  return Object.keys(months).length > 0 ? months : null;
};

export const writeWorkoutMonthBucket = async (
  monthKey: string,
  bucket: unknown,
) => {
  if (!MONTH_YEAR_STORAGE_KEY_REGEX.test(monthKey)) {
    throw new Error(`Некорректный ключ месяца: ${monthKey}`);
  }
  await appStorage.setJson(monthKey, bucket);
  await registerWorkoutMonthKey(monthKey, MONTH_YEAR_STORAGE_KEY_REGEX);
};
