import { type ChangeEvent, useMemo } from "react";
import {
  selectSortedBodyMetricsEntries,
  useBodyMetricsStore,
} from "@/entities/bodyMetrics";
import { findCatalogExerciseById, useExerciseStore } from "@/entities/exercise";
import { useLoadTableStore } from "@/entities/loadTable";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import { Input } from "@/shared/ui/shadCNComponents/ui/input";
import { Label } from "@/shared/ui/shadCNComponents/ui/label";
import { LoadTableWeekGrid } from "./LoadTableWeekGrid";

interface LoadTableDetailProps {
  exerciseId: string;
  onBack: () => void;
}

const resolveLatestWeightKg = (
  entries: ReturnType<typeof useBodyMetricsStore.getState>["entries"],
) => {
  const sorted = selectSortedBodyMetricsEntries(entries);
  for (const entry of sorted) {
    const weightKg = entry.measurements.weightKg;
    if (typeof weightKg === "number" && Number.isFinite(weightKg) && weightKg > 0) {
      return weightKg;
    }
  }
  return null;
};

export const LoadTableDetail = ({ exerciseId, onBack }: LoadTableDetailProps) => {
  const catalog = useExerciseStore((state) => state.exercises);
  const bodyEntries = useBodyMetricsStore((state) => state.entries);
  const exercise = useLoadTableStore((state) =>
    state.exercises.find((item) => item.id === exerciseId),
  );
  const updateExercise = useLoadTableStore((state) => state.updateExercise);
  const errorMessage = useLoadTableStore((state) => state.errorMessage);

  const latestWeightKg = useMemo(
    () => resolveLatestWeightKg(bodyEntries),
    [bodyEntries],
  );

  if (!exercise) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">Упражнение не найдено</p>
        <Button type="button" variant="outline" onClick={onBack}>
          Назад к списку
        </Button>
      </div>
    );
  }

  const name =
    findCatalogExerciseById(catalog, exercise.catalogExerciseId)?.name ??
    "Упражнение";

  const handleMaxKgChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = Number(event.target.value.replace(",", "."));
    if (!Number.isFinite(next)) {
      return;
    }
    updateExercise(exercise.id, { maxKg: next });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onBack}>
          Назад
        </Button>
        <h2 className="min-w-0 truncate text-base font-medium text-foreground">
          {name}
        </h2>
      </div>

      <p className="text-sm text-muted-foreground">3 подхода / 2 раза в неделю</p>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="load-table-detail-max">MAX (кг)</Label>
          <Input
            id="load-table-detail-max"
            type="number"
            inputMode="decimal"
            min={0}
            step={0.5}
            value={exercise.maxKg}
            onChange={handleMaxKgChange}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="load-table-detail-body-weight">Вес тела (кг)</Label>
          <Input
            id="load-table-detail-body-weight"
            type="number"
            value={latestWeightKg ?? ""}
            readOnly
            disabled
            className="bg-muted text-muted-foreground"
          />
        </div>
      </div>

      {errorMessage && (
        <p className="text-sm text-destructive">{errorMessage}</p>
      )}

      <LoadTableWeekGrid maxKg={exercise.maxKg} />
    </div>
  );
};
