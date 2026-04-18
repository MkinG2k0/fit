import { type ChangeEvent, useCallback } from "react";
import { FlaskConical } from "lucide-react";
import {
  MAX_DEFAULT_SET_DURATION_SEC,
  MIN_DEFAULT_SET_DURATION_SEC,
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

interface WorkoutCaloriesSettingsCardProps {
  className?: string;
}

const CARD_CLASS = "gap-3 py-4";
const CARD_HEADER_CLASS = "px-4";
const CARD_CONTENT_CLASS = "px-4";
const ROW_CLASS = "flex items-start gap-3 rounded-md border border-border p-3";

export const WorkoutCaloriesSettingsCard = ({
  className,
}: WorkoutCaloriesSettingsCardProps) => {
  const workoutCaloriesEnabled = useUserStore((s) => s.workoutCaloriesEnabled);
  const setWorkoutCaloriesEnabled = useUserStore(
    (s) => s.setWorkoutCaloriesEnabled,
  );
  const defaultSetDurationSec = useUserStore((s) => s.defaultSetDurationSec);
  const setDefaultSetDurationSec = useUserStore(
    (s) => s.setDefaultSetDurationSec,
  );
  const checked = workoutCaloriesEnabled ?? false;

  const handleCheckedChange = useCallback(
    (value: boolean | "indeterminate") => {
      setWorkoutCaloriesEnabled(value === true);
    },
    [setWorkoutCaloriesEnabled],
  );

  const handleDefaultDurationChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setDefaultSetDurationSec(Number(event.target.value));
    },
    [setDefaultSetDurationSec],
  );

  return (
    <Card className={cn(CARD_CLASS, className)}>
      <CardHeader className={CARD_HEADER_CLASS}>
        <CardTitle className="flex items-center gap-2">
          <FlaskConical className="size-5 text-muted-foreground" aria-hidden />
          Ккал на подход
        </CardTitle>
        <CardDescription>
          Оценка калорий по пульсу (Health Connect) или по MET после добавления
          подхода. Доступно в приложении на Android; на сайте выключено.
        </CardDescription>
      </CardHeader>
      <CardContent className={CARD_CONTENT_CLASS}>
        <div className={ROW_CLASS}>
          <Checkbox
            id="workout-calories-enabled"
            checked={checked}
            onCheckedChange={handleCheckedChange}
            aria-describedby="workout-calories-hint"
          />
          <div className="grid min-w-0 gap-1">
            <Label
              htmlFor="workout-calories-enabled"
              className="cursor-pointer text-sm font-medium leading-none"
            >
              Включить расчёт ккал на подход
            </Label>
            <p
              id="workout-calories-hint"
              className="text-xs text-muted-foreground"
            >
              По умолчанию выключено. После включения в карточке упражнения
              появится колонка «Ккал» и запрос доступа к пульсу на Android.
            </p>
          </div>
        </div>
        {checked ? (
          <div className={ROW_CLASS}>
            <div className="grid min-w-0 flex-1 gap-2">
              <Label
                htmlFor="workout-default-set-duration"
                className="text-sm font-medium leading-none"
              >
                Средняя длительность подхода: {defaultSetDurationSec} сек
              </Label>
              <input
                id="workout-default-set-duration"
                type="range"
                min={MIN_DEFAULT_SET_DURATION_SEC}
                max={MAX_DEFAULT_SET_DURATION_SEC}
                step={1}
                value={defaultSetDurationSec}
                onChange={handleDefaultDurationChange}
                className="w-full accent-primary"
              />
              <p className="text-xs text-muted-foreground">
                Используется для первого окна по пульсу, если нет предыдущего
                подхода с меткой времени.
              </p>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};
