import { type ChangeEvent, useCallback, useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import { Input } from "@/shared/ui/shadCNComponents/ui/input";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import {
  FREE_WEIGHT_MEASUREMENT_TYPE,
  formatSecondsAsMmSs,
  isStackMeasurementType,
  isTimeMeasurementType,
  parseMmSsToSeconds,
  type Exercise,
  type ExerciseSet,
  type MeasurementType,
} from "@/entities/exercise";
import { useCalendarStore } from "@/entities/calendarDay";
import type { SetRowCalorieDisplay } from "../calories";
import { cn } from "@/shared/lib/classMerge";
import { ExerciseSetKcalCell } from "./ExerciseSetKcalCell";

interface ExerciseSetRowProps {
  exercise: Exercise;
  set: ExerciseSet;
  index: number;
  measurementType?: MeasurementType;
  measurementStep?: number;
  /** На web колонка ккал скрыта — Health недоступен. */
  showKcalColumn: boolean;
  calorieDisplay: SetRowCalorieDisplay;
  onInputChange: (
    event: ChangeEvent<HTMLInputElement>,
    setItem: ExerciseSet,
  ) => void;
}

const isSetEmpty = (setItem: ExerciseSet, measurementType: MeasurementType) => {
  if (isTimeMeasurementType(measurementType)) {
    return setItem.weight === 0;
  }
  return setItem.reps === 0 && setItem.weight === 0;
};

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

const snapToStep = (value: number, step: number): number => {
  if (!Number.isFinite(value) || !Number.isFinite(step) || step <= 0) {
    return Math.max(0, value);
  }
  return Math.max(0, Math.round(value / step) * step);
};

export const ExerciseSetRow = ({
  exercise,
  set,
  index,
  measurementType = FREE_WEIGHT_MEASUREMENT_TYPE,
  measurementStep,
  showKcalColumn,
  calorieDisplay,
  onInputChange,
}: ExerciseSetRowProps) => {
  const deleteSet = useCalendarStore((s) => s.deleteSet);
  const isEmptySet = isSetEmpty(set, measurementType);
  const isStack = isStackMeasurementType(measurementType);
  const isTime = isTimeMeasurementType(measurementType);
  const step = measurementStep ?? (measurementType === "stack_lbs" ? 10 : 5);
  const weightPlaceholder =
    measurementType === "stack_lbs" ? "lbs" : "Кг";

  const [isWeightFocused, setIsWeightFocused] = useState(false);
  const [weightDraft, setWeightDraft] = useState("");
  const [isTimeFocused, setIsTimeFocused] = useState(false);
  const [timeDraft, setTimeDraft] = useState("");

  const handleDelete = useCallback(() => {
    deleteSet(exercise, set);
  }, [deleteSet, exercise, set]);

  const emitFieldChange = useCallback(
    (name: "weight" | "reps", value: string, setItem: ExerciseSet) => {
      const syntheticEvent = {
        target: { name, value },
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
        if (isStack) {
          const snapped = snapToStep(Number(sanitized || 0), step);
          setWeightDraft(String(snapped));
          emitFieldChange("weight", String(snapped), setItem);
          return;
        }
        emitFieldChange("weight", sanitized, setItem);
      }
    },
    [emitFieldChange, isStack, step],
  );

  const handleWeightBlur = useCallback(
    (setItem: ExerciseSet) => {
      const committed = commitDecimalDraft(weightDraft);
      if (isStack) {
        const snapped = snapToStep(Number(committed || 0), step);
        emitFieldChange("weight", String(snapped), setItem);
      } else {
        emitFieldChange("weight", committed, setItem);
      }
      setIsWeightFocused(false);
      setWeightDraft("");
    },
    [emitFieldChange, isStack, step, weightDraft],
  );

  const handleStackStep = useCallback(
    (direction: -1 | 1, setItem: ExerciseSet) => {
      const next = snapToStep(setItem.weight + direction * step, step);
      emitFieldChange("weight", String(next), setItem);
    },
    [emitFieldChange, step],
  );

  const handleTimeFocus = useCallback(() => {
    setIsTimeFocused(true);
    setTimeDraft(isEmptySet ? "" : formatSecondsAsMmSs(set.weight));
  }, [isEmptySet, set.weight]);

  const handleTimeChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setTimeDraft(event.target.value);
    },
    [],
  );

  const handleTimeBlur = useCallback(
    (setItem: ExerciseSet) => {
      const parsed = parseMmSsToSeconds(timeDraft);
      if (parsed === null) {
        setIsTimeFocused(false);
        setTimeDraft("");
        return;
      }
      emitFieldChange("weight", String(parsed), setItem);
      if (setItem.reps !== 0) {
        emitFieldChange("reps", "0", setItem);
      }
      setIsTimeFocused(false);
      setTimeDraft("");
    },
    [emitFieldChange, timeDraft],
  );

  const weightValue = isWeightFocused
    ? weightDraft
    : isEmptySet
      ? ""
      : String(set.weight);

  const timeValue = isTimeFocused
    ? timeDraft
    : isEmptySet
      ? ""
      : formatSecondsAsMmSs(set.weight);

  const gridClassName = isTime
    ? showKcalColumn
      ? "grid-cols-[2.25rem_minmax(0,1fr)_3rem_2.25rem]"
      : "grid-cols-[2.25rem_minmax(0,1fr)_2.25rem]"
    : showKcalColumn
      ? "grid-cols-[2.25rem_minmax(0,1fr)_minmax(0,1fr)_3rem_2.25rem]"
      : "grid-cols-[2.25rem_minmax(0,1fr)_minmax(0,1fr)_2.25rem]";

  return (
    <div className={cn("grid w-full items-center gap-3 max-w-[800px]", gridClassName)}>
      <Button
        variant="outline"
        size="icon"
        className="h-full w-full flex-auto text-center text-xl text-muted-foreground"
      >
        {index + 1}
      </Button>

      {isTime ? (
        <div className="w-full rounded-full bg-muted">
          <Input
            className={cn(
              "h-12 w-full rounded-md border-primary bg-background text-center text-2xl text-foreground font-numeric shadow-none ring-0 outline-none placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0",
              "text-primary",
            )}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="мм:сс"
            name="weight"
            value={timeValue}
            onFocus={handleTimeFocus}
            onChange={handleTimeChange}
            onBlur={() => {
              handleTimeBlur(set);
            }}
          />
        </div>
      ) : (
        <>
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
          <div className="flex w-full items-center gap-1">
            {isStack ? (
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-12 w-10 shrink-0"
                aria-label="Уменьшить вес"
                onClick={() => {
                  handleStackStep(-1, set);
                }}
              >
                <Minus />
              </Button>
            ) : null}
            <div className="min-w-0 flex-1 rounded-full bg-muted">
              <Input
                className={cn(
                  "h-12 w-full rounded-md border-primary bg-background text-center text-2xl text-foreground font-numeric shadow-none ring-0 outline-none placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0",
                  "text-primary",
                )}
                type="text"
                inputMode="decimal"
                autoComplete="off"
                placeholder={weightPlaceholder}
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
            {isStack ? (
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-12 w-10 shrink-0"
                aria-label="Увеличить вес"
                onClick={() => {
                  handleStackStep(1, set);
                }}
              >
                <Plus />
              </Button>
            ) : null}
          </div>
        </>
      )}

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
