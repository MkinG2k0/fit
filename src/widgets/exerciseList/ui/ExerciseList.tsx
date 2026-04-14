import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { AddExercise } from "@/features/addExercise";
import { ExerciseCard } from "@/features/exercise";
import { useCalendarStore } from "@/entities/calendarDay";
import style from "./ExerciseList.module.css";

export const ExerciseList = () => {
  const days = useCalendarStore((state) => state.days);
  const selectedDate = useCalendarStore((state) => state.selectedDate);
  const loadDaysFromLocalStorage = useCalendarStore(
    (state) => state.loadDaysFromLocalStorage,
  );
  const observableDate = useCalendarStore((state) => state.observableDate);
  const exerciseArray =
    days[selectedDate.format("DD-MM-YYYY")]?.exercises ?? [];

  useEffect(() => {
    loadDaysFromLocalStorage(observableDate);
  }, [observableDate, loadDaysFromLocalStorage]);

  return (
    <div className={style.menu}>
      <div className={style.list}>
        <AnimatePresence>
          {exerciseArray.map((ex, index, array) => (
            <motion.div
              key={ex.id}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={index === array.length ? "mb-8" : ""}
            >
              <ExerciseCard key={ex.id} exercise={ex} />
            </motion.div>
          ))}
        </AnimatePresence>
        <div className={"mb-26"}></div>
      </div>
      <div className={style.footer}>
        <div>
          <AddExercise />
        </div>
      </div>
    </div>
  );
};
