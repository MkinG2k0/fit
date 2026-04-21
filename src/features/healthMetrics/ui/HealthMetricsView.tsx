import { Capacitor } from "@capacitor/core";
import { Activity, Footprints, Info, RefreshCw } from "lucide-react";
import {
  openHealthSettingsIfAndroid,
  type HealthAccessErrorCode,
} from "@/entities/health";
import { cn } from "@/shared/lib";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/ui/shadCNComponents/ui/card";
import { useHealthMetrics } from "../lib/useHealthMetrics";
import { HealthMetricsChart } from "./HealthMetricsChart";

const ERROR_TEXT: Record<HealthAccessErrorCode, string> = {
  not_native:
    "Шаги и калории из Apple Health / Health Connect доступны в установленном приложении на телефоне.",
  sdk_unavailable:
    "На этом устройстве недоступны сервисы здоровья или они не настроены.",
  permission_denied:
    "Разрешите доступ к шагам и активным калориям в настройках здоровья.",
  fetch_failed: "Не удалось загрузить данные. Попробуйте ещё раз.",
};

export const HealthMetricsView = () => {
  const { metrics, series, isDemo, isLoading, errorCode, refresh } =
    useHealthMetrics();

  const handleRefresh = () => {
    void refresh();
  };

  const handleOpenSettings = () => {
    void openHealthSettingsIfAndroid().catch(() => undefined);
  };

  const isAndroid = Capacitor.getPlatform() === "android";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
        <RefreshCw className="size-5 animate-spin" aria-hidden />
        <span>Загрузка…</span>
      </div>
    );
  }

  if (errorCode) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Нет данных</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            {ERROR_TEXT[errorCode]}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={handleRefresh}>
              <RefreshCw className="size-4" />
              Обновить
            </Button>
            {errorCode === "permission_denied" && isAndroid ? (
              <Button type="button" onClick={handleOpenSettings}>
                Настройки Health Connect
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return null;
  }

  return (
    <div className="flex min-w-0 flex-col gap-4">
      {isDemo ? (
        <div
          className="flex w-full min-w-0 gap-3 rounded-lg border border-dashed border-primary/40 bg-primary/5 px-4 py-3 text-sm text-foreground"
          role="status"
        >
          <Info className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
          <div className="min-w-0 space-y-1">
            <p className="font-medium leading-tight">Демонстрация</p>
            <p className="text-muted-foreground leading-snug">
              В браузере нет доступа к Apple Health и Health Connect — показаны
              тестовые шаги и калории. В приложении на iOS или Android
              отображаются ваши реальные данные.
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className={cn("flex flex-col gap-1 rounded-lg border border-border bg-card p-4")}>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Footprints className="size-5 shrink-0" aria-hidden />
            <span className="text-sm font-medium">Шаги сегодня</span>
          </div>
          <p className="text-3xl font-semibold tabular-nums tracking-tight">
            {metrics.steps.toLocaleString("ru-RU")}
          </p>
        </div>
        <div className={cn("flex flex-col gap-1 rounded-lg border border-border bg-card p-4")}>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Activity className="size-5 shrink-0" aria-hidden />
            <span className="text-sm font-medium">Активные калории</span>
          </div>
          <p className="text-3xl font-semibold tabular-nums tracking-tight">
            {metrics.activeCaloriesKcal.toLocaleString("ru-RU")}{" "}
            <span className="text-lg font-normal text-muted-foreground">
              ккал
            </span>
          </p>
        </div>
      </div>
      <HealthMetricsChart data={series} />

      <div className="flex justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={handleRefresh}
        >
          <RefreshCw className="size-4" />
          Обновить
        </Button>
      </div>
    </div>
  );
};
