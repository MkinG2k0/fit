import { useCallback, useState } from "react";
import type { Exercise } from "@/entities/exercise";
import { readHeartRateBpmSamples } from "@/entities/health";
import { useCalendarStore } from "@/entities/calendarDay";
import { useUserStore } from "@/entities/user";
import type { IUserPersonalData } from "@/entities/user/model/types";
import type { SetCalorieUiPhase, SetCalorieWindowInput } from "../model/types";
import { calcSetCaloriesWithRetries } from "./calcSetCaloriesWithRetries";
import { isMaleFromGender } from "./genderFromProfile";
import { isWorkoutCalorieProfileComplete } from "./isWorkoutCalorieProfileComplete";

interface UseSetCalorieSessionParams {
  exercise: Exercise;
  onProfileRequired: () => void;
  /** На web не показываем UI ккал — хук не меняет состояние. */
  enabled?: boolean;
}

export const useSetCalorieSession = ({
  exercise,
  onProfileRequired,
  enabled = true,
}: UseSetCalorieSessionParams) => {
  const applySetCalories = useCalendarStore((s) => s.applySetCalories);

  const [phaseBySetId, setPhaseBySetId] = useState<
    Record<string, SetCalorieUiPhase>
  >({});

  const runSetCaloriesAfterAdd = useCallback(
    async (setId: string, window: SetCalorieWindowInput) => {
      if (!enabled) {
        return;
      }
      const personal = useUserStore.getState().personalData;
      if (!isWorkoutCalorieProfileComplete(personal)) {
        onProfileRequired();
        return;
      }

      setPhaseBySetId((p) => ({ ...p, [setId]: "calculating" }));

      const profile: IUserPersonalData = useUserStore.getState().personalData;
      const weight = profile.weight ?? 0;
      const age = profile.age ?? 0;
      const isMale = isMaleFromGender(profile.gender);

      try {
        const result = await calcSetCaloriesWithRetries(
          window,
          { userWeightKg: weight, userAge: age, isMale },
          exercise,
          {
            readHeartRateBpm: readHeartRateBpmSamples,
          },
        );
        applySetCalories(exercise, setId, result);
      } finally {
        setPhaseBySetId((p) => {
          const next = { ...p };
          delete next[setId];
          return next;
        });
      }
    },
    [applySetCalories, enabled, exercise, onProfileRequired],
  );

  return {
    phaseBySetId,
    runSetCaloriesAfterAdd,
  };
};
