import { Capacitor } from "@capacitor/core";
import { useCallback, useEffect, useRef } from "react";
import { useCalendarStore } from "@/entities/calendarDay";
import { readHeartRateBpmSamples } from "@/entities/health";
import { isWorkoutCalorieProfileComplete, useUserStore } from "@/entities/user";
import { isMaleFromGender } from "./genderFromProfile";
import { recalculateMissingSetCalories } from "./recalculateMissingSetCalories";

const RECALCULATE_INTERVAL_MS = 60_000;

export const useWorkoutCaloriesRecalculationRunner = () => {
  const workoutCaloriesEnabled = useUserStore((s) => s.workoutCaloriesEnabled);
  const personalData = useUserStore((s) => s.personalData);
  const applySetCaloriesBatchByDateKey = useCalendarStore(
    (s) => s.applySetCaloriesBatchByDateKey,
  );
  const isRecalculationEnabled =
    Capacitor.isNativePlatform() &&
    (workoutCaloriesEnabled ?? false) &&
    isWorkoutCalorieProfileComplete(personalData);
  const isRunningRef = useRef(false);

  const runOnce = useCallback(async () => {
    if (isRunningRef.current) {
      return;
    }
    if (!isRecalculationEnabled) {
      return;
    }

    isRunningRef.current = true;
    try {
      const { days, selectedDate } = useCalendarStore.getState();
      const dateKey = selectedDate.format("DD-MM-YYYY");
      const exercises = days[dateKey]?.exercises ?? [];
      if (exercises.length === 0) {
        return;
      }

      const weight = personalData.weight ?? 0;
      const age = personalData.age ?? 0;
      const isMale = isMaleFromGender(personalData.gender);
      const patches = await recalculateMissingSetCalories({
        exercises,
        profile: {
          userWeightKg: weight,
          userAge: age,
          isMale,
        },
        deps: {
          readHeartRateBpm: readHeartRateBpmSamples,
        },
      });

      if (patches.length > 0) {
        applySetCaloriesBatchByDateKey(dateKey, patches);
      }
    } finally {
      isRunningRef.current = false;
    }
  }, [applySetCaloriesBatchByDateKey, isRecalculationEnabled, personalData]);

  useEffect(() => {
    if (!isRecalculationEnabled) {
      return;
    }

    void runOnce();
    const timerId = window.setInterval(() => {
      void runOnce();
    }, RECALCULATE_INTERVAL_MS);

    return () => {
      window.clearInterval(timerId);
    };
  }, [isRecalculationEnabled, runOnce]);
};
