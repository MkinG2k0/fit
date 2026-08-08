import { useEffect, useState } from "react";
import { useCalendarStore } from "@/entities/calendarDay";
import {
  findCatalogExerciseById,
  useExerciseStore,
  type MeasurementType,
} from "@/entities/exercise";
import {
  findLastExerciseSession,
  type LastExerciseSession,
} from "@/shared/lib/findLastExerciseSession";

export const useLastExerciseSession = (
  exerciseName: string,
  catalogExerciseId?: string,
): LastExerciseSession | null => {
  const selectedDate = useCalendarStore((store) => store.selectedDate);
  const catalogExercises = useExerciseStore((store) => store.exercises);
  const measurementType: MeasurementType | undefined = findCatalogExerciseById(
    catalogExercises,
    catalogExerciseId ?? "",
  )?.measurementType;
  const [session, setSession] = useState<LastExerciseSession | null>(null);

  useEffect(() => {
    let isDisposed = false;

    const loadSession = async () => {
      const result = await findLastExerciseSession(
        exerciseName,
        selectedDate,
        catalogExerciseId,
        measurementType,
      );
      if (!isDisposed) {
        setSession(result);
      }
    };

    void loadSession();

    return () => {
      isDisposed = true;
    };
  }, [catalogExerciseId, exerciseName, measurementType, selectedDate]);

  return session;
};
