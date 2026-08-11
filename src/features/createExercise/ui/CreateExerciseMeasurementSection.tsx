import type { MeasurementType } from "@/entities/exercise";
import {
  defaultMeasurementStep,
  isStackMeasurementType,
} from "@/entities/exercise";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import { Label } from "@/shared/ui/shadCNComponents/ui/label";

const MEASUREMENT_OPTIONS: ReadonlyArray<{
  value: MeasurementType;
  label: string;
}> = [
  { value: "free_weight", label: "Свободный вес" },
  { value: "stack_kg", label: "Стек (кг)" },
  { value: "stack_lbs", label: "Стек (lbs)" },
  { value: "time", label: "Время" },
];

interface CreateExerciseMeasurementSectionProps {
  value: MeasurementType;
  step?: number;
  onTypeChange: (type: MeasurementType) => void;
  onStepChange: (step: number | undefined) => void;
  disabled?: boolean;
}

export const CreateExerciseMeasurementSection = ({
  value,
  step,
  onTypeChange,
  onStepChange,
  disabled = false,
}: CreateExerciseMeasurementSectionProps) => {
  const showStep = isStackMeasurementType(value);
  const stepValue = step ?? defaultMeasurementStep(value) ?? "";

  return (
    <div className="min-w-0 space-y-2">
      <span id="exercise-measurement-type-label" className="text-sm font-medium">
        Тип замера
      </span>
      <div
        role="radiogroup"
        aria-labelledby="exercise-measurement-type-label"
        className="flex flex-wrap gap-2"
      >
        {MEASUREMENT_OPTIONS.map((option) => (
          <Button
            key={option.value}
            type="button"
            variant={value === option.value ? "default" : "outline"}
            aria-pressed={value === option.value}
            disabled={disabled}
            className="whitespace-nowrap"
            onClick={() => {
              const nextType = option.value;
              onTypeChange(nextType);
              if (isStackMeasurementType(nextType)) {
                onStepChange(defaultMeasurementStep(nextType));
              } else {
                onStepChange(undefined);
              }
            }}
          >
            {option.label}
          </Button>
        ))}
      </div>
      {showStep ? (
        <div className="flex items-center gap-2 pt-1">
          <Label htmlFor="measurement-step" className="text-sm font-medium">
            Шаг
          </Label>
          <input
            id="measurement-step"
            type="number"
            min={0.1}
            step="any"
            disabled={disabled}
            value={stepValue}
            className="border-input bg-background text-foreground h-9 w-24 rounded-md border px-2 text-sm"
            onChange={(event) => {
              const parsed = Number(event.target.value);
              if (!Number.isFinite(parsed) || parsed <= 0) {
                return;
              }
              onStepChange(parsed);
            }}
          />
        </div>
      ) : null}
    </div>
  );
};
