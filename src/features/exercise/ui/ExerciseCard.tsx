import type { PanInfo } from "motion";
import { AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { ChartColumnBig, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { useCalendarStore } from "@/entities/calendarDay";
import { type Exercise, useExerciseStore } from "@/entities/exercise";
import * as motion from "motion/react-client";
import { cn } from "../../../shared/lib";
import { ExerciseBody } from "./ExerciseBody";
import { ExerciseDeleteDialog } from "./ExerciseDeleteDialog";
import { ExerciseNameSelector } from "./ExerciseNameSelector";
import { StatisticCard } from "@/widgets/statisticCard";
import style from "./ExerciseCard.module.css";

interface ExerciseCardProps {
  exercise: Exercise;
}

const SWIPE_DISTANCE_THRESHOLD = 140;
const SWIPE_VELOCITY_THRESHOLD = 250;

export const ExerciseCard = ({ exercise }: ExerciseCardProps) => {
  const [isEditable, setIsEditable] = useState(false);
  const [modalVisibility, setModalVisibility] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStatisticOpen, setIsStatisticOpen] = useState(false);

  const setExerciseName = useCalendarStore((store) => store.setExerciseName);
  const deleteExercise = useCalendarStore((store) => store.deleteExercise);
  const allExercises = useExerciseStore((store) => store.exercises);

  // 🧠 1. Проверяем, был ли уже показан hint
  useEffect(() => {
    const hintShown = localStorage.getItem("exerciseSwipeHintShown");
    if (!hintShown) {
      setShowHint(true);
      // Сохраняем флаг, чтобы больше не показывать
      localStorage.setItem("exerciseSwipeHintShown", "true");
    }
  }, []);

  // 🧩 2. Функция удаления
  const cardDragHandler = (info: PanInfo) => {
    const isSwipeRight =
      info.offset.x > SWIPE_DISTANCE_THRESHOLD &&
      info.velocity.x > SWIPE_VELOCITY_THRESHOLD;
    const isSwipeLeft =
      info.offset.x < -SWIPE_DISTANCE_THRESHOLD &&
      info.velocity.x < -SWIPE_VELOCITY_THRESHOLD;

    if (isSwipeRight) {
      setIsStatisticOpen(true);

      return;
    }

    if (isSwipeLeft) {
      setIsDeleteDialogOpen(true);
    }
  };

  const handleDeleteRequest = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    deleteExercise(exercise);
    setIsDeleteDialogOpen(false);
  };

  // ⚙️ 3. Обработка изменения названия упражнения
  const inputChangeHandler = (name: string) => {
    const category = allExercises.find((group) =>
      group.exercises.includes(name),
    )?.category;
    if (category) {
      setExerciseName({ name, group: category }, exercise);
      setModalVisibility(false);
    }
  };

  const exerciseColor = `rgba(${exercise.presetColor?.r},${exercise.presetColor?.g},${exercise.presetColor?.b},${exercise.presetColor?.a}`;

  return (
    <div className="relative w-screen overflow-hidden">
      <motion.div
        drag="x"
        onDragEnd={(_, info) => cardDragHandler(info)}
        dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
        dragTransition={{ bounceStiffness: 500, bounceDamping: 15 }}
        dragElastic={0.3}
        className=" flex items-center justify-start gap-2"
        initial={showHint ? { x: 0 } : false}
        animate={showHint ? { x: [-0, -80, 0] } : { x: 0 }}
        transition={showHint ? { duration: 1.2, ease: "easeInOut" } : undefined}
      >
        <div className="pointer-events-none flex w-10 items-center h-full justify-center absolute -left-11.25 top-0 z-10">
          <ChartColumnBig className="text-blue-500" />
        </div>
        <div style={{ borderColor: exerciseColor }} className={style.card}>
          <div
            onClick={() => setIsEditable((p) => !p)}
            className={cn(style.cardHead, "overflow-hidden ")}
          >
            <div className={style.info}>
              <div className={style.icon}>
                <img
                  className={style.img}
                  src={`/muscles-category/${exercise.category.toLowerCase()}.png`}
                  alt="Icon"
                />
              </div>
              <div className={style.exerciseName}>
                {exercise.presetName && (
                  <div
                    style={{ borderColor: exerciseColor }}
                    className={style.presetName}
                  >
                    Пресет: {exercise.presetName}
                  </div>
                )}
                <ExerciseNameSelector
                  allExercises={allExercises}
                  exerciseName={exercise.name}
                  isEditable={isEditable}
                  open={modalVisibility}
                  onOpenChange={setModalVisibility}
                  onSelect={inputChangeHandler}
                />
              </div>
            </div>
            <div className={"p-4"}>
              {isEditable ? <ChevronUp /> : <ChevronDown />}
            </div>
          </div>
          <AnimatePresence>
            {isEditable && (
              <motion.div
                key="body"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                style={{ overflow: "hidden" }}
              >
                <ExerciseBody
                  exercise={exercise}
                  onDeleteRequested={handleDeleteRequest}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="pointer-events-none flex w-10 items-center h-full justify-center absolute -right-11.25 top-0 z-10">
          <Trash2 className="text-red-500/70" />
        </div>
      </motion.div>

      <ExerciseDeleteDialog
        open={isDeleteDialogOpen}
        exerciseName={exercise.name}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
      />
      <StatisticCard
        exerciseName={exercise.name}
        open={isStatisticOpen}
        onOpenChange={setIsStatisticOpen}
        showTrigger={false}
      />
    </div>
  );
};
