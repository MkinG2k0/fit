import type { CalendarDay } from "@/entities/calendarDay";
import {
  calculateExerciseTonnageTrend,
  normalizeTrainingSessions,
} from "@/entities/analytics";

export interface TonnageData {
  date: string;
  tonnage: number;
}

export const calculateTonnageForExercise = (
  exerciseObj: Record<string, CalendarDay>,
  exerciseName: string,
): TonnageData[] => {
  const normalizedSessions = normalizeTrainingSessions(exerciseObj, {
    period: "90d",
    exerciseName: "",
    category: "",
  });

  return calculateExerciseTonnageTrend(normalizedSessions, exerciseName);
};

