import { useEffect } from "react";
import { useUserStore } from "@/entities/user";
import { useRestTimerStore } from "../slice/restTimerStore";
import { completeRestTimer } from "./completeRestTimer";
import {
  cancelRestTimerNotification,
  syncRestTimerNativeAlarm,
} from "./restTimerLocalNotification";

/**
 * Fires rest-complete notification when `endAt` elapses,
 * even if the /timer page is not mounted (e.g. workout "Отдых" badge).
 */
export const useRestTimerExpiryWatcher = () => {
  const endAt = useRestTimerStore((s) => s.endAt);
  const notificationsEnabled = useUserStore(
    (s) => s.timerCompleteNotificationsEnabled ?? true,
  );

  useEffect(() => {
    void syncRestTimerNativeAlarm(endAt);

    if (endAt == null) {
      return () => {
        void cancelRestTimerNotification();
      };
    }

    const remainingMs = endAt - Date.now();
    const fire = () => {
      completeRestTimer(endAt);
    };

    if (remainingMs <= 0) {
      fire();
      return () => {
        void cancelRestTimerNotification();
      };
    }

    const timeoutId = window.setTimeout(fire, remainingMs);
    return () => {
      window.clearTimeout(timeoutId);
      void cancelRestTimerNotification();
    };
  }, [endAt, notificationsEnabled]);
};
