import type { Exercise } from "@/entities/exercise";
import type { RgbaColor } from "react-colorful";
import type { CalendarDay } from "../model/types";
import { saveDaysToLocalStorage } from "@/shared/lib/storage";
import dayjs from "dayjs";

export const generateExercise = (
  name: string,
  group: string,
  presetName?: string,
  presetColor?: RgbaColor,
): Exercise => {
  return {
    sets: [
      {
        weight: 0,
        reps: 0,
        id: crypto.randomUUID(),
      },
    ],
    id: crypto.randomUUID(),
    category: group,
    name: name,
    presetColor: presetColor,
    presetName: presetName,
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
  saveDaysToLocalStorage(selectedDate, newDays);
  return newDays;
};
