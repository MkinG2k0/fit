import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { formatKcalOneDecimal } from "@/features/exercise/calories";
import { cn, formatTonnage } from "@shared/lib";

export interface WorkoutSummary {
  exerciseCount: number;
  totalKcal: number;
  totalTonnage: number;
  totalSets: number;
  totalReps: number;
  maxWeightKg: number;
}

interface WorkoutSummaryCardProps {
  showCaloriesUi: boolean;
  workoutSummary: WorkoutSummary;
}

export const WorkoutSummaryCard = ({
  showCaloriesUi,
  workoutSummary,
}: WorkoutSummaryCardProps) => {
  const [isWorkoutExtraOpen, setIsWorkoutExtraOpen] = useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-expanded={isWorkoutExtraOpen}
      aria-label="Общая информация о тренировке. Нажмите, чтобы показать или скрыть дополнительные показатели."
      className="cursor-pointer rounded-xl border border-border bg-card p-2.5 text-card-foreground shadow-sm outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      onClick={() => setIsWorkoutExtraOpen((prev) => !prev)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setIsWorkoutExtraOpen((prev) => !prev);
        }
      }}
    >
      <div className="flex w-full items-center justify-between gap-2 text-left">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Общая информация о тренировке
        </p>
        {isWorkoutExtraOpen ? (
          <ChevronUp className="size-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        )}
      </div>
      <div
        className={cn(
          "mt-2 grid gap-2",
          showCaloriesUi ? "grid-cols-3" : "grid-cols-2",
        )}
      >
        <div className="flex gap-2 items-center justify-center rounded-md border border-border/60 bg-muted/40 p-2 text-center">
          <div className="text-[10px] font-medium text-muted-foreground">
            Упражнений
          </div>
          <div className="text-base leading-none font-bold text-primary">
            {workoutSummary.exerciseCount}
          </div>
        </div>
        {showCaloriesUi ? (
          <div className="flex gap-2 items-center justify-center rounded-md border border-border/60 bg-muted/40 p-2 text-center">
            <p className="text-[10px] font-medium text-muted-foreground">
              Калории
            </p>
            <p className="text-base leading-none font-bold text-primary font-numeric">
              {formatKcalOneDecimal(workoutSummary.totalKcal)}
            </p>
          </div>
        ) : null}
        <div className="flex gap-2 items-center justify-center rounded-md border border-border/60 bg-muted/40 p-2 text-center">
          <p className="text-[10px] font-medium text-muted-foreground">
            Общий тоннаж
          </p>
          <p className="text-base leading-none font-bold text-primary font-numeric">
            {formatTonnage(workoutSummary.totalTonnage)}
          </p>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {isWorkoutExtraOpen ? (
          <motion.div
            key="workout-summary-extra"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="mt-2 grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center justify-center gap-1 rounded-md border border-border/60 bg-muted/40 p-2 text-center">
                <span className="text-[10px] font-medium text-muted-foreground">
                  Подходов
                </span>
                <span className="text-base leading-none font-bold text-primary font-numeric">
                  {workoutSummary.totalSets}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center gap-1 rounded-md border border-border/60 bg-muted/40 p-2 text-center">
                <span className="text-[10px] font-medium text-muted-foreground">
                  Повторений
                </span>
                <span className="text-base leading-none font-bold text-primary font-numeric">
                  {workoutSummary.totalReps}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center gap-1 rounded-md border border-border/60 bg-muted/40 p-2 text-center">
                <span className="text-[10px] font-medium text-muted-foreground">
                  Макс. вес
                </span>
                <span className="text-base leading-none font-bold text-primary font-numeric">
                  {formatTonnage(workoutSummary.maxWeightKg)}
                </span>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};
