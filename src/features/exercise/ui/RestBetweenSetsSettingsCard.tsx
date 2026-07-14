import { type ChangeEvent, useCallback } from "react";
import { Timer } from "lucide-react";
import {
  DEFAULT_REST_BETWEEN_SETS_SEC,
  MAX_REST_BETWEEN_SETS_SEC,
  MIN_REST_BETWEEN_SETS_SEC,
  useUserStore,
} from "@/entities/user";
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

interface RestBetweenSetsSettingsCardProps {
  className?: string;
}

export const RestBetweenSetsSettingsCard = ({
  className,
}: RestBetweenSetsSettingsCardProps) => {
  const restBetweenSetsEnabled = useUserStore(
    (s) => s.restBetweenSetsEnabled ?? true,
  );
  const restBetweenSetsSec = useUserStore(
    (s) => s.restBetweenSetsSec ?? DEFAULT_REST_BETWEEN_SETS_SEC,
  );
  const setRestBetweenSetsEnabled = useUserStore(
    (s) => s.setRestBetweenSetsEnabled,
  );
  const setRestBetweenSetsSec = useUserStore((s) => s.setRestBetweenSetsSec);

  const durationMinutes = Math.round(restBetweenSetsSec / 60);

  const handleCheckedChange = useCallback(
    (value: boolean | "indeterminate") => {
      setRestBetweenSetsEnabled(value === true);
    },
    [setRestBetweenSetsEnabled],
  );

  const handleDurationChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const minutes = Number(event.target.value);
      if (!Number.isFinite(minutes)) {
        return;
      }
      setRestBetweenSetsSec(minutes * 60);
    },
    [setRestBetweenSetsSec],
  );

  return (
    <Card className={cn("gap-3 py-4", className)}>
      <CardHeader className="px-4">
        <CardTitle className="flex items-center gap-2">
          <Timer className="size-5 text-muted-foreground" aria-hidden />
          Отдых между подходами
        </CardTitle>
        <CardDescription>
          Автоматический таймер отдыха после добавления подхода. По умолчанию 2
          минуты.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 px-4">
        <div className="flex items-start gap-3 rounded-md border border-border p-3">
          <Checkbox
            id="rest-between-sets-enabled"
            checked={restBetweenSetsEnabled}
            onCheckedChange={handleCheckedChange}
            aria-describedby="rest-between-sets-enabled-hint"
          />
          <div className="grid min-w-0 gap-1">
            <Label
              htmlFor="rest-between-sets-enabled"
              className="cursor-pointer text-sm font-medium leading-none"
            >
              Отдых между подходами
            </Label>
            <p
              id="rest-between-sets-enabled-hint"
              className="text-xs text-muted-foreground"
            >
              Если включено, после «Добавить подход» стартует обратный отсчёт.
              Время видно в карточке «Общая информация о тренировке» и на
              странице таймера.
            </p>
          </div>
        </div>
        {restBetweenSetsEnabled ? (
          <div className="flex items-start gap-3 rounded-md border border-border p-3">
            <div className="grid min-w-0 flex-1 gap-2">
              <Label
                htmlFor="rest-between-sets-duration"
                className="text-sm font-medium leading-none"
              >
                Длительность: {durationMinutes} мин
              </Label>
              <input
                id="rest-between-sets-duration"
                type="range"
                min={Math.ceil(MIN_REST_BETWEEN_SETS_SEC / 60)}
                max={Math.floor(MAX_REST_BETWEEN_SETS_SEC / 60)}
                step={1}
                value={durationMinutes}
                onChange={handleDurationChange}
                className="w-full accent-primary"
              />
              <p className="text-xs text-muted-foreground">
                От {Math.ceil(MIN_REST_BETWEEN_SETS_SEC / 60)} до{" "}
                {Math.floor(MAX_REST_BETWEEN_SETS_SEC / 60)} минут.
              </p>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};
