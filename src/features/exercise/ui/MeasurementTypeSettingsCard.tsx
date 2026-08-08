import { useMemo, useState } from "react";
import { Scale } from "lucide-react";
import {
  FREE_WEIGHT_MEASUREMENT_TYPE,
  defaultMeasurementStep,
  isStackMeasurementType,
  useExerciseStore,
  type MeasurementType,
} from "@/entities/exercise";
import { cn } from "@/shared/lib/classMerge";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/shadCNComponents/ui/card";
import { Label } from "@/shared/ui/shadCNComponents/ui/label";

const TYPE_OPTIONS: ReadonlyArray<{
  value: MeasurementType;
  label: string;
}> = [
  { value: "free_weight", label: "Свободный вес" },
  { value: "stack_kg", label: "Стек (кг)" },
  { value: "stack_lbs", label: "Стек (lbs)" },
  { value: "time", label: "Время" },
];

interface TypeDraft {
  type: MeasurementType;
  step?: number;
}

interface MeasurementTypeSettingsCardProps {
  className?: string;
}

export const MeasurementTypeSettingsCard = ({
  className,
}: MeasurementTypeSettingsCardProps) => {
  const exercises = useExerciseStore((state) => state.exercises);
  const updateExercise = useExerciseStore((state) => state.updateExercise);
  const [drafts, setDrafts] = useState<Record<string, TypeDraft>>({});

  const freeWeightEntries = useMemo(
    () =>
      exercises.flatMap((group) =>
        group.exercises
          .filter(
            (exercise) =>
              exercise.measurementType === FREE_WEIGHT_MEASUREMENT_TYPE,
          )
          .map((exercise) => ({
            ...exercise,
            category: group.category,
          })),
      ),
    [exercises],
  );

  const getDraft = (exerciseId: string): TypeDraft =>
    drafts[exerciseId] ?? { type: FREE_WEIGHT_MEASUREMENT_TYPE };

  const handleTypeSelect = (exerciseId: string, nextType: MeasurementType) => {
    setDrafts((prev) => ({
      ...prev,
      [exerciseId]: {
        type: nextType,
        step: isStackMeasurementType(nextType)
          ? (prev[exerciseId]?.step ?? defaultMeasurementStep(nextType))
          : undefined,
      },
    }));
  };

  const handleStepChange = (exerciseId: string, nextStep: number) => {
    if (!Number.isFinite(nextStep) || nextStep <= 0) {
      return;
    }
    setDrafts((prev) => {
      const current = prev[exerciseId] ?? {
        type: FREE_WEIGHT_MEASUREMENT_TYPE,
      };
      if (!isStackMeasurementType(current.type)) {
        return prev;
      }
      return {
        ...prev,
        [exerciseId]: { ...current, step: nextStep },
      };
    });
  };

  const handleApply = (exerciseId: string) => {
    const entry = freeWeightEntries.find(
      (exercise) => exercise.id === exerciseId,
    );
    const draft = getDraft(exerciseId);
    if (!entry || draft.type === FREE_WEIGHT_MEASUREMENT_TYPE) {
      return;
    }

    const measurementStep = isStackMeasurementType(draft.type)
      ? (draft.step ?? defaultMeasurementStep(draft.type))
      : undefined;

    updateExercise({
      id: entry.id,
      name: entry.name,
      category: entry.category,
      iconId: entry.iconId,
      description: entry.description,
      photoDataUrls: entry.photoDataUrls,
      measurementType: draft.type,
      ...(measurementStep !== undefined ? { measurementStep } : {}),
    });

    setDrafts((prev) => {
      const next = { ...prev };
      delete next[exerciseId];
      return next;
    });
  };

  return (
    <Card className={cn("gap-3 py-4", className)}>
      <CardHeader className="px-4">
        <CardTitle className="flex items-center gap-2">
          <Scale className="size-5 text-muted-foreground" aria-hidden />
          Тип замера
        </CardTitle>
        <CardDescription>
          Сменить тип можно только у упражнений со свободным весом. После смены
          на стек или время упражнение исчезнет из этого списка.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 px-4">
        {freeWeightEntries.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Нет упражнений со свободным весом.
          </p>
        ) : (
          freeWeightEntries.map((exercise) => {
            const draft = getDraft(exercise.id);
            const showStep = isStackMeasurementType(draft.type);
            const canApply = draft.type !== FREE_WEIGHT_MEASUREMENT_TYPE;

            return (
              <div
                key={exercise.id}
                className="flex flex-col gap-2 rounded-md border border-border p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{exercise.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {exercise.category}
                  </p>
                </div>
                <div className="flex flex-wrap items-end gap-2">
                  <div className="flex min-w-[10rem] flex-1 flex-col gap-1">
                    <Label
                      htmlFor={`settings-measurement-type-${exercise.id}`}
                      className="text-xs text-muted-foreground"
                    >
                      Тип
                    </Label>
                    <select
                      id={`settings-measurement-type-${exercise.id}`}
                      className="border-input bg-background text-foreground h-9 w-full rounded-md border px-2 text-sm"
                      value={draft.type}
                      onChange={(event) => {
                        handleTypeSelect(
                          exercise.id,
                          event.target.value as MeasurementType,
                        );
                      }}
                    >
                      {TYPE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {showStep ? (
                    <div className="flex w-24 flex-col gap-1">
                      <Label
                        htmlFor={`settings-measurement-step-${exercise.id}`}
                        className="text-xs text-muted-foreground"
                      >
                        Шаг
                      </Label>
                      <input
                        id={`settings-measurement-step-${exercise.id}`}
                        type="number"
                        min={0.1}
                        step="any"
                        className="border-input bg-background text-foreground h-9 w-full rounded-md border px-2 text-sm"
                        value={
                          draft.step ??
                          defaultMeasurementStep(draft.type) ??
                          ""
                        }
                        onChange={(event) => {
                          handleStepChange(
                            exercise.id,
                            Number(event.target.value),
                          );
                        }}
                      />
                    </div>
                  ) : null}
                  {canApply ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => handleApply(exercise.id)}
                    >
                      Применить
                    </Button>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};
