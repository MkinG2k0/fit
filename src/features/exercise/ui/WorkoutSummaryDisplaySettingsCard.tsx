import { useCallback } from "react";
import { Info } from "lucide-react";
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

interface WorkoutSummaryDisplaySettingsCardProps {
  className?: string;
}

export const WorkoutSummaryDisplaySettingsCard = ({
  className,
}: WorkoutSummaryDisplaySettingsCardProps) => {
  const workoutListShowDaySummary = useUserStore(
    (s) => s.workoutListShowDaySummary ?? true,
  );
  const setWorkoutListShowDaySummary = useUserStore(
    (s) => s.setWorkoutListShowDaySummary,
  );

  const handleCheckedChange = useCallback(
    (value: boolean | "indeterminate") => {
      setWorkoutListShowDaySummary(value === true);
    },
    [setWorkoutListShowDaySummary],
  );

  return (
    <Card className={cn("gap-3 py-4", className)}>
      <CardHeader className="px-4">
        <CardTitle className="flex items-center gap-2">
          <Info className="size-5 text-muted-foreground" aria-hidden />
          Общая информация о тренировке
        </CardTitle>
        <CardDescription>
          Сводка по выбранному дню над списком упражнений: число упражнений,
          тоннаж, калории и раскрываемые показатели
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 px-4">
        <div className="flex items-start gap-3 rounded-md border border-border p-3">
          <Checkbox
            id="workout-day-summary-visible"
            checked={workoutListShowDaySummary}
            onCheckedChange={handleCheckedChange}
            aria-describedby="workout-day-summary-visible-hint"
          />
          <div className="grid min-w-0 gap-1">
            <Label
              htmlFor="workout-day-summary-visible"
              className="cursor-pointer text-sm font-medium leading-none"
            >
              Показывать блок над списком упражнений
            </Label>
            <p
              id="workout-day-summary-visible-hint"
              className="text-xs text-muted-foreground"
            >
              Если выключить, карточка со сводкой за день не отображается на
              главном экране.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
