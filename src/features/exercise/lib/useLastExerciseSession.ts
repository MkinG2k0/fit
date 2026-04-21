import { useEffect, useState } from "react";
import { useCalendarStore } from "@/entities/calendarDay";
import {
  findLastExerciseSession,
  type LastExerciseSession,
} from "@/shared/lib/findLastExerciseSession";

export const useLastExerciseSession = (
  exerciseName: string,
): LastExerciseSession | null => {
  const selectedDate = useCalendarStore((store) => store.selectedDate);
  const [session, setSession] = useState<LastExerciseSession | null>(null);

  useEffect(() => {
    let isDisposed = false;

    const loadSession = async () => {
      const result = await findLastExerciseSession(exerciseName, selectedDate);
      if (!isDisposed) {
        setSession(result);
      }
    };

    void loadSession();

    return () => {
      isDisposed = true;
    };
  }, [exerciseName, selectedDate]);

  return session;
};
