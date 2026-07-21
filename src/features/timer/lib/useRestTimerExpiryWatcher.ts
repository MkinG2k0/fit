import { useEffect } from "react";
import { useRestTimerStore } from "../slice/restTimerStore";
import { completeRestTimer } from "./completeRestTimer";

/**
 * Fires rest-complete notification when `endAt` elapses,
 * even if the /timer page is not mounted (e.g. workout "Отдых" badge).
 */
export const useRestTimerExpiryWatcher = () => {
  const endAt = useRestTimerStore((s) => s.endAt);

  useEffect(() => {
    if (endAt == null) {
      return;
    }

    const remainingMs = endAt - Date.now();
    const fire = () => {
      completeRestTimer(endAt);
    };

    if (remainingMs <= 0) {
      fire();
      return;
    }

    const timeoutId = window.setTimeout(fire, remainingMs);
    return () => window.clearTimeout(timeoutId);
  }, [endAt]);
};
