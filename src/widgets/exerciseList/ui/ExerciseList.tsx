import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo } from "react";
import { AddExercise } from "@/features/addExercise";
import { ExerciseCard } from "@/features/exercise";
import { useWorkoutCaloriesUiEnabled } from "@/features/exercise/lib/useWorkoutCaloriesUiEnabled";
import { useCalendarStore } from "@/entities/calendarDay";
import { useUserStore } from "@/entities/user";
import { cn } from "@shared/lib";
import { FixedBottomBar } from "@shared/ui";
import { WorkoutSummaryCard } from "./WorkoutSummaryCard";

export const ExerciseList = () => {
  const showCaloriesUi = useWorkoutCaloriesUiEnabled();
  const workoutListShowDaySummary = useUserStore(
    (s) => s.workoutListShowDaySummary ?? true,
  );
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
          "min-h-0 flex flex-1 flex-col gap-2 overflow-x-hidden overflow-y-auto pb-[calc(5.75rem+env(safe-area-inset-bottom,0px))]"
        }
      >
        {exerciseArray.length > 0 && workoutListShowDaySummary ? (
          <WorkoutSummaryCard
            showCaloriesUi={showCaloriesUi}
            workoutSummary={workoutSummary}
          />
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
      </div>
      <FixedBottomBar>
        <AddExercise />
      </FixedBottomBar>
    </div>
  );
};
