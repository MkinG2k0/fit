import { useState } from "react";
import { findCatalogExerciseById, useExerciseStore } from "@/entities/exercise";
import { useLoadTableStore } from "@/entities/loadTable";
import { FullExerciseCommand } from "@/features/fullExerciseList";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/shadCNComponents/ui/dialog";
import { Input } from "@/shared/ui/shadCNComponents/ui/input";
import { Label } from "@/shared/ui/shadCNComponents/ui/label";

interface AddLoadTableExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const isPositiveFiniteNumber = (value: number) => {
  return Number.isFinite(value) && value > 0;
};

export const AddLoadTableExerciseDialog = ({
  open,
  onOpenChange,
}: AddLoadTableExerciseDialogProps) => {
  const catalog = useExerciseStore((state) => state.exercises);
  const addExercise = useLoadTableStore((state) => state.addExercise);
  const clearError = useLoadTableStore((state) => state.clearError);
  const loadTableError = useLoadTableStore((state) => state.errorMessage);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedCatalogId, setSelectedCatalogId] = useState("");
  const [maxKg, setMaxKg] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const selectedName =
    findCatalogExerciseById(catalog, selectedCatalogId)?.name ?? "";

  const resetForm = () => {
    setSelectedCatalogId("");
    setMaxKg("");
    setFormError(null);
    clearError();
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setFormError(null);
      clearError();
    } else {
      resetForm();
      setPickerOpen(false);
    }
    onOpenChange(nextOpen);
  };

  const handleConfirm = () => {
    const parsedMaxKg = Number(maxKg.replace(",", "."));

    if (!selectedCatalogId.trim()) {
      setFormError("Выберите упражнение");
      return;
    }
    if (!isPositiveFiniteNumber(parsedMaxKg)) {
      setFormError("Укажите положительный MAX (кг)");
      return;
    }

    addExercise({
      catalogExerciseId: selectedCatalogId,
      maxKg: parsedMaxKg,
    });

    const storeError = useLoadTableStore.getState().errorMessage;
    if (storeError) {
      setFormError(storeError);
      return;
    }

    handleOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Добавить в таблицу нагрузок</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Упражнение</Label>
              <Button
                type="button"
                variant="outline"
                className="justify-start font-normal"
                onClick={() => setPickerOpen(true)}
              >
                <span className="truncate">
                  {selectedName || "Выберите упражнение"}
                </span>
              </Button>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="load-table-max-kg">MAX (кг)</Label>
              <Input
                id="load-table-max-kg"
                type="number"
                inputMode="decimal"
                min={0}
                step={0.5}
                value={maxKg}
                onChange={(event) => setMaxKg(event.target.value)}
              />
            </div>

            {(formError || loadTableError) && (
              <p className="text-sm text-destructive">
                {formError ?? loadTableError}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Отмена
            </Button>
            <Button type="button" onClick={handleConfirm}>
              Добавить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent showCloseButton={false} className="p-0">
          <div className="flex h-[65dvh] min-h-96 max-h-[80dvh] flex-col">
            <DialogTitle className="pt-4 text-center">
              Выберите упражнение
            </DialogTitle>
            <div className="min-h-0 max-w-full flex-1 overflow-y-auto">
              <FullExerciseCommand
                variant="exercises"
                checkable="radio"
                selectedExerciseCheckboxes={selectedCatalogId}
                exerciseSelectHandler={setSelectedCatalogId}
              />
            </div>
          </div>
          <div className="flex justify-center gap-2 border-border p-2 pt-0">
            <Button type="button" variant="outline" onClick={() => setPickerOpen(false)}>
              Закрыть
            </Button>
            <Button
              type="button"
              disabled={!selectedCatalogId}
              onClick={() => setPickerOpen(false)}
            >
              Выбрать
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
