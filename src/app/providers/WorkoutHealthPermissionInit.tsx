import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { ensureWorkoutHeartRateReadAccess } from "@/entities/health";

/**
 * На Android запрашиваем чтение пульса для расчёта ккал на подход (не блокируем UI).
 */
export const WorkoutHealthPermissionInit = () => {
  useEffect(() => {
    if (Capacitor.getPlatform() !== "android" || !Capacitor.isNativePlatform()) {
      return;
    }
    void ensureWorkoutHeartRateReadAccess();
  }, []);

  return null;
};
