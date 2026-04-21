import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo } from "react";
import { AddExercise } from "@/features/addExercise";
import { ExerciseCard } from "@/features/exercise";
import { formatKcalOneDecimal } from "@/features/exercise/calories";
import { useWorkoutCaloriesUiEnabled } from "@/features/exercise/lib/useWorkoutCaloriesUiEnabled";
import { useCalendarStore } from "@/entities/calendarDay";
import { cn } from "@shared/lib";

export const ExerciseList = () => {
  const showCaloriesUi = useWorkoutCaloriesUiEnabled();
  const days = useCalendarStore((state) => state.days);
  const selectedDate = useCalendarStore((state) => state.selectedDate);
  const loadDaysFromLocalStorage = useCalendarStore(
    (state) => state.loadDaysFromLocalStorage,
  );
  const observableDate = useCalendarStore((state) => state.observableDate);
  const exerciseArray =
    days[selectedDate.format("DD-MM-YYYY")]?.exercises ?? [];

  const workoutSummary = useMemo(() => {
    return exerciseArray.reduce(
      (acc, exercise) => {
        for (const set of exercise.sets) {
          const reps = Number.isFinite(set.reps) ? set.reps : 0;
          const weight = Number.isFinite(set.weight) ? set.weight : 0;
          acc.totalTonnage += reps * weight;

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
        <div className="rounded-xl border border-border bg-card p-2.5 text-card-foreground shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Общая информация о тренировке
          </p>
          <div
            className={cn(
              "mt-2 grid gap-2",
              showCaloriesUi ? "grid-cols-3" : "grid-cols-2",
            )}
          >
            <div className="flex gap-2 items-center  justify-center  rounded-md border border-border/60 bg-muted/40  text-center p-2">
              <div className="text-[10px] font-medium text-muted-foreground">
                Упражнений
              </div>
              <div className=" text-base leading-none font-bold  text-primary">
                {workoutSummary.exerciseCount}
              </div>
            </div>
            {showCaloriesUi ? (
              <div className="flex gap-2 items-center  justify-center  rounded-md border border-border/60 bg-muted/40  text-center p-2">
                <p className="text-[10px] font-medium text-muted-foreground">
                  Калории
                </p>
                <p className=" text-base leading-none font-bold text-primary font-numeric">
                  {formatKcalOneDecimal(workoutSummary.totalKcal)}
                </p>
              </div>
            ) : null}
            <div className="flex gap-2 items-center  justify-center  rounded-md border border-border/60 bg-muted/40  text-center p-2">
              <p className="text-[10px] font-medium text-muted-foreground">
                Общий тоннаж
              </p>
              <p className=" text-base leading-none font-bold text-primary font-numeric">
                {Math.round(workoutSummary.totalTonnage).toLocaleString(
                  "ru-RU",
                )}{" "}
                кг
              </p>
            </div>
          </div>
        </div>
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
