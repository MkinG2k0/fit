import { type ChangeEvent, useCallback } from "react";
import { X } from "lucide-react";
import { Input } from "@/shared/ui/shadCNComponents/ui/input";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import type { Exercise, ExerciseSet } from "@/entities/exercise";
import { useCalendarStore } from "@/entities/calendarDay";
import type { SetRowCalorieDisplay } from "../calories";
import { cn } from "@/shared/lib/classMerge";
import style from "./ExerciseCard.module.css";
import { ExerciseSetKcalCell } from "./ExerciseSetKcalCell";

interface ExerciseSetRowProps {
  exercise: Exercise;
  set: ExerciseSet;
  index: number;
  calorieDisplay: SetRowCalorieDisplay;
  inputClassName: string;
  onInputChange: (
    event: ChangeEvent<HTMLInputElement>,
    setItem: ExerciseSet,
  ) => void;
  onSetStart: (setId: string) => void;
  onSetComplete: (setId: string) => void;
}

export const ExerciseSetRow = ({
  exercise,
  set,
  index,
  calorieDisplay,
  inputClassName,
  onInputChange,
  onSetStart,
  onSetComplete,
}: ExerciseSetRowProps) => {
  const deleteSet = useCalendarStore((s) => s.deleteSet);

  const handleDelete = useCallback(() => {
    deleteSet(exercise, set);
  }, [deleteSet, exercise, set]);

  const handleStart = useCallback(() => {
    onSetStart(set.id);
  }, [onSetStart, set.id]);

  const handleComplete = useCallback(() => {
    onSetComplete(set.id);
  }, [onSetComplete, set.id]);

  return (
    <div className={cn(style.setGridRow, "gap-3")}>
      <Button
        variant="outline"
        size="icon"
        className={cn(style.setIndex, "flex-auto w-full h-full")}
      >
        {index + 1}
      </Button>
      <div className={style.cell}>
        <Input
          className={cn(
            inputClassName,
            "text-primary bg-background w-full border-primary h-12 rounded-md",
          )}
          type="number"
          placeholder="Кол-во"
          name="reps"
          value={set.reps === 0 ? "" : set.reps}
          onChange={(e) => {
            onInputChange(e, set);
          }}
        />
      </div>
      <div className={style.cell}>
        <Input
          className={cn(
            inputClassName,
            "text-primary bg-background w-full border-primary h-12 rounded-md",
          )}
          type="number"
          placeholder="Кг"
          name="weight"
          value={set.weight === 0 ? "" : set.weight}
          onChange={(e) => {
            onInputChange(e, set);
          }}
        />
      </div>
      <ExerciseSetKcalCell
        calorieDisplay={calorieDisplay}
        onStart={handleStart}
        onComplete={handleComplete}
      />
      <Button
        type="button"
        variant="outline"
        onClick={handleDelete}
        className="flex-auto w-full h-full"
      >
        <X />
      </Button>
    </div>
  );
};
