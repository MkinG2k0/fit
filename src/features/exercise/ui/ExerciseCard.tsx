import type { PanInfo } from "motion";
import { AnimatePresence } from "motion/react";
import { useState, useEffect, useMemo, useRef, type MouseEvent } from "react";
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
const DRAG_CLICK_SUPPRESS_DELAY_MS = 120;
const FALLBACK_ICON_PATH = "/muscles-category/другое.png";

const formatTotalLiftedKg = (totalKg: number): string => {
  if (!Number.isFinite(totalKg) || totalKg <= 0) {
    return "0";
  }

  const roundedTenths = Math.round(totalKg * 10) / 10;

  if (Number.isInteger(roundedTenths)) {
    return roundedTenths.toLocaleString("ru-RU", {
      maximumFractionDigits: 0,
    });
  }

  return roundedTenths.toLocaleString("ru-RU", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
};

const getExerciseIconPath = (category: string | undefined) => {
  const normalizedCategory = category?.trim().toLowerCase();

  if (!normalizedCategory) {
    return FALLBACK_ICON_PATH;
  }

  return `/muscles-category/${normalizedCategory}.png`;
};

export const ExerciseCard = ({ exercise }: ExerciseCardProps) => {
  const [isEditable, setIsEditable] = useState(false);
  const [modalVisibility, setModalVisibility] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStatisticOpen, setIsStatisticOpen] = useState(false);
  const [iconPath, setIconPath] = useState(() =>
    getExerciseIconPath(exercise.category),
  );
  const isCardDraggingRef = useRef(false);

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

  useEffect(() => {
    setIconPath(getExerciseIconPath(exercise.category));
  }, [exercise.category]);

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

  const handleCardDragStart = () => {
    isCardDraggingRef.current = true;
  };

  const handleCardDragEnd = (info: PanInfo) => {
    cardDragHandler(info);

    window.setTimeout(() => {
      isCardDraggingRef.current = false;
    }, DRAG_CLICK_SUPPRESS_DELAY_MS);
  };

  const handleCardHeadClick = (event: MouseEvent<HTMLDivElement>) => {
    if (isCardDraggingRef.current) {
      event.stopPropagation();

      return;
    }

    setIsEditable((p) => !p);
  };

  const handleDeleteRequest = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    deleteExercise(exercise);
    setIsDeleteDialogOpen(false);
  };

  const handleIconLoadingError = () => {
    setIconPath((previousPath) =>
      previousPath === FALLBACK_ICON_PATH ? previousPath : FALLBACK_ICON_PATH,
    );
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

  const totalLiftedKg = useMemo(() => {
    return exercise.sets.reduce((sum, set) => {
      const reps = Number.isFinite(set.reps) ? set.reps : 0;
      const weight = Number.isFinite(set.weight) ? set.weight : 0;

      return sum + reps * weight;
    }, 0);
  }, [exercise.sets]);

  const totalLiftedLabel = formatTotalLiftedKg(totalLiftedKg);

  return (
    <div className="relative w-screen overflow-hidden cursor-pointer">
      <motion.div
        drag="x"
        onDragStart={handleCardDragStart}
        onDragEnd={(_, info) => handleCardDragEnd(info)}
        dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
        dragTransition={{ bounceStiffness: 500, bounceDamping: 15 }}
        dragElastic={0.3}
        className=" flex items-center justify-start gap-2"
        initial={showHint ? { x: 0 } : false}
        animate={showHint ? { x: [-0, -80, 0] } : { x: 0 }}
        transition={showHint ? { duration: 1.2, ease: "easeInOut" } : undefined}
      >
        <div className="pointer-events-none flex w-10 items-center h-full justify-center absolute -left-11.25 top-0 z-10">
          <ChartColumnBig className="text-primary" />
        </div>
        <div className={style.card}>
          <div onClick={handleCardHeadClick} className={style.cardHead}>
            <div className={style.info}>
              <div className={style.icon}>
                <img
                  className={style.img}
                  src={iconPath}
                  onError={handleIconLoadingError}
                  alt={`Иконка упражнения ${exercise.name}`}
                />
              </div>
              <div className={style.exerciseName}>
                <ExerciseNameSelector
                  allExercises={allExercises}
                  exerciseName={exercise.name}
                  isEditable={isEditable}
                  open={modalVisibility}
                  onOpenChange={setModalVisibility}
                  onSelect={inputChangeHandler}
                />
              </div>

              {exercise.presetName && (
                <div
                  style={{ borderColor: exerciseColor }}
                  className={style.presetName}
                >
                  Пресет: {exercise.presetName}
                </div>
              )}
            </div>
            <div
              className={style.liftedTotal}
              title="Суммарный объём: по каждому подходу умножаем повторения на вес (кг) и складываем"
            >
              <span className={cn(style.liftedTotalValue, "font-numeric")}>
                {totalLiftedLabel}
              </span>
              <span className={style.liftedTotalUnit}>кг</span>
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
          <Trash2 className="text-destructive/70" />
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
