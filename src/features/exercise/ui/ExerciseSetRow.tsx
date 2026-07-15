import { type ChangeEvent, useCallback, useState } from "react";
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

/** Digits + at most one `.`; rejects other characters. Returns null if invalid. */
const sanitizeDecimalDraft = (raw: string): string | null => {
  const normalized = raw.replace(",", ".");
  if (normalized === "") {
    return "";
  }
  if (!/^\d*\.?\d*$/.test(normalized)) {
    return null;
  }
  return normalized.replace(/^0+(?=\d)/, "");
};

const isCompleteDecimalDraft = (draft: string): boolean => {
  if (draft === "" || draft === ".") {
    return draft === "";
  }
  if (draft.endsWith(".")) {
    return false;
  }
  return Number.isFinite(Number(draft));
};

const commitDecimalDraft = (draft: string): string => {
  let value = draft.replace(",", ".");
  if (value === "." || value.endsWith(".")) {
    value = value.slice(0, -1);
  }
  return value;
};

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
  const [isWeightFocused, setIsWeightFocused] = useState(false);
  const [weightDraft, setWeightDraft] = useState("");

  const handleDelete = useCallback(() => {
    deleteSet(exercise, set);
  }, [deleteSet, exercise, set]);

  const emitWeightChange = useCallback(
    (value: string, setItem: ExerciseSet) => {
      const syntheticEvent = {
        target: { name: "weight", value },
      } as ChangeEvent<HTMLInputElement>;
      onInputChange(syntheticEvent, setItem);
    },
    [onInputChange],
  );

  const handleRepsChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>, setItem: ExerciseSet) => {
      event.target.value = event.target.value
        .replace(",", ".")
        .replace(/^0+(?=\d)/, "");
      onInputChange(event, setItem);
    },
    [onInputChange],
  );

  const handleWeightFocus = useCallback(() => {
    setIsWeightFocused(true);
    setWeightDraft(isEmptySet ? "" : String(set.weight));
  }, [isEmptySet, set.weight]);

  const handleWeightChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>, setItem: ExerciseSet) => {
      const sanitized = sanitizeDecimalDraft(event.target.value);
      if (sanitized === null) {
        return;
      }
      setWeightDraft(sanitized);
      if (isCompleteDecimalDraft(sanitized)) {
        emitWeightChange(sanitized, setItem);
      }
    },
    [emitWeightChange],
  );

  const handleWeightBlur = useCallback(
    (setItem: ExerciseSet) => {
      const committed = commitDecimalDraft(weightDraft);
      emitWeightChange(committed, setItem);
      setIsWeightFocused(false);
      setWeightDraft("");
    },
    [emitWeightChange, weightDraft],
  );

  const weightValue = isWeightFocused
    ? weightDraft
    : isEmptySet
      ? ""
      : String(set.weight);

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
            handleRepsChange(e, set);
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
          value={weightValue}
          onFocus={handleWeightFocus}
          onChange={(e) => {
            handleWeightChange(e, set);
          }}
          onBlur={() => {
            handleWeightBlur(set);
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
