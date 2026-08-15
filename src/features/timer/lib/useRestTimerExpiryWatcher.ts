import { useEffect } from "react";
import { App } from "@capacitor/app";
import type { PluginListenerHandle } from "@capacitor/core";
import { useUserStore } from "@/entities/user";
import { useRestTimerStore } from "../slice/restTimerStore";
import { completeRestTimer } from "./completeRestTimer";
import {
  isNativeTimerPlatform,
  reconcileRestTimerOnAppActive,
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
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [endAt, notificationsEnabled]);

  useEffect(() => {
    if (!isNativeTimerPlatform()) {
      return;
    }

    let isMounted = true;
    let appStateListener: PluginListenerHandle | null = null;

    const registerListener = async () => {
      appStateListener = await App.addListener(
        "appStateChange",
        ({ isActive }) => {
          if (isActive) {
            void reconcileRestTimerOnAppActive();
          }
        },
      );
      if (!isMounted) {
        void appStateListener.remove();
      }
    };

    void registerListener();

    return () => {
      isMounted = false;
      void appStateListener?.remove();
    };
  }, []);
};
