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
  /** На web колонка ккал скрыта — Health недоступен. */
  showKcalColumn: boolean;
  calorieDisplay: SetRowCalorieDisplay;
  inputClassName: string;
  onInputChange: (
    event: ChangeEvent<HTMLInputElement>,
    setItem: ExerciseSet,
  ) => void;
}

export const ExerciseSetRow = ({
  exercise,
  set,
  index,
  showKcalColumn,
  calorieDisplay,
  inputClassName,
  onInputChange,
}: ExerciseSetRowProps) => {
  const deleteSet = useCalendarStore((s) => s.deleteSet);

  const handleDelete = useCallback(() => {
    deleteSet(exercise, set);
  }, [deleteSet, exercise, set]);

  return (
    <div
      className={cn(
        style.setGridRow,
        !showKcalColumn && style.setGridRowWeb,
        "gap-3",
      )}
    >
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
      {showKcalColumn ? (
        <ExerciseSetKcalCell calorieDisplay={calorieDisplay} />
      ) : null}
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
