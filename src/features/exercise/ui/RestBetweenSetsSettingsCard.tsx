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

const REST_DURATION_STEP_SEC = 30;

const sliderMinSec =
  Math.ceil(MIN_REST_BETWEEN_SETS_SEC / REST_DURATION_STEP_SEC) *
  REST_DURATION_STEP_SEC;
const sliderMaxSec =
  Math.floor(MAX_REST_BETWEEN_SETS_SEC / REST_DURATION_STEP_SEC) *
  REST_DURATION_STEP_SEC;

const formatRestDurationLabel = (sec: number): string => {
  const minutes = Math.floor(sec / 60);
  const seconds = sec % 60;
  if (seconds === 0) {
    return `${minutes} мин`;
  }
  if (minutes === 0) {
    return `${seconds} сек`;
  }
  return `${minutes} мин ${seconds} сек`;
};

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

  const durationSec = Math.min(
    sliderMaxSec,
    Math.max(
      sliderMinSec,
      Math.round(restBetweenSetsSec / REST_DURATION_STEP_SEC) *
        REST_DURATION_STEP_SEC,
    ),
  );

  const handleCheckedChange = useCallback(
    (value: boolean | "indeterminate") => {
      setRestBetweenSetsEnabled(value === true);
    },
    [setRestBetweenSetsEnabled],
  );

  const handleDurationChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const sec = Number(event.target.value);
      if (!Number.isFinite(sec)) {
        return;
      }
      setRestBetweenSetsSec(sec);
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
                Длительность: {formatRestDurationLabel(durationSec)}
              </Label>
              <input
                id="rest-between-sets-duration"
                type="range"
                min={sliderMinSec}
                max={sliderMaxSec}
                step={REST_DURATION_STEP_SEC}
                value={durationSec}
                onChange={handleDurationChange}
                className="w-full accent-primary"
              />
              <p className="text-xs text-muted-foreground">
                От {formatRestDurationLabel(sliderMinSec)} до{" "}
                {formatRestDurationLabel(sliderMaxSec)}, шаг 30 сек.
              </p>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};
