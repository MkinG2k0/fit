import { type ChangeEvent, useEffect, useMemo, useState } from "react";
import {
  selectSortedBodyMetricsEntries,
  useBodyMetricsStore,
} from "@/entities/bodyMetrics";
import { useCalendarStore } from "@/entities/calendarDay";
import { findCatalogExerciseById, useExerciseStore } from "@/entities/exercise";
import {
  getLoadTableCurrentWeek,
  getPlanSetsForWeek,
  useLoadTableStore,
} from "@/entities/loadTable";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/shadCNComponents/ui/dialog";
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
  const resetExerciseProgress = useLoadTableStore(
    (state) => state.resetExerciseProgress,
  );
  const errorMessage = useLoadTableStore((state) => state.errorMessage);

  const selectedDate = useCalendarStore((state) => state.selectedDate);
  const days = useCalendarStore((state) => state.days);
  const syncExerciseSetsFromPlan = useCalendarStore(
    (state) => state.syncExerciseSetsFromPlan,
  );

  const [currentWeek, setCurrentWeek] = useState(1);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const latestWeightKg = useMemo(
    () => resolveLatestWeightKg(bodyEntries),
    [bodyEntries],
  );

  useEffect(() => {
    if (!exercise) {
      return;
    }

    let cancelled = false;
    void getLoadTableCurrentWeek(
      exercise.catalogExerciseId,
      exercise.createdAt,
    ).then((result) => {
      if (!cancelled) {
        setCurrentWeek(result.currentWeek);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [exercise?.id, exercise?.createdAt, exercise?.catalogExerciseId]);

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

  const handleTrack = () => {
    const planSets = getPlanSetsForWeek(exercise.maxKg, currentWeek);
    const dateKey = selectedDate.format("DD-MM-YYYY");
    const dayExercises = days[dateKey]?.exercises ?? [];
    const dayExercise = dayExercises.find(
      (item) => item.catalogExerciseId === exercise.catalogExerciseId,
    );

    if (!dayExercise) {
      setStatusMessage(
        "Упражнения нет в выбранном дне календаря. Добавьте его в дневник, затем нажмите «Отслеживать».",
      );
      return;
    }

    syncExerciseSetsFromPlan(dayExercise, planSets);
    setStatusMessage(
      `Подходы обновлены: 3×${planSets[0]!.weight} кг × ${planSets[0]!.reps} (неделя ${currentWeek}).`,
    );
  };

  const handleResetConfirm = () => {
    resetExerciseProgress(exercise.id);
    setIsResetDialogOpen(false);
    setCurrentWeek(1);
    setStatusMessage("Счёт недель сброшен. Текущая неделя — 1.");
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

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={handleTrack}>
          Отслеживать
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsResetDialogOpen(true)}
        >
          Сбросить
        </Button>
      </div>

      {statusMessage && (
        <p className="text-sm text-muted-foreground">{statusMessage}</p>
      )}

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

      <LoadTableWeekGrid maxKg={exercise.maxKg} currentWeek={currentWeek} />

      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Сбросить счёт недель?</DialogTitle>
            <DialogDescription>
              Счётчик недель обнулится: программа начнётся заново с недели 1.
              Записи в дневнике тренировок не изменятся.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsResetDialogOpen(false)}
            >
              Отмена
            </Button>
            <Button type="button" variant="destructive" onClick={handleResetConfirm}>
              Сбросить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
