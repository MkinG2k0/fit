import dayjs from "dayjs";
import type { CalendarDay } from "@/entities/calendarDay";

const monthYearRegex = /^(0[1-9]|1[0-2])-\d{4}$/;

export const getDaysFromLocalStorage = (date: dayjs.Dayjs) => {
  const prevDate = dayjs(date.add(-1, "month"));
  const prevDateKey = prevDate.format("MM-YYYY");
  const prevDays = JSON.parse(localStorage.getItem(prevDateKey) ?? "{}");
  const nextDate = dayjs(date.add(1, "month"));
  const nextDateKey = nextDate.format("MM-YYYY");
  const nextDays = JSON.parse(localStorage.getItem(nextDateKey) ?? "{}");
  const currentDateKey = date.format("MM-YYYY");
  const currentDays = JSON.parse(localStorage.getItem(currentDateKey) ?? "{}");
  return {
    ...prevDays,
    ...currentDays,
    ...nextDays,
  };
};

export const saveDaysToLocalStorage = (
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
  localStorage.setItem(date.format("MM-YYYY"), JSON.stringify(daysToSave));
};

export const getAllExercisesFromStorage = () => {
  const keys = Object.keys(localStorage).filter((key) =>
    monthYearRegex.test(key),
  );

  let allExercises = [];
  for (const key of keys) {
    const value = localStorage.getItem(key);
    if (value) {
      allExercises.push(JSON.parse(value));
    }
  }
  return allExercises;
};

