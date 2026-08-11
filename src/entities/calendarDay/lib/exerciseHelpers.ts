import type { Exercise, ExerciseIconId, ExerciseSet } from "@/entities/exercise";
import type { CalendarDay } from "../model/types";
import { createRandomUuid, saveDaysToLocalStorage } from "@/shared/lib";
import dayjs from "dayjs";

export const generateExercise = (
  name: string,
  _group: string,
  presetName?: string,
  iconId?: ExerciseIconId,
  catalogExerciseId?: string,
  categoryId?: string,
): Exercise => {
  const sets: ExerciseSet[] = [];

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
