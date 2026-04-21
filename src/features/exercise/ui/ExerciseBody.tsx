import { Trash2 } from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as motion from "motion/react-client";
import { type ChangeEvent, useCallback, useRef } from "react";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import { useCalendarStore } from "@/entities/calendarDay";
import type { Exercise, ExerciseSet } from "@/entities/exercise";
import { useUserStore } from "@/entities/user";
import { StatisticCard } from "@/widgets/statisticCard";
import { cn } from "@/shared/lib/classMerge";
import { CustomButton } from "@/shared/ui";
import { useLastExerciseSession } from "../lib/useLastExerciseSession";
import { useWorkoutCaloriesUiEnabled } from "../lib/useWorkoutCaloriesUiEnabled";
import {
  DEFAULT_SET_DURATION_SEC,
  getSetRowCalorieDisplay,
  getSetTimeRange,
} from "../calories";
import { ExerciseSetRow } from "./ExerciseSetRow";

interface ExerciseBodyProps {
  exercise: Exercise;
  onDeleteRequested: () => void;
}

export const ExerciseBody = ({
  exercise,
  onDeleteRequested,
}: ExerciseBodyProps) => {
  const lastSession = useLastExerciseSession(exercise.name);
  const showCaloriesUi = useWorkoutCaloriesUiEnabled();

  const onChangeHandler = useCalendarStore((store) => store.setExerciseValues);
  const addSetToExercise = useCalendarStore((store) => store.addSetToExercise);
  const addSetGuardRef = useRef(false);

  const inputHandler = useCallback(
    (
      event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
      set: ExerciseSet,
    ) => {
      const name = event.target.name;
      if (name !== "reps" && name !== "weight") {
        return;
      }
      onChangeHandler(event.target.value, name, set.id, exercise);
    },
    [exercise, onChangeHandler],
  );

  const handleAddSet = useCallback(() => {
    if (addSetGuardRef.current) {
      return;
    }
    addSetGuardRef.current = true;
    try {
      const lastSet = exercise.sets.at(-1);
      const previousEnd =
        lastSet?.endTime !== undefined && lastSet.endTime !== ""
          ? new Date(lastSet.endTime)
          : null;

      const endNow = new Date();
      const defaultSec =
        useUserStore.getState().defaultSetDurationSec ??
        DEFAULT_SET_DURATION_SEC;
      const { startTime, endTime } = getSetTimeRange(
        previousEnd,
        defaultSec,
        endNow,
      );

      addSetToExercise(exercise, {
        weight: lastSet?.weight ?? 0,
        reps: lastSet?.reps ?? 0,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });
    } finally {
      addSetGuardRef.current = false;
    }
  }, [addSetToExercise, exercise]);

  return (
    <div
      className="flex flex-col w-full gap-2 p-4 pt-0 max-w-[800px]"
      onClick={(event) => event.stopPropagation()}
    >
      {lastSession !== null ? (
        <p
          className="w-full px-4 text-center text-xs leading-snug text-muted-foreground"
          role="note"
        >
          Прошлый раз, {lastSession.dateLabel}: {lastSession.setsSummary}
        </p>
      ) : null}

      {exercise.sets.length > 0 && (
        <div
          className={cn(
            "grid w-full items-center gap-2",
            showCaloriesUi
              ? "grid-cols-[2.25rem_minmax(0,1fr)_minmax(0,1fr)_3rem_2.25rem]"
              : "grid-cols-[2.25rem_minmax(0,1fr)_minmax(0,1fr)_2.25rem]",
          )}
        >
          <span className="w-1" />
          <span className="min-w-0 text-center text-xs font-semibold leading-tight text-muted-foreground">
            Повторений
          </span>
          <span className="min-w-0 text-center text-xs font-semibold leading-tight text-muted-foreground">
            Кг
          </span>
          {showCaloriesUi ? (
            <span className="min-w-0 text-center text-xs font-semibold leading-tight text-muted-foreground">
              Ккал
            </span>
          ) : null}
          <span className="w-1" />
        </div>
      )}

      <AnimatePresence>
        {exercise.sets.map((set, idx) => {
          const calorieDisplay = getSetRowCalorieDisplay(set);
          return (
            <motion.div
              key={set.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              style={{ overflow: "hidden" }}
            >
              <ExerciseSetRow
                exercise={exercise}
                set={set}
                index={idx}
                showKcalColumn={showCaloriesUi}
                calorieDisplay={calorieDisplay}
                onInputChange={inputHandler}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
      <div className={"flex gap-3 items-center justify-between"}>
        <StatisticCard exerciseName={exercise.name} />
        <CustomButton classes={"flex-1"} buttonHandler={handleAddSet}>
          Добавить подход
        </CustomButton>
        <Button
          variant="outline"
          className="text-destructive"
          size="icon"
          onClick={onDeleteRequested}
        >
          <Trash2 />
        </Button>
      </div>
    </div>
  );
};
