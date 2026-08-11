import { useCallback } from "react";
import { PanelLeft } from "lucide-react";
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

interface MenuSectionsSettingsCardProps {
  className?: string;
}

export const MenuSectionsSettingsCard = ({
  className,
}: MenuSectionsSettingsCardProps) => {
  const timerMenuEnabled = useUserStore((s) => s.timerMenuEnabled ?? false);
  const setTimerMenuEnabled = useUserStore((s) => s.setTimerMenuEnabled);
  const bodyMetricsMenuEnabled = useUserStore(
    (s) => s.bodyMetricsMenuEnabled ?? false,
  );
  const setBodyMetricsMenuEnabled = useUserStore(
    (s) => s.setBodyMetricsMenuEnabled,
  );
  const loadTableMenuEnabled = useUserStore(
    (s) => s.loadTableMenuEnabled ?? false,
  );
  const setLoadTableMenuEnabled = useUserStore((s) => s.setLoadTableMenuEnabled);
  const activityMenuEnabled = useUserStore(
    (s) => s.activityMenuEnabled ?? false,
  );
  const setActivityMenuEnabled = useUserStore((s) => s.setActivityMenuEnabled);

  const handleTimerCheckedChange = useCallback(
    (value: boolean | "indeterminate") => {
      setTimerMenuEnabled(value === true);
    },
    [setTimerMenuEnabled],
  );

  const handleBodyMetricsCheckedChange = useCallback(
    (value: boolean | "indeterminate") => {
      setBodyMetricsMenuEnabled(value === true);
    },
    [setBodyMetricsMenuEnabled],
  );

  const handleLoadTableCheckedChange = useCallback(
    (value: boolean | "indeterminate") => {
      setLoadTableMenuEnabled(value === true);
    },
    [setLoadTableMenuEnabled],
  );

  const handleActivityCheckedChange = useCallback(
    (value: boolean | "indeterminate") => {
      setActivityMenuEnabled(value === true);
    },
    [setActivityMenuEnabled],
  );

  return (
    <Card className={cn("gap-3 py-4", className)}>
      <CardHeader className="px-4">
        <CardTitle className="flex items-center gap-2">
          <PanelLeft className="size-5 text-muted-foreground" aria-hidden />
          Дополнительные разделы
        </CardTitle>
        <CardDescription>
          Пункты появляются в меню профиля только после включения
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 px-4">
        <div className="flex items-start gap-3 rounded-md border border-border p-3">
          <Checkbox
            id="menu-timer-enabled"
            checked={timerMenuEnabled}
            onCheckedChange={handleTimerCheckedChange}
            aria-describedby="menu-timer-enabled-hint"
          />
          <div className="grid min-w-0 gap-1">
            <Label
              htmlFor="menu-timer-enabled"
              className="cursor-pointer text-sm font-medium leading-none"
            >
              Таймер
            </Label>
            <p
              id="menu-timer-enabled-hint"
              className="text-xs text-muted-foreground"
            >
              Отдельный таймер отдыха между подходами
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-md border border-border p-3">
          <Checkbox
            id="menu-body-metrics-enabled"
            checked={bodyMetricsMenuEnabled}
            onCheckedChange={handleBodyMetricsCheckedChange}
            aria-describedby="menu-body-metrics-enabled-hint"
          />
          <div className="grid min-w-0 gap-1">
            <Label
              htmlFor="menu-body-metrics-enabled"
              className="cursor-pointer text-sm font-medium leading-none"
            >
              Параметры тела
            </Label>
            <p
              id="menu-body-metrics-enabled-hint"
              className="text-xs text-muted-foreground"
            >
              Замеры веса и обхватов с графиком динамики
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-md border border-border p-3">
          <Checkbox
            id="menu-load-table-enabled"
            checked={loadTableMenuEnabled}
            onCheckedChange={handleLoadTableCheckedChange}
            aria-describedby="menu-load-table-enabled-hint"
          />
          <div className="grid min-w-0 gap-1">
            <Label
              htmlFor="menu-load-table-enabled"
              className="cursor-pointer text-sm font-medium leading-none"
            >
              Таблица нагрузок
            </Label>
            <p
              id="menu-load-table-enabled-hint"
              className="text-xs text-muted-foreground"
            >
              16-недельный план процентов от MAX по упражнениям
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-md border border-border p-3">
          <Checkbox
            id="menu-activity-enabled"
            checked={activityMenuEnabled}
            onCheckedChange={handleActivityCheckedChange}
            aria-describedby="menu-activity-enabled-hint"
          />
          <div className="grid min-w-0 gap-1">
            <Label
              htmlFor="menu-activity-enabled"
              className="cursor-pointer text-sm font-medium leading-none"
            >
              Активность
            </Label>
            <p
              id="menu-activity-enabled-hint"
              className="text-xs text-muted-foreground"
            >
              Шаги и калории из Apple Health / Health Connect
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
