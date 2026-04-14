import dayjs from "dayjs";
import type { CalendarDay } from "@/entities/calendarDay";

export interface TonnageData {
  date: string;
  tonnage: number;
}

export const calculateTonnageForExercise = (
  exerciseObj: Record<string, CalendarDay>,
  exerciseName: string,
): TonnageData[] => {
  return Object.entries(exerciseObj)
    .map(([date, dayData]) => {
      const exercisesForDay = dayData.exercises.filter(
        (ex) => ex.name === exerciseName,
      );

      const totalTonnage = exercisesForDay.reduce((dayTonnage, exercise) => {
        const exerciseTonnage = exercise.sets.reduce((setsTonnage, set) => {
          return setsTonnage + set.weight * set.reps;
        }, 0);
        return dayTonnage + exerciseTonnage;
      }, 0);

      return {
        date,
        tonnage: totalTonnage,
      };
    })
    .filter((item) => item.tonnage > 0)
    .sort((a, b) =>
      dayjs(a.date, "DD-MM-YYYY").diff(dayjs(b.date, "DD-MM-YYYY")),
    );
};

