import { useCallback } from "react";
import { LayoutList } from "lucide-react";
import { useUserStore } from "@/entities/user";
import { cn } from "@/shared/lib/classMerge";
import { Checkbox } from "@/shared/ui/shadCNComponents/ui/checkbox";
import { useWorkoutCaloriesUiEnabled } from "../lib/useWorkoutCaloriesUiEnabled";
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
  const workoutCaloriesUiEnabled = useWorkoutCaloriesUiEnabled();
  const exerciseCardShowLastSessionResult = useUserStore(
    (s) => s.exerciseCardShowLastSessionResult ?? false,
  );
  const setExerciseCardShowLastSessionResult = useUserStore(
    (s) => s.setExerciseCardShowLastSessionResult,
  );
  const exerciseCardShowKcalInHeader = useUserStore(
    (s) => s.exerciseCardShowKcalInHeader ?? false,
  );
  const setExerciseCardShowKcalInHeader = useUserStore(
    (s) => s.setExerciseCardShowKcalInHeader,
  );
  const exerciseCardShowTotalVolumeInHeader = useUserStore(
    (s) => s.exerciseCardShowTotalVolumeInHeader ?? true,
  );
  const setExerciseCardShowTotalVolumeInHeader = useUserStore(
    (s) => s.setExerciseCardShowTotalVolumeInHeader,
  );
  const exerciseCardReorderEnabled = useUserStore(
    (s) => s.exerciseCardReorderEnabled ?? false,
  );
  const setExerciseCardReorderEnabled = useUserStore(
    (s) => s.setExerciseCardReorderEnabled,
  );
  const aiFillEnabled = useUserStore((s) => s.aiFillEnabled ?? false);
  const setAiFillEnabled = useUserStore((s) => s.setAiFillEnabled);

  const handleLastSessionCheckedChange = useCallback(
    (value: boolean | "indeterminate") => {
      setExerciseCardShowLastSessionResult(value === true);
    },
    [setExerciseCardShowLastSessionResult],
  );

  const handleKcalHeaderCheckedChange = useCallback(
    (value: boolean | "indeterminate") => {
      setExerciseCardShowKcalInHeader(value === true);
    },
    [setExerciseCardShowKcalInHeader],
  );

  const handleVolumeHeaderCheckedChange = useCallback(
    (value: boolean | "indeterminate") => {
      setExerciseCardShowTotalVolumeInHeader(value === true);
    },
    [setExerciseCardShowTotalVolumeInHeader],
  );

  const handleReorderCheckedChange = useCallback(
    (value: boolean | "indeterminate") => {
      setExerciseCardReorderEnabled(value === true);
    },
    [setExerciseCardReorderEnabled],
  );

  const handleAiFillCheckedChange = useCallback(
    (value: boolean | "indeterminate") => {
      setAiFillEnabled(value === true);
    },
    [setAiFillEnabled],
  );

  return (
    <Card className={cn("gap-3 py-4", className)}>
      <CardHeader className="px-4">
        <CardTitle className="flex items-center gap-2">
          <LayoutList className="size-5 text-muted-foreground" aria-hidden />
          Карточка упражнения
        </CardTitle>
        <CardDescription>
          Внешний вид свёрнутой карточки в списке упражнений на выбранный день
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 px-4">
        <div className="flex items-start gap-3 rounded-md border border-border p-3">
          <Checkbox
            id="exercise-card-total-volume-header"
            checked={exerciseCardShowTotalVolumeInHeader}
            onCheckedChange={handleVolumeHeaderCheckedChange}
            aria-describedby="exercise-card-total-volume-header-hint"
          />
          <div className="grid min-w-0 gap-1">
            <Label
              htmlFor="exercise-card-total-volume-header"
              className="cursor-pointer text-sm font-medium leading-none"
            >
              Показывать суммарный объём в шапке
            </Label>
            <p
              id="exercise-card-total-volume-header-hint"
              className="text-xs text-muted-foreground"
            >
              Число справа от названия: сумма «повторения × вес» по всем подходам
              (тоннаж за упражнение).
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-md border border-border p-3">
          <Checkbox
            id="exercise-card-kcal-header"
            checked={exerciseCardShowKcalInHeader}
            onCheckedChange={handleKcalHeaderCheckedChange}
            disabled={!workoutCaloriesUiEnabled}
            aria-describedby="exercise-card-kcal-header-hint"
          />
          <div className="grid min-w-0 gap-1">
            <Label
              htmlFor="exercise-card-kcal-header"
              className={cn(
                "text-sm font-medium leading-none",
                workoutCaloriesUiEnabled ? "cursor-pointer" : "cursor-not-allowed",
              )}
            >
              Показывать калории в шапке
            </Label>
            <p
              id="exercise-card-kcal-header-hint"
              className="text-xs text-muted-foreground"
            >
              {workoutCaloriesUiEnabled
                ? "Оценка ккал по завершённым подходам — рядом с объёмом, если есть данные."
                : "Доступно только при включённом учёте ккал в тренировке в приложении на устройстве."}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-md border border-border p-3">
          <Checkbox
            id="exercise-card-last-session"
            checked={exerciseCardShowLastSessionResult}
            onCheckedChange={handleLastSessionCheckedChange}
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
              Показывает результат прошлой тренировки в свёрнутой карточке и при
              раскрытии. Первый подход и каждый новый по кнопке «Добавить подход»
              подставляют повторения и вес из соответствующего подхода прошлой
              тренировки (если подходов было меньше — берётся последний).
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-md border border-border p-3">
          <Checkbox
            id="exercise-card-reorder"
            checked={exerciseCardReorderEnabled}
            onCheckedChange={handleReorderCheckedChange}
            aria-describedby="exercise-card-reorder-hint"
          />
          <div className="grid min-w-0 gap-1">
            <Label
              htmlFor="exercise-card-reorder"
              className="cursor-pointer text-sm font-medium leading-none"
            >
              Перетаскивание карточек
            </Label>
            <p
              id="exercise-card-reorder-hint"
              className="text-xs text-muted-foreground"
            >
              Показывает ручку слева на карточке: можно менять порядок упражнений
              в списке дня. Если выключить — ручка скрыта, порядок не меняется
              перетаскиванием.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-md border border-border p-3">
          <Checkbox
            id="exercise-card-ai-fill"
            checked={aiFillEnabled}
            onCheckedChange={handleAiFillCheckedChange}
            aria-describedby="exercise-card-ai-fill-hint"
          />
          <div className="grid min-w-0 gap-1">
            <Label
              htmlFor="exercise-card-ai-fill"
              className="cursor-pointer text-sm font-medium leading-none"
            >
              Показывать кнопку ИИ-заполнения
            </Label>
            <p
              id="exercise-card-ai-fill-hint"
              className="text-xs text-muted-foreground"
            >
              Экспериментальное автозаполнение подходов по истории упражнения.
              Если выключить, кнопка «ИИ-заполнение» скрыта в раскрытой карточке.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
