import type { Exercise, ExerciseIconId } from "@/entities/exercise";
import type { RgbaColor } from "react-colorful";
import type { CalendarDay } from "../model/types";
import { createRandomUuid, saveDaysToLocalStorage } from "@/shared/lib";
import dayjs from "dayjs";

export const generateExercise = (
  name: string,
  group: string,
  presetName?: string,
  presetColor?: RgbaColor,
  iconId?: ExerciseIconId,
): Exercise => {
  return {
    sets: [
      // {
      //   weight: 0,
      //   reps: 0,
      //   id: createRandomUuid(),
      //   endTime: new Date().toISOString(),
      // },
    ],
    id: createRandomUuid(),
    category: group,
    name: name,
    presetColor: presetColor,
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
