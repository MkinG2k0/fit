import { useCalendarStore } from "@/entities/calendarDay";
import {
  MONTH_YEAR_STORAGE_KEY_REGEX,
  readAllWorkoutMonthBuckets,
  writeWorkoutMonthBucket,
} from "@/shared/lib/storage";
import { isPlainObject } from "@/shared/lib/appSettingsTransfer";

const WORKOUT_JOURNAL_EXPORT_VERSION = 1;

const isCalendarDayShape = (value: unknown): boolean => {
  if (!isPlainObject(value)) {
    return false;
  }
  return Array.isArray(value.exercises);
};

const assertMonthBucket = (monthKey: string, bucket: unknown): void => {
  if (!isPlainObject(bucket)) {
    throw new Error(`Журнал: месяц «${monthKey}» должен быть объектом дней.`);
  }
  for (const [dayKey, day] of Object.entries(bucket)) {
    if (typeof dayKey !== "string") {
      throw new Error(`Журнал: некорректный ключ дня в «${monthKey}».`);
    }
    if (!isCalendarDayShape(day)) {
      throw new Error(
        `Журнал: день «${dayKey}» в «${monthKey}» должен содержать массив exercises.`,
      );
    }
  }
};

const isWorkoutJournalImportPayload = (
  value: unknown,
): value is { months: Record<string, unknown> } => {
  if (!isPlainObject(value)) {
    return false;
  }
  if (!isPlainObject(value.months)) {
    return false;
  }
  return true;
};

export const exportWorkoutJournalSnapshot = async (): Promise<unknown | null> => {
  const months = await readAllWorkoutMonthBuckets();
  if (!months) {
    return null;
  }
  return {
    version: WORKOUT_JOURNAL_EXPORT_VERSION,
    months,
  };
};

export const importWorkoutJournalSnapshot = async (
  payload: unknown,
): Promise<void> => {
  if (!isWorkoutJournalImportPayload(payload)) {
    throw new Error("Журнал: ожидался объект с полем months.");
  }
  for (const monthKey of Object.keys(payload.months)) {
    if (!MONTH_YEAR_STORAGE_KEY_REGEX.test(monthKey)) {
      throw new Error(
        `Журнал: неизвестный ключ «${monthKey}» (ожидается формат MM-YYYY).`,
      );
    }
    const bucket = payload.months[monthKey];
    assertMonthBucket(monthKey, bucket);
    await writeWorkoutMonthBucket(monthKey, bucket);
  }
  const calendar = useCalendarStore.getState();
  await calendar.loadDaysFromLocalStorage(calendar.observableDate);
};
