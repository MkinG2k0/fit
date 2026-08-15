import { type ChangeEvent, useCallback, useEffect, useState } from "react";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import type { PluginListenerHandle } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { Bell } from "lucide-react";
import { useUserStore } from "@/entities/user";
import { cn } from "@/shared/lib/classMerge";
import { Checkbox } from "@/shared/ui/shadCNComponents/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/shadCNComponents/ui/card";
import { Label } from "@/shared/ui/shadCNComponents/ui/label";
import { ensureNotificationPermission } from "../lib/notifications";
import { isNativeTimerPlatform } from "../lib/restTimerLocalNotification";

type WebPermissionState = NotificationPermission | "unsupported";
type PluginPermissionState = "prompt" | "prompt-with-rationale" | "granted" | "denied";

const webPermissionLabel = (permission: WebPermissionState): string => {
  switch (permission) {
    case "granted":
      return "разрешены браузером";
    case "denied":
      return "запрещены в браузере — включите в настройках сайта";
    case "default":
      return "ещё не запрошены";
    case "unsupported":
      return "браузер не поддерживает";
    default:
      return "неизвестно";
  }
};

const pluginPermissionLabel = (permission: PluginPermissionState | null): string => {
  switch (permission) {
    case "granted":
      return "разрешены системой";
    case "denied":
      return "запрещены — включите в настройках приложения";
    case "prompt":
    case "prompt-with-rationale":
      return "ещё не запрошены";
    default:
      return "неизвестно";
  }
};

const readPluginDisplay = async (): Promise<PluginPermissionState | null> => {
  try {
    const status = await LocalNotifications.checkPermissions();
    return status.display;
  } catch (error) {
    console.error("Не удалось проверить разрешение на уведомления:", error);
    return null;
  }
};

const readExactAlarm = async (): Promise<PluginPermissionState | null> => {
  if (Capacitor.getPlatform() !== "android") {
    return null;
  }
  try {
    const status = await LocalNotifications.checkExactNotificationSetting();
    return status.exact_alarm;
  } catch (error) {
    console.error("Не удалось проверить разрешение точных будильников:", error);
    return null;
  }
};

interface TimerNotificationsSettingsCardProps {
  className?: string;
}

