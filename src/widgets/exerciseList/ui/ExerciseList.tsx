import { AnimatePresence, motion, Reorder, useDragControls } from "motion/react";
import { useEffect, useMemo, type PointerEvent as ReactPointerEvent } from "react";
import { AddExercise } from "@/features/addExercise";
import { ExerciseCard } from "@/features/exercise";
import { useWorkoutCaloriesUiEnabled } from "@/features/exercise/lib/useWorkoutCaloriesUiEnabled";
import { useCalendarStore } from "@/entities/calendarDay";
import type { Exercise } from "@/entities/exercise";
import { useUserStore } from "@/entities/user";
import { calcSetVolumeKg } from "@/shared/lib/calcSetVolumeKg";
import { FixedBottomBar } from "@shared/ui";
import { WorkoutSummaryCard } from "./WorkoutSummaryCard";

const listItemMotionProps = {
  initial: { height: 0, opacity: 0 },
  animate: { height: "auto", opacity: 1 },
  exit: { height: 0, opacity: 0 },
  transition: { duration: 0.3, ease: "easeInOut" as const },
};

const ReorderableExerciseItem = ({ exercise }: { exercise: Exercise }) => {
  const dragControls = useDragControls();

  const handleReorderPointerDown = (
    event: ReactPointerEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    dragControls.start(event);
  };

  return (
    <Reorder.Item
      as="div"
      value={exercise.id}
      dragListener={false}
      dragControls={dragControls}
      {...listItemMotionProps}
      className="relative"
    >
      <ExerciseCard
        exercise={exercise}
        onReorderHandlePointerDown={handleReorderPointerDown}
      />
    </Reorder.Item>
  );
};

const StaticExerciseItem = ({ exercise }: { exercise: Exercise }) => (
  <motion.div {...listItemMotionProps} className="relative">
    <ExerciseCard exercise={exercise} />
  </motion.div>
);

export const ExerciseList = () => {
  const showCaloriesUi = useWorkoutCaloriesUiEnabled();
  const workoutListShowDaySummary = useUserStore(
    (s) => s.workoutListShowDaySummary ?? true,
  );
  const exerciseCardReorderEnabled = useUserStore(
    (s) => s.exerciseCardReorderEnabled ?? false,
  );
  const days = useCalendarStore((state) => state.days);
  const selectedDate = useCalendarStore((state) => state.selectedDate);
  const loadDaysFromLocalStorage = useCalendarStore(
    (state) => state.loadDaysFromLocalStorage,
  );
  const reorderExercises = useCalendarStore((state) => state.reorderExercises);
  const observableDate = useCalendarStore((state) => state.observableDate);
  const exerciseArray = useMemo(() => {
    return days[selectedDate.format("DD-MM-YYYY")]?.exercises ?? [];
  }, [days, selectedDate]);

  const exerciseIds = useMemo(
    () => exerciseArray.map((exercise) => exercise.id),
    [exerciseArray],
  );

  const workoutSummary = useMemo(() => {
    return exerciseArray.reduce(
      (acc, exercise) => {
        acc.totalSets += exercise.sets.length;

        for (const set of exercise.sets) {
          const reps = Number.isFinite(set.reps) ? set.reps : 0;
          acc.totalTonnage += calcSetVolumeKg(set.weight, reps);
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
        {exerciseCardReorderEnabled ? (
          <Reorder.Group
            as="div"
            axis="y"
            values={exerciseIds}
            onReorder={reorderExercises}
            className="flex flex-col gap-2"
          >
            <AnimatePresence>
              {exerciseArray.map((ex) => (
                <ReorderableExerciseItem key={ex.id} exercise={ex} />
              ))}
            </AnimatePresence>
          </Reorder.Group>
        ) : (
          <div className="flex flex-col gap-2">
            <AnimatePresence>
              {exerciseArray.map((ex) => (
                <StaticExerciseItem key={ex.id} exercise={ex} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
      <FixedBottomBar>
        <AddExercise />
      </FixedBottomBar>
    </div>
  );
};
