import { useCallback, useRef, useState } from "react";
import type { Exercise } from "@/entities/exercise";
import { readHeartRateBpmSamples } from "@/entities/health";
import { useCalendarStore } from "@/entities/calendarDay";
import { useUserStore } from "@/entities/user";
import type { IUserPersonalData } from "@/entities/user/model/types";
import type { SetCalorieUiPhase } from "../model/types";
import { calcSetCaloriesWithRetries } from "./calcSetCaloriesWithRetries";
import { isMaleFromGender } from "./genderFromProfile";
import { isWorkoutCalorieProfileComplete } from "./isWorkoutCalorieProfileComplete";

interface UseSetCalorieSessionParams {
  exercise: Exercise;
  onProfileRequired: () => void;
}

export const useSetCalorieSession = ({
  exercise,
  onProfileRequired,
}: UseSetCalorieSessionParams) => {
  const applySetCalories = useCalendarStore((s) => s.applySetCalories);

  const [phaseBySetId, setPhaseBySetId] = useState<
    Record<string, SetCalorieUiPhase>
  >({});
  const startTimeBySetIdRef = useRef<Map<string, Date>>(new Map());

  const onSetStart = useCallback(
    (setId: string) => {
      const personal = useUserStore.getState().personalData;
      if (!isWorkoutCalorieProfileComplete(personal)) {
        onProfileRequired();
        return;
      }
      setPhaseBySetId((prev) => {
        const next = { ...prev };
        for (const key of Object.keys(next)) {
          if (next[key] === "active") {
            delete next[key];
          }
        }
        next[setId] = "active";
        return next;
      });
      startTimeBySetIdRef.current.set(setId, new Date());
    },
    [onProfileRequired],
  );

  const onSetComplete = useCallback(
    async (setId: string) => {
      const start = startTimeBySetIdRef.current.get(setId);
      if (!start) {
        return;
      }
      const end = new Date();
      setPhaseBySetId((p) => ({ ...p, [setId]: "calculating" }));

      const personal: IUserPersonalData = useUserStore.getState().personalData;
      const weight = personal.weight ?? 0;
      const age = personal.age ?? 0;
      const isMale = isMaleFromGender(personal.gender);

      try {
        const result = await calcSetCaloriesWithRetries(
          { startTime: start, endTime: end },
          { userWeightKg: weight, userAge: age, isMale },
          exercise,
          {
            readHeartRateBpm: readHeartRateBpmSamples,
          },
        );
        applySetCalories(exercise, setId, result);
      } finally {
        startTimeBySetIdRef.current.delete(setId);
        setPhaseBySetId((p) => {
          const next = { ...p };
          delete next[setId];
          return next;
        });
      }
    },
    [applySetCalories, exercise],
  );

  return {
    phaseBySetId,
    onSetStart,
    onSetComplete,
  };
};
