import { Capacitor } from "@capacitor/core";
import { useUserStore } from "@/entities/user";

/**
 * UI ккал на подход: только нативное приложение и флаг в настройках (по умолчанию выкл.).
 */
export const useWorkoutCaloriesUiEnabled = (): boolean => {
  const flag = useUserStore((s) => s.workoutCaloriesEnabled ?? false);
  return Capacitor.isNativePlatform() && flag;
};
