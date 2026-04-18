import { useCallback } from "react";
import { FlaskConical } from "lucide-react";
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
  const checked = workoutCaloriesEnabled ?? false;

  const handleCheckedChange = useCallback(
    (value: boolean | "indeterminate") => {
      setWorkoutCaloriesEnabled(value === true);
    },
    [setWorkoutCaloriesEnabled],
  );

  return (
    <Card className={cn(CARD_CLASS, className)}>
      <CardHeader className={CARD_HEADER_CLASS}>
        <CardTitle className="flex items-center gap-2">
          <FlaskConical className="size-5 text-muted-foreground" aria-hidden />
          Ккал на подход
        </CardTitle>
        <CardDescription>
          Оценка калорий по пульсу (Health Connect) или по MET после каждого
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
      </CardContent>
    </Card>
  );
};
