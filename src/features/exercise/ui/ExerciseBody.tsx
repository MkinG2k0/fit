import { Trash2 } from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as motion from "motion/react-client";
import { type ChangeEvent, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import { useCalendarStore } from "@/entities/calendarDay";
import type { Exercise, ExerciseSet } from "@/entities/exercise";
import { useUserStore } from "@/entities/user";
import { StatisticCard } from "@/widgets/statisticCard";
import { cn } from "@/shared/lib/classMerge";
import style from "./ExerciseCard.module.css";
import { CustomButton } from "@/shared/ui";
import { useLastExerciseSession } from "../lib/useLastExerciseSession";
import { useWorkoutCaloriesUiEnabled } from "../lib/useWorkoutCaloriesUiEnabled";
import {
  DEFAULT_SET_DURATION_SEC,
  getSetRowCalorieDisplay,
  getSetTimeRange,
  useSetCalorieSession,
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
  const navigate = useNavigate();
  const lastSession = useLastExerciseSession(exercise.name);
  const showCaloriesUi = useWorkoutCaloriesUiEnabled();

  const onChangeHandler = useCalendarStore((store) => store.setExerciseValues);
  const addSetToExercise = useCalendarStore((store) => store.addSetToExercise);
  const addSetGuardRef = useRef(false);

  const setCalorieSession = useSetCalorieSession({
    exercise,
    enabled: showCaloriesUi,
    onProfileRequired: () => {
      void navigate("/settings?calorieProfile=1");
    },
  });

  const INPUT_CLASSNAME =
    "font-numeric shadow-none ring-0 outline-none focus-visible:ring-0 focus-visible:ring-offset-0 text-center text-2xl text-foreground placeholder:text-muted-foreground";

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

    const lastSet = exercise.sets.at(-1);
    const previousEnd =
      lastSet?.endTime !== undefined && lastSet.endTime !== ""
        ? new Date(lastSet.endTime)
        : null;

    const endNow = new Date();
    const defaultSec =
      useUserStore.getState().defaultSetDurationSec ?? DEFAULT_SET_DURATION_SEC;
    const { startTime, endTime } = getSetTimeRange(
      previousEnd,
      defaultSec,
      endNow,
    );

    const newSetId = addSetToExercise(exercise, {
      weight: lastSet?.weight ?? 0,
      reps: lastSet?.reps ?? 0,
      endTime: endTime.toISOString(),
    });

    void setCalorieSession
      .runSetCaloriesAfterAdd(newSetId, { startTime, endTime })
      .finally(() => {
        addSetGuardRef.current = false;
      });
  }, [addSetToExercise, exercise, setCalorieSession]);

  return (
    <div className="flex flex-col gap-2 p-4 pt-0 min-w-[352px] max-w-[738px]">
      {lastSession !== null ? (
        <p
          className="w-full px-4 text-center text-xs leading-snug text-muted-foreground"
          role="note"
        >
          Прошлый раз, {lastSession.dateLabel}: {lastSession.setsSummary}
        </p>
      ) : null}
      <div
        className={cn(
          style.inputsHeader,
          !showCaloriesUi && style.inputsHeaderWeb,
        )}
      >
        <span className={style.inputsHeaderSpacer} />
        <span className={style.inputLabel}>Кол-во</span>
        <span className={style.inputLabel}>Кг</span>
        {showCaloriesUi ? (
          <span className={style.inputLabelKcal}>Ккал</span>
        ) : null}
        <span className={style.inputsHeaderSpacer} />
      </div>

      <AnimatePresence>
        {exercise.sets.map((set, idx) => {
          const calorieDisplay = getSetRowCalorieDisplay(
            set,
            setCalorieSession.phaseBySetId[set.id],
          );
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
                inputClassName={INPUT_CLASSNAME}
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
