import type { CalendarDay } from "@/entities/calendarDay";
import {
  normalizeTrainingSessions,
  type AnalyticsFilters,
} from "@/entities/analytics";
import { compareDateKeysAsc } from "@/entities/analytics/lib/dateKey";
import type { ShareExerciseOption } from "../model/types";

const EMPTY_FILTERS: AnalyticsFilters = {
  period: "365d",
  exerciseId: "",
  category: "",
};

export const listShareWorkoutDateKeys = (
  days: Record<string, CalendarDay>,
): string[] => {
  const sessions = normalizeTrainingSessions(days, EMPTY_FILTERS);

  return sessions
    .filter((session) => session.exercises.length > 0)
    .map((session) => session.dateKey)
    .sort((a, b) => compareDateKeysAsc(b, a));
};

/** Exercises logged on a single training day (for exercise-scope picker). */
export const listShareExercisesForDate = (
  days: Record<string, CalendarDay>,
  dateKey: string,
): ShareExerciseOption[] => {
  if (!dateKey) {
    return [];
  }

  const sessions = normalizeTrainingSessions(days, EMPTY_FILTERS);
  const session = sessions.find((item) => item.dateKey === dateKey);
  if (!session) {
    return [];
  }

  const byId = new Map<string, ShareExerciseOption>();
  for (const exercise of session.exercises) {
    const existing = byId.get(exercise.id);
    if (!existing) {
      byId.set(exercise.id, {
        id: exercise.id,
        name: exercise.name,
        category: exercise.category,
        maxWeight: exercise.maxWeight,
      });
      continue;
    }

    byId.set(exercise.id, {
      ...existing,
      maxWeight: Math.max(existing.maxWeight ?? 0, exercise.maxWeight),
    });
  }

  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name, "ru"));
};
