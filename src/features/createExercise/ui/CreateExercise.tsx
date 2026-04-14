import { useState } from "react";
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
import { useExerciseStore } from "@/entities/exercise";
import type { NewExercise } from "../model/types";
import { useCategorySelector } from "../lib/useCategorySelector";
import { CategorySelector } from "./CategorySelector";

interface CreateExerciseProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateExercise = ({ open, onOpenChange }: CreateExerciseProps) => {
  const [newExercise, setNewExercise] = useState<NewExercise>({
    category: "",
    name: "",
  });
  const [error, setError] = useState<string>("");
  const createExercise = useExerciseStore((state) => state.createExercise);
  const allExercises = useExerciseStore((state) => state.exercises);
  const {
    focused,
    commandRef,
    handleBlur,
    handleFocus,
    handleSelect,
    setFocused,
  } = useCategorySelector();

  const handleClose = () => {
    onOpenChange(false);
    setNewExercise({ category: "", name: "" });
    setError("");
    setFocused(false);
  };

  const handleCreate = () => {
    if (newExercise.category && newExercise.name) {
      // Check if exercise with this name already exists in any category
      const existingExercise = allExercises.some(category =>
        category.exercises.some(exercise =>
          exercise.toLowerCase() === newExercise.name.toLowerCase()
        )
      );

      if (existingExercise) {
        setError("Упражнение с таким названием уже существует");
        return;
      }

      createExercise(newExercise);
      handleClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={"max-h-[90dvh]"}>
        <DialogHeader>
          <DialogTitle>Создать упражнение</DialogTitle>
          <DialogDescription>
            Введите категорию и название нового упражнения
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium">
              Категория
            </label>
            <CategorySelector
              value={newExercise.category}
              onValueChange={(value) =>
                setNewExercise({ ...newExercise, category: value })
              }
              onFocus={handleFocus}
              onBlur={handleBlur}
              onSelect={handleSelect}
              focused={focused}
              commandRef={commandRef}
              allExercises={allExercises}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="exercise-name" className="text-sm font-medium">
              Название упражнения
            </label>
            <Input
              id="exercise-name"
              placeholder="Например: Жим лежа"
              value={newExercise.name}
              onChange={(e) => {
                setNewExercise({ ...newExercise, name: e.target.value });
                if (error) setError("");
              }}
            />
            {error && (
              <p className="text-sm text-red-500 mt-1">{error}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Отмена
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!newExercise.category || !newExercise.name}
          >
            Создать
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
