import { useMemo } from "react";
import { useCalendarStore } from "@/entities/calendarDay";
import {
  findLastExerciseSession,
  type LastExerciseSession,
} from "@/shared/lib/findLastExerciseSession";

export const useLastExerciseSession = (
  exerciseName: string,
): LastExerciseSession | null => {
  const selectedDate = useCalendarStore((store) => store.selectedDate);

  return useMemo(
    () => findLastExerciseSession(exerciseName, selectedDate),
    [exerciseName, selectedDate],
  );
};
