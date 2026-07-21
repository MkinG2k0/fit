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

export const listShareExerciseOptions = (
  days: Record<string, CalendarDay>,
): ShareExerciseOption[] => {
  const sessions = normalizeTrainingSessions(days, EMPTY_FILTERS);
  const byId = new Map<string, ShareExerciseOption>();

  for (const session of sessions) {
    for (const exercise of session.exercises) {
      if (!byId.has(exercise.id)) {
        byId.set(exercise.id, {
          id: exercise.id,
          name: exercise.name,
          category: exercise.category,
        });
      }
    }
  }

  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name, "ru"));
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
