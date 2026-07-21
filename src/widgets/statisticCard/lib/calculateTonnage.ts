import type { CalendarDay } from "@/entities/calendarDay";
import {
  calculateExerciseTonnageTrend,
  normalizeTrainingSessions,
} from "@/entities/analytics";

export interface TonnageData {
  date: string;
  tonnage: number;
  maxWeight: number;
}

export const calculateTonnageForExercise = (
  exerciseObj: Record<string, CalendarDay>,
  exerciseName: string,
  catalogExerciseId?: string,
): TonnageData[] => {
  const normalizedSessions = normalizeTrainingSessions(exerciseObj, {
    period: "90d",
    exerciseId: "",
    category: "",
  });

  return calculateExerciseTonnageTrend(normalizedSessions, {
    catalogExerciseId,
    exerciseName,
  });
};

