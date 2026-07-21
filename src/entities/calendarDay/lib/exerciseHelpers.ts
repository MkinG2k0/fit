import type { Exercise, ExerciseIconId, ExerciseSet } from "@/entities/exercise";
import type { CalendarDay } from "../model/types";
import { createRandomUuid, saveDaysToLocalStorage } from "@/shared/lib";
import dayjs from "dayjs";

export interface GenerateExerciseOptions {
  /**
   * Одна пустая строка подхода (0×0), если расчёт ккал на подход выключен —
   * не нужен лишний клик «Добавить подход».
   */
  singleEmptySet?: boolean;
}

export const generateExercise = (
  name: string,
  _group: string,
  presetName?: string,
  iconId?: ExerciseIconId,
  catalogExerciseId?: string,
  categoryId?: string,
  options?: GenerateExerciseOptions,
): Exercise => {
  const sets: ExerciseSet[] =
    options?.singleEmptySet === true
      ? [{ id: createRandomUuid(), weight: 0, reps: 0 }]
      : [];

  return {
    sets,
    id: createRandomUuid(),
    name: name,
    ...(catalogExerciseId ? { catalogExerciseId } : {}),
    ...(categoryId ? { categoryId } : {}),
    presetName: presetName,
    ...(iconId !== undefined ? { iconId } : {}),
  };
};

export const getDateKeyAndOldExercises = (
  selectedDate: dayjs.Dayjs,
  days: Record<string, CalendarDay>,
) => {
  const dateKey = selectedDate.format("DD-MM-YYYY");
  const oldExercises = days[dateKey]?.exercises ?? [];
  return { dateKey, oldExercises };
};

export const replaceExercises = (
  selectedDate: dayjs.Dayjs,
  days: Record<string, CalendarDay>,
  dateKey: string,
  newExercises: Exercise[],
): Record<string, CalendarDay> => {
  const newDays = {
    ...days,
    [dateKey]: {
      ...days[dateKey],
      exercises: newExercises,
    },
  };
  void saveDaysToLocalStorage(selectedDate, newDays);
  return newDays;
};
