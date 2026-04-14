import { Trash2, X } from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as motion from "motion/react-client";
import { type ChangeEvent } from "react";
import { Input } from "@/shared/ui/shadCNComponents/ui/input";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import { useCalendarStore } from "@/entities/calendarDay";
import type { Exercise, ExerciseSet } from "@/entities/exercise";
import { StatisticCard } from "@/widgets/statisticCard";
import style from "./ExerciseCard.module.css";
import { CustomButton } from "@/shared/ui";
import { useLastExerciseSession } from "../lib/useLastExerciseSession";
import { cn } from "@/shared/lib/classMerge";

interface ExerciseBodyProps {
  exercise: Exercise;
  onDeleteRequested: () => void;
}

export const ExerciseBody = ({
  exercise,
  onDeleteRequested,
}: ExerciseBodyProps) => {
  const lastSession = useLastExerciseSession(exercise.name);
  const onChangeHandler = useCalendarStore((store) => store.setExerciseValues);
  const addSetToExercise = useCalendarStore((store) => store.addSetToExercise);
  const deleteSet = useCalendarStore((store) => store.deleteSet);
  const INPUT_CLASSNAME =
    "font-numeric shadow-none ring-0 outline-none focus-visible:ring-0 focus-visible:ring-offset-0 text-center text-2xl text-foreground placeholder:text-muted-foreground";

  const inputHandler = (
    event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
    set: ExerciseSet,
  ) => {
    onChangeHandler(
      event.target.value,
      event.target.name as keyof ExerciseSet,
      set.id,
      exercise,
    );
  };

  return (
    <div className="flex flex-col gap-2 p-4 pt-0">
      {lastSession !== null ? (
        <p
          className="w-full px-4 text-center text-xs leading-snug text-muted-foreground"
          role="note"
        >
          Прошлый раз, {lastSession.dateLabel}: {lastSession.setsSummary}
        </p>
      ) : null}
      <div className={style.inputsHeader}>
        <span className={style.inputsHeaderSpacer} />
        <span className={style.inputLabel}>Кол-во</span>
        <span className={style.inputLabel}>Кг</span>
        <span className={style.inputsHeaderSpacer} />
      </div>

      <AnimatePresence>
        {exercise.sets.map((set, idx) => {
          return (
            <motion.div
              key={set.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              style={{ overflow: "hidden" }}
            >
              <div className={cn("flex gap-3 items-center font-numeric")}>
                <div className={style.setIndex}>{idx + 1}</div>
                <div className={style.cell}>
                  <Input
                    className={cn(
                      INPUT_CLASSNAME,
                      "text-primary bg-background w-32 border-primary h-12 rounded-md",
                    )}
                    type={"number"}
                    placeholder={"Кол-во"}
                    name={"reps"}
                    value={set.reps === 0 ? "" : set.reps}
                    onChange={(e) => {
                      inputHandler(e, set);
                    }}
                  />
                </div>
                <div className={style.cell}>
                  <Input
                    className={cn(
                      INPUT_CLASSNAME,
                      "text-primary bg-background w-32 border-primary h-12 rounded-md",
                    )}
                    type={"number"}
                    placeholder={"Кг"}
                    name={"weight"}
                    value={set.weight === 0 ? "" : set.weight}
                    onChange={(e) => {
                      inputHandler(e, set);
                    }}
                  />
                </div>
                <div className={style.deleteButtonCell}>
                  <Button
                    className="bg-transparent text-muted-foreground hover:text-foreground"
                    onClick={() => deleteSet(exercise, set)}
                  >
                    <X />
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
      <div className={"flex gap-3 items-center justify-between"}>
        <StatisticCard exerciseName={exercise.name} />
        <CustomButton
          classes={"flex-1"}
          buttonHandler={() => addSetToExercise(exercise)}
        >
          Добавить подход
        </CustomButton>
        <Button
          variant="outline"
          className="text-destructive"
          onClick={onDeleteRequested}
        >
          <Trash2 />
        </Button>
      </div>
    </div>
  );
};
