import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { ensureWorkoutHeartRateReadAccess } from "@/entities/health";
import { useUserStore } from "@/entities/user";

/**
 * На Android запрашиваем чтение пульса только если включён расчёт ккал на подход.
 */
export const WorkoutHealthPermissionInit = () => {
  const workoutCaloriesEnabled = useUserStore((s) => s.workoutCaloriesEnabled);

  useEffect(() => {
    if (
      Capacitor.getPlatform() !== "android" ||
      !Capacitor.isNativePlatform() ||
      !(workoutCaloriesEnabled ?? false)
    ) {
      return;
    }
    void ensureWorkoutHeartRateReadAccess();
  }, [workoutCaloriesEnabled]);

  return null;
};
