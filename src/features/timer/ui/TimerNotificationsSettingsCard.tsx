import { useCallback, useEffect, useState } from "react";
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

type PermissionState = NotificationPermission | "unsupported";

const permissionLabel = (permission: PermissionState): string => {
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

interface TimerNotificationsSettingsCardProps {
  className?: string;
}

export const TimerNotificationsSettingsCard = ({
  className,
}: TimerNotificationsSettingsCardProps) => {
  const enabled = useUserStore(
    (s) => s.timerCompleteNotificationsEnabled ?? true,
  );
  const setEnabled = useUserStore(
    (s) => s.setTimerCompleteNotificationsEnabled,
  );
  const [permission, setPermission] = useState<PermissionState>(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "unsupported";
    }
    return Notification.permission;
  });

  useEffect(() => {
    if (!("Notification" in window)) {
      return;
    }
    setPermission(Notification.permission);
  }, [enabled]);

  const handleCheckedChange = useCallback(
    (value: boolean | "indeterminate") => {
      const next = value === true;
      setEnabled(next);
      if (next) {
        ensureNotificationPermission();
        if ("Notification" in window) {
          setPermission(Notification.permission);
        }
      }
    },
    [setEnabled],
  );

  const handleRequestPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      return;
    }
    const result = await Notification.requestPermission();
    setPermission(result);
  }, []);

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
              Разрешение браузера: {permissionLabel(permission)}
            </p>
            {permission === "default" ? (
              <button
                type="button"
                onClick={() => void handleRequestPermission()}
                className="self-start text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Разрешить уведомления
              </button>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};