export const TimerNotificationsSettingsCard = ({
  className,
}: TimerNotificationsSettingsCardProps) => {
  const isNative = isNativeTimerPlatform();
  const isAndroid = Capacitor.getPlatform() === "android";
  const enabled = useUserStore(
    (s) => s.timerCompleteNotificationsEnabled ?? true,
  );
  const setEnabled = useUserStore(
    (s) => s.setTimerCompleteNotificationsEnabled,
  );
  const volume = useUserStore((s) => s.timerNotificationVolume ?? 1);
  const setTimerNotificationVolume = useUserStore(
    (s) => s.setTimerNotificationVolume,
  );
  const [webPermission, setWebPermission] = useState<WebPermissionState>(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "unsupported";
    }
    return Notification.permission;
  });
  const [pluginDisplay, setPluginDisplay] =
    useState<PluginPermissionState | null>(null);
  const [exactAlarm, setExactAlarm] = useState<PluginPermissionState | null>(
    null,
  );

  const refreshNativeStatuses = useCallback(async () => {
    if (!isNative) {
      return;
    }
    setPluginDisplay(await readPluginDisplay());
    if (isAndroid) {
      setExactAlarm(await readExactAlarm());
    }
  }, [isAndroid, isNative]);

  useEffect(() => {
    if (isNative) {
      void refreshNativeStatuses();
      return;
    }
    if (!("Notification" in window)) {
      return;
    }
    setWebPermission(Notification.permission);
  }, [enabled, isNative, refreshNativeStatuses]);

  useEffect(() => {
    if (!isNative || !enabled) {
      return;
    }

    let isMounted = true;
    let appStateListener: PluginListenerHandle | null = null;

    const registerListener = async () => {
      appStateListener = await App.addListener(
        "appStateChange",
        ({ isActive }) => {
          if (isActive) {
            void refreshNativeStatuses();
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
  }, [enabled, isNative, refreshNativeStatuses]);

  const handleCheckedChange = useCallback(
    (value: boolean | "indeterminate") => {
      const next = value === true;
      setEnabled(next);
      if (next) {
        ensureNotificationPermission();
        if (isNative) {
          void refreshNativeStatuses();
          return;
        }
        if ("Notification" in window) {
          setWebPermission(Notification.permission);
        }
      }
    },
    [isNative, refreshNativeStatuses, setEnabled],
  );

  const handleVolumeChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setTimerNotificationVolume(Number(event.target.value) / 100);
    },
    [setTimerNotificationVolume],
  );

  const handleRequestPermission = useCallback(async () => {
    if (isNative) {
      try {
        await LocalNotifications.requestPermissions();
        await refreshNativeStatuses();
      } catch (error) {
        console.error("Не удалось запросить разрешение на уведомления:", error);
      }
      return;
    }
    if (!("Notification" in window)) {
      return;
    }
    const result = await Notification.requestPermission();
    setWebPermission(result);
  }, [isNative, refreshNativeStatuses]);

  const handleRequestExactAlarm = useCallback(async () => {
    if (!isAndroid) {
      return;
    }
    try {
      await LocalNotifications.changeExactNotificationSetting();
      await refreshNativeStatuses();
    } catch (error) {
      console.error("Не удалось открыть настройки точных будильников:", error);
    }
  }, [isAndroid, refreshNativeStatuses]);

  const showWebRequest = !isNative && webPermission === "default";
  const showNativeRequest = isNative && pluginDisplay !== "granted";
  const showExactAlarmRequest =
    isNative && isAndroid && exactAlarm !== "granted";

  return (
    <Card className={cn("gap-3 py-4", className)}>
      <CardHeader className="px-4">
        <CardTitle className="flex items-center gap-2">
          <Bell className="size-5 text-muted-foreground" aria-hidden />
          Уведомления
        </CardTitle>
        <CardDescription>
          Звук, вибрация и системное уведомление при завершении таймера отдыха
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 px-4">
        <div className="flex items-start gap-3 rounded-md border border-border p-3">
          <Checkbox
            id="timer-complete-notifications"
            checked={enabled}
            onCheckedChange={handleCheckedChange}
            aria-describedby="timer-complete-notifications-hint"
          />
          <div className="grid min-w-0 gap-1">
            <Label
              htmlFor="timer-complete-notifications"
              className="cursor-pointer text-sm font-medium leading-none"
            >
              Уведомление о завершении таймера
            </Label>
            <p
              id="timer-complete-notifications-hint"
              className="text-xs text-muted-foreground"
            >
              Срабатывает на странице таймера и в бейдже «Отдых» во время
              тренировки.
            </p>
          </div>
        </div>
        {enabled ? (
          <div className="flex flex-col gap-2 rounded-md border border-border p-3">
            <p className="text-xs text-muted-foreground">
              {isNative
                ? `Разрешение уведомлений: ${pluginPermissionLabel(pluginDisplay)}`
                : `Разрешение браузера: ${webPermissionLabel(webPermission)}`}
            </p>
            {showWebRequest || showNativeRequest ? (
              <button
                type="button"
                onClick={() => void handleRequestPermission()}
                className="self-start text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Разрешить уведомления
              </button>
            ) : null}
            {showExactAlarmRequest ? (
              <button
                type="button"
                onClick={() => void handleRequestExactAlarm()}
                className="self-start text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Разрешить точные будильники
              </button>
            ) : null}
          </div>
        ) : null}
        {enabled ? (
          <div className="flex items-start gap-3 rounded-md border border-border p-3">
            <div className="grid min-w-0 flex-1 gap-2">
              <Label
                htmlFor="timer-notification-volume"
                className="text-sm font-medium leading-none"
              >
                Громкость уведомления: {Math.round(volume * 100)}%
              </Label>
              <input
                id="timer-notification-volume"
                type="range"
                min={0}
                max={100}
                step={1}
                value={Math.round(volume * 100)}
                onChange={handleVolumeChange}
                className="w-full accent-primary"
              />
              <p className="text-xs text-muted-foreground">
                На заблокированном экране громкость системных уведомлений
              </p>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};
