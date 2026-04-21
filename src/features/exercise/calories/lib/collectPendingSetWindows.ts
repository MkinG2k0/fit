import type { Exercise } from "@/entities/exercise";

export interface PendingSetWindow {
  exercise: Exercise;
  setId: string;
  startTime: Date;
  endTime: Date;
}

const parseIsoDate = (value: string | undefined): Date | null => {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) ? parsed : null;
};

export const collectPendingSetWindows = (
  exercises: Exercise[],
  now: Date = new Date(),
): PendingSetWindow[] => {
  const pending: PendingSetWindow[] = [];

  for (const exercise of exercises) {
    for (const set of exercise.sets) {
      if (set.calories) {
        continue;
      }

      const startTime = parseIsoDate(set.startTime);
      const endTime = parseIsoDate(set.endTime);
      if (!startTime || !endTime) {
        continue;
      }
      if (endTime.getTime() <= startTime.getTime()) {
        continue;
      }
      if (endTime.getTime() > now.getTime()) {
        continue;
      }

      pending.push({
        exercise,
        setId: set.id,
        startTime,
        endTime,
      });
    }
  }

  return pending;
};
