import { type ChangeEvent, useState } from "react";
import { findCatalogExerciseById, useExerciseStore } from "@/entities/exercise";
import { useLoadTableStore } from "@/entities/loadTable";
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

const toNonNegativeMaxKg = (draft: string, fallback: number): number => {
  let value = draft.replace(",", ".");
  if (value === "." || value.endsWith(".")) {
    value = value.slice(0, -1);
  }
  if (value === "") {
    return 0;
  }
  const next = Number(value);
  if (!Number.isFinite(next) || next < 0) {
    return fallback;
  }
  return next;
};

export const LoadTableDetail = ({ exerciseId, onBack }: LoadTableDetailProps) => {
  const catalog = useExerciseStore((state) => state.exercises);
  const exercise = useLoadTableStore((state) =>
    state.exercises.find((item) => item.id === exerciseId),
  );
  const updateExercise = useLoadTableStore((state) => state.updateExercise);
  const advanceExerciseWeek = useLoadTableStore(
    (state) => state.advanceExerciseWeek,
  );
  const resetExerciseProgress = useLoadTableStore(
    (state) => state.resetExerciseProgress,
  );
  const errorMessage = useLoadTableStore((state) => state.errorMessage);
  const clearError = useLoadTableStore((state) => state.clearError);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isMaxKgFocused, setIsMaxKgFocused] = useState(false);
  const [maxKgDraft, setMaxKgDraft] = useState("");

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
  const isLastWeek = exercise.currentWeek >= 16;

  const handleMaxKgFocus = () => {
    setIsMaxKgFocused(true);
    setMaxKgDraft(String(exercise.maxKg));
  };

  const handleMaxKgChange = (event: ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeDecimalDraft(event.target.value);
    if (sanitized === null) {
      return;
    }
    setMaxKgDraft(sanitized);
    if (!isCompleteDecimalDraft(sanitized)) {
      return;
    }
    if (sanitized === "") {
      updateExercise(exercise.id, { maxKg: 0 });
      return;
    }
    const next = Number(sanitized);
    if (!Number.isFinite(next) || next < 0) {
      return;
    }
    updateExercise(exercise.id, { maxKg: next });
  };

  const handleMaxKgBlur = () => {
    const next = toNonNegativeMaxKg(maxKgDraft, exercise.maxKg);
    updateExercise(exercise.id, { maxKg: next });
    setIsMaxKgFocused(false);
    setMaxKgDraft("");
  };

  const handleAdvanceWeek = () => {
    clearError();
    advanceExerciseWeek(exercise.id);
    const nextWeek = Math.min(16, exercise.currentWeek + 1);
    if (exercise.currentWeek < 16) {
      setStatusMessage(`Текущая неделя — ${nextWeek}.`);
    }
  };

  const handleResetConfirm = () => {
    clearError();
    resetExerciseProgress(exercise.id);
    setIsResetDialogOpen(false);
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
          onClick={handleAdvanceWeek}
          disabled={isLastWeek}
        >
          Следующая неделя
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsResetDialogOpen(true)}
        >
          Сбросить
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Текущая неделя: {exercise.currentWeek} из 16. При «Добавить подход» в
        дневнике подставятся вес и повторы этой недели.
      </p>

      {statusMessage && (
        <p className="text-sm text-muted-foreground">{statusMessage}</p>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="load-table-detail-max">MAX (кг)</Label>
        <Input
          id="load-table-detail-max"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={isMaxKgFocused ? maxKgDraft : String(exercise.maxKg)}
          onFocus={handleMaxKgFocus}
          onChange={handleMaxKgChange}
          onBlur={handleMaxKgBlur}
        />
      </div>

      {errorMessage && (
        <p className="text-sm text-destructive">{errorMessage}</p>
      )}

      <LoadTableWeekGrid
        maxKg={exercise.maxKg}
        currentWeek={exercise.currentWeek}
      />

      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Сбросить счёт недель?</DialogTitle>
            <DialogDescription>
              Текущая неделя станет 1. Записи в дневнике тренировок не изменятся.
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
