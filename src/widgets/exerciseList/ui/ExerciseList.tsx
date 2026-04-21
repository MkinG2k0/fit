import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AddExercise } from "@/features/addExercise";
import { ExerciseCard } from "@/features/exercise";
import { formatKcalOneDecimal } from "@/features/exercise/calories";
import { useWorkoutCaloriesUiEnabled } from "@/features/exercise/lib/useWorkoutCaloriesUiEnabled";
import { useCalendarStore } from "@/entities/calendarDay";
import { cn, formatTonnage } from "@shared/lib";

export const ExerciseList = () => {
  const showCaloriesUi = useWorkoutCaloriesUiEnabled();
  const [isWorkoutExtraOpen, setIsWorkoutExtraOpen] = useState(false);
  const days = useCalendarStore((state) => state.days);
  const selectedDate = useCalendarStore((state) => state.selectedDate);
  const loadDaysFromLocalStorage = useCalendarStore(
    (state) => state.loadDaysFromLocalStorage,
  );
  const observableDate = useCalendarStore((state) => state.observableDate);
  const exerciseArray = useMemo(() => {
    return days[selectedDate.format("DD-MM-YYYY")]?.exercises ?? [];
  }, [days, selectedDate]);

  const workoutSummary = useMemo(() => {
    return exerciseArray.reduce(
      (acc, exercise) => {
        acc.totalSets += exercise.sets.length;

        for (const set of exercise.sets) {
          const reps = Number.isFinite(set.reps) ? set.reps : 0;
          const weight = Number.isFinite(set.weight) ? set.weight : 0;
          acc.totalTonnage += reps * weight;
          acc.totalReps += reps;
          if (weight > acc.maxWeightKg) {
            acc.maxWeightKg = weight;
          }

          const setKcal = set.calories?.kcal;
          if (typeof setKcal === "number" && Number.isFinite(setKcal)) {
            acc.totalKcal += setKcal;
          }
        }

        return acc;
      },
      {
        exerciseCount: exerciseArray.length,
        totalKcal: 0,
        totalTonnage: 0,
        totalSets: 0,
        totalReps: 0,
        maxWeightKg: 0,
      },
    );
  }, [exerciseArray]);

  useEffect(() => {
    void loadDaysFromLocalStorage(observableDate);
  }, [observableDate, loadDaysFromLocalStorage]);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        className={
          "min-h-0 flex flex-1 flex-col gap-2 overflow-x-hidden overflow-y-auto"
        }
      >
        {exerciseArray.length > 0 ? (
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
        ) : null}
        <AnimatePresence>
          {exerciseArray.map((ex, index, array) => (
            <motion.div
              key={ex.id}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={cn("", index === array.length ? "mb-8" : "")}
            >
              <ExerciseCard key={ex.id} exercise={ex} />
            </motion.div>
          ))}
        </AnimatePresence>
        <div className={"mb-26"}></div>
      </div>
      <div className={"fixed bottom-0 left-0 right-0 p-2"}>
        <AddExercise />
      </div>
    </div>
  );
};
