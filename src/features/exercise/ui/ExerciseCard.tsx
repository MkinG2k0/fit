import type { PanInfo } from "motion";
import { AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { useCalendarStore } from "@/entities/calendarDay";
import { type Exercise, useExerciseStore } from "@/entities/exercise";
import * as motion from "motion/react-client";
import { cn } from "../../../shared/lib";
import { ExerciseBody } from "./ExerciseBody";
import { ExerciseDeleteDialog } from "./ExerciseDeleteDialog";
import { ExerciseNameSelector } from "./ExerciseNameSelector";
import style from "./ExerciseCard.module.css";

interface ExerciseCardProps {
  exercise: Exercise;
}

export const ExerciseCard = ({ exercise }: ExerciseCardProps) => {
  const [isEditable, setIsEditable] = useState(false);
  const [modalVisibility, setModalVisibility] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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
    if (info.offset.x < -180) {
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
    <div className="w-screen overflow-hidden">
      <motion.div
        drag="x"
        onDragEnd={(_, info) => cardDragHandler(info)}
        dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
        dragTransition={{ bounceStiffness: 500, bounceDamping: 15 }}
        dragElastic={0.3}
        className="w-[calc(100dvw+50px)] flex justify-start gap-10"
        initial={showHint ? { x: 0 } : false}
        animate={showHint ? { x: [-0, -80, 0] } : { x: 0 }}
        transition={showHint ? { duration: 1.2, ease: "easeInOut" } : undefined}
      >
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
        <div className="flex justify-center items-center">
          <Trash2 className="text-red-500" />
        </div>
      </motion.div>
      <ExerciseDeleteDialog
        open={isDeleteDialogOpen}
        exerciseName={exercise.name}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};
