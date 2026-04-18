import { Trash2 } from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as motion from "motion/react-client";
import { type ChangeEvent, useCallback, useState } from "react";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import { useCalendarStore } from "@/entities/calendarDay";
import type { Exercise, ExerciseSet } from "@/entities/exercise";
import { StatisticCard } from "@/widgets/statisticCard";
import { cn } from "@/shared/lib/classMerge";
import style from "./ExerciseCard.module.css";
import { CustomButton } from "@/shared/ui";
import { useLastExerciseSession } from "../lib/useLastExerciseSession";
import { useWorkoutCaloriesUiEnabled } from "../lib/useWorkoutCaloriesUiEnabled";
import {
  getSetRowCalorieDisplay,
  useSetCalorieSession,
  WorkoutCalorieProfileDialog,
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
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const showCaloriesUi = useWorkoutCaloriesUiEnabled();

  const onChangeHandler = useCalendarStore((store) => store.setExerciseValues);
  const addSetToExercise = useCalendarStore((store) => store.addSetToExercise);

  const setCalorieSession = useSetCalorieSession({
    exercise,
    enabled: showCaloriesUi,
    onProfileRequired: () => {
      setProfileDialogOpen(true);
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

  const handleSetComplete = useCallback(
    (setId: string) => {
      void setCalorieSession.onSetComplete(setId);
    },
    [setCalorieSession],
  );

  const handleAddSet = useCallback(() => {
    addSetToExercise(exercise);
  }, [addSetToExercise, exercise]);

  return (
    <div className="flex flex-col gap-2 p-4 pt-0">
      {showCaloriesUi ? (
        <WorkoutCalorieProfileDialog
          open={profileDialogOpen}
          onOpenChange={setProfileDialogOpen}
        />
      ) : null}
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
                onSetStart={setCalorieSession.onSetStart}
                onSetComplete={handleSetComplete}
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
