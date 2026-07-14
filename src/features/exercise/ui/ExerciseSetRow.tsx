import { type ChangeEvent, useCallback } from "react";
import { X } from "lucide-react";
import { Input } from "@/shared/ui/shadCNComponents/ui/input";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import type { Exercise, ExerciseSet } from "@/entities/exercise";
import { useCalendarStore } from "@/entities/calendarDay";
import type { SetRowCalorieDisplay } from "../calories";
import { cn } from "@/shared/lib/classMerge";
import { ExerciseSetKcalCell } from "./ExerciseSetKcalCell";

interface ExerciseSetRowProps {
  exercise: Exercise;
  set: ExerciseSet;
  index: number;
  /** На web колонка ккал скрыта — Health недоступен. */
  showKcalColumn: boolean;
  calorieDisplay: SetRowCalorieDisplay;
  onInputChange: (
    event: ChangeEvent<HTMLInputElement>,
    setItem: ExerciseSet,
  ) => void;
}

const isSetEmpty = (setItem: ExerciseSet) =>
  setItem.reps === 0 && setItem.weight === 0;

export const ExerciseSetRow = ({
  exercise,
  set,
  index,
  showKcalColumn,
  calorieDisplay,
  onInputChange,
}: ExerciseSetRowProps) => {
  const deleteSet = useCalendarStore((s) => s.deleteSet);
  const isEmptySet = isSetEmpty(set);

  const handleDelete = useCallback(() => {
    deleteSet(exercise, set);
  }, [deleteSet, exercise, set]);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>, setItem: ExerciseSet) => {
      event.target.value = event.target.value
        .replace(",", ".")
        .replace(/^0+(?=\d)/, "");
      onInputChange(event, setItem);
    },
    [onInputChange],
  );

  return (
    <div
      className={cn(
        "grid w-full items-center gap-3 max-w-[800px]",
        showKcalColumn
          ? "grid-cols-[2.25rem_minmax(0,1fr)_minmax(0,1fr)_3rem_2.25rem]"
          : "grid-cols-[2.25rem_minmax(0,1fr)_minmax(0,1fr)_2.25rem]",
      )}
    >
      <Button
        variant="outline"
        size="icon"
        className="h-full w-full flex-auto text-center text-xl text-muted-foreground"
      >
        {index + 1}
      </Button>
      <div className="w-full rounded-full bg-muted">
        <Input
          className={cn(
            "h-12 w-full rounded-md border-primary bg-background text-center text-2xl text-foreground font-numeric shadow-none ring-0 outline-none placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0",
            "text-primary",
          )}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="Кол-во"
          name="reps"
          value={isEmptySet ? "" : String(set.reps)}
          onChange={(e) => {
            handleChange(e, set);
          }}
        />
      </div>
      <div className="w-full rounded-full bg-muted">
        <Input
          className={cn(
            "h-12 w-full rounded-md border-primary bg-background text-center text-2xl text-foreground font-numeric shadow-none ring-0 outline-none placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0",
            "text-primary",
          )}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder="Кг"
          name="weight"
          value={isEmptySet ? "" : String(set.weight)}
          onChange={(e) => {
            handleChange(e, set);
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
