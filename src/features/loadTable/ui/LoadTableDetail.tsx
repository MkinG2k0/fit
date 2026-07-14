import { type ChangeEvent, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { findCatalogExerciseById, useExerciseStore } from "@/entities/exercise";
import {
  getLoadTableCurrentWeek,
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

export const LoadTableDetail = ({ exerciseId, onBack }: LoadTableDetailProps) => {
  const location = useLocation();
  const catalog = useExerciseStore((state) => state.exercises);
  const exercise = useLoadTableStore((state) =>
    state.exercises.find((item) => item.id === exerciseId),
  );
  const updateExercise = useLoadTableStore((state) => state.updateExercise);
  const setExerciseTracking = useLoadTableStore(
    (state) => state.setExerciseTracking,
  );
  const resetExerciseProgress = useLoadTableStore(
    (state) => state.resetExerciseProgress,
  );
  const errorMessage = useLoadTableStore((state) => state.errorMessage);

  const [currentWeek, setCurrentWeek] = useState(1);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  useEffect(() => {
    if (!exercise) {
      return;
    }

    const exerciseName = findCatalogExerciseById(
      catalog,
      exercise.catalogExerciseId,
    )?.name;

    let cancelled = false;

    const fetchWeek = () => {
      void getLoadTableCurrentWeek(
        exercise.catalogExerciseId,
        exercise.createdAt,
        exerciseName,
      ).then((result) => {
        if (!cancelled) {
          setCurrentWeek(result.currentWeek);
        }
      });
    };

    fetchWeek();

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchWeek();
      }
    };

    const onPageShow = () => {
      fetchWeek();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pageshow", onPageShow);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [
    exercise?.id,
    exercise?.createdAt,
    exercise?.catalogExerciseId,
    catalog,
    location.key,
  ]);

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

  const handleTrackToggle = () => {
    const nextTracking = !exercise.isTracking;
    setExerciseTracking(exercise.id, nextTracking);
    setStatusMessage(
      nextTracking
        ? "Отслеживание включено. При «Добавить подход» подставятся вес и повторы из таблицы."
        : "Отслеживание выключено.",
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
        <h2 className="min-w-0 truncate text-base font-medium text-foreground">
          {name}
        </h2>
      <p className="text-sm text-muted-foreground">3 подхода / 2 раза в неделю</p>
      </div>


      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={exercise.isTracking ? "secondary" : "default"}
          onClick={handleTrackToggle}
        >
          {exercise.isTracking ? "Отслеживается" : "Отслеживать"}
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
