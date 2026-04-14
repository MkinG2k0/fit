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

interface ExerciseBodyProps {
  exercise: Exercise;
}

export const ExerciseBody = ({ exercise }: ExerciseBodyProps) => {
  const onChangeHandler = useCalendarStore((store) => store.setExerciseValues);
  const addSetToExercise = useCalendarStore((store) => store.addSetToExercise);
  const deleteSet = useCalendarStore((store) => store.deleteSet);
  const deleteExercise = useCalendarStore((store) => store.deleteExercise);

  const inputHandler = (
    event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
    set: ExerciseSet,
  ) => {
    if (event.target.value.length <= 3) {
      onChangeHandler(
        event.target.value,
        event.target.name as keyof ExerciseSet,
        set.id,
        exercise,
      );
    }
  };
  return (
    <>
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
              <div className={style.row}>
                <div className={style.setIndex}>{idx + 1}</div>
                <div className={style.cell}>
                  <Input
                    className={"text-white border-0 text-center text-2xl"}
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
                    className={"text-white border-0 text-center text-2xl"}
                    type={"number"}
                    placeholder={"Кг"}
                    name={"weight"}
                    value={set.weight === 0 ? "" : set.weight}
                    onChange={(e) => {
                      inputHandler(e, set);
                    }}
                  />
                </div>
                <div>
                  <Button
                    className={"bg-transparent text-black"}
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
      <div className={style.cardFooter}>
        <StatisticCard exerciseName={exercise.name} />
        <CustomButton
          classes={"text-xl"}
          buttonHandler={() => addSetToExercise(exercise)}
        >
          Добавить подход
        </CustomButton>
        <Trash2 color={"red"} onClick={() => deleteExercise(exercise)} />
      </div>
    </>
  );
};
