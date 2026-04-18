import { Check, Circle, Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import { Badge } from "@/shared/ui/shadCNComponents/ui/badge";
import { formatKcalOneDecimal, type SetRowCalorieDisplay } from "../calories";
import { cn } from "@/shared/lib/classMerge";

const kcalCellWrap =
  "flex flex-col h-12 min-w-0 items-center justify-center gap-0.5 font-numeric";

const kcalBadgeClass =
  "h-4 shrink-0 px-1 py-0 text-[8px] font-semibold leading-none";

interface ExerciseSetKcalCellProps {
  calorieDisplay: SetRowCalorieDisplay;
  onStart: () => void;
  onComplete: () => void;
}

export const ExerciseSetKcalCell = ({
  calorieDisplay,
  onStart,
  onComplete,
}: ExerciseSetKcalCellProps) => {
  if (calorieDisplay.kind === "done") {
    const { calories } = calorieDisplay;
    const isHr = calories.source === "heart_rate";

    return (
      <Button
        variant="outline"
        className={kcalCellWrap}
        title={isHr ? "По пульсу" : "Оценка по MET (без пульса)"}
      >
        <div
          className={cn(
            "min-w-0 truncate text-sm font-semibold tabular-nums leading-none",
            isHr
              ? "text-green-400"
              : "text-orange-400/80 dark:text-orange-400/60",
          )}
        >
          {isHr ? "" : "~"}
          {formatKcalOneDecimal(calories.kcal)}
        </div>
        <Badge variant={isHr ? "hr" : "met"} className={kcalBadgeClass}>
          {isHr ? "HR" : "MET"}
        </Badge>
      </Button>
    );
  }

  if (calorieDisplay.kind === "active") {
    return (
      <div className={kcalCellWrap}>
        <span className="size-1.5 shrink-0 rounded-full bg-primary animate-pulse" />
        <Button
          type="button"
          variant="secondary"
          className="flex-auto"
          onClick={onComplete}
          aria-label="Завершить подход"
        >
          <Check className="size-4" />
        </Button>
      </div>
    );
  }

  if (calorieDisplay.kind === "calculating") {
    return (
      <div className={kcalCellWrap}>
        <Loader2
          className="size-5 shrink-0 animate-spin text-muted-foreground"
          aria-hidden
        />
      </div>
    );
  }

  return (
    <Button
      type="button"
      size="icon"
      variant="outline"
      onClick={onStart}
      aria-label="Начать подход"
      className="flex-auto w-full h-full"
    >
      <Circle
        className="size-4 shrink-0 text-destructive"
        fill="currentColor"
        strokeWidth={0}
        aria-hidden
      />
    </Button>
  );
};
