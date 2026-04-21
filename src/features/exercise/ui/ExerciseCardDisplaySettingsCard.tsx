import { useCallback } from "react";
import { LayoutList } from "lucide-react";
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

interface ExerciseCardDisplaySettingsCardProps {
  className?: string;
}

export const ExerciseCardDisplaySettingsCard = ({
  className,
}: ExerciseCardDisplaySettingsCardProps) => {
  const exerciseCardShowLastSessionResult = useUserStore(
    (s) => s.exerciseCardShowLastSessionResult ?? false,
  );
  const setExerciseCardShowLastSessionResult = useUserStore(
    (s) => s.setExerciseCardShowLastSessionResult,
  );

  const handleCheckedChange = useCallback(
    (value: boolean | "indeterminate") => {
      setExerciseCardShowLastSessionResult(value === true);
    },
    [setExerciseCardShowLastSessionResult],
  );

  return (
    <Card className={cn("gap-3 py-4", className)}>
      <CardHeader className="px-4">
        <CardTitle className="flex items-center gap-2">
          <LayoutList className="size-5 text-muted-foreground" aria-hidden />
          Карточка упражнения
        </CardTitle>
        <CardDescription>
          Дополнительные подсказки в списке упражнений на выбранный день
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 px-4">
        <div className="flex items-start gap-3 rounded-md border border-border p-3">
          <Checkbox
            id="exercise-card-last-session"
            checked={exerciseCardShowLastSessionResult}
            onCheckedChange={handleCheckedChange}
            aria-describedby="exercise-card-last-session-hint"
          />
          <div className="grid min-w-0 gap-1">
            <Label
              htmlFor="exercise-card-last-session"
              className="cursor-pointer text-sm font-medium leading-none"
            >
              Показывать результат прошлой тренировки
            </Label>
            <p
              id="exercise-card-last-session-hint"
              className="text-xs text-muted-foreground"
            >
              В свёрнутой карточке появится строка с датой и подходами с
              предыдущей тренировки с этим же упражнением (как под списком
              подходов при раскрытии карточки).
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
