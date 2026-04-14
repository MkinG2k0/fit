import { useState } from "react";
import { useExerciseStore } from "@/entities/exercise";
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
import type { NewCategory } from "../model/types";

interface CreateCategoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateCategory = ({ open, onOpenChange }: CreateCategoryProps) => {
  const [newCategory, setNewCategory] = useState<NewCategory>({ name: "" });
  const [error, setError] = useState<string>("");

  const allExercises = useExerciseStore((state) => state.exercises);
  const createCategory = useExerciseStore((state) => state.createCategory);

  const handleClose = () => {
    onOpenChange(false);
    setNewCategory({ name: "" });
    setError("");
  };

  const handleCreate = () => {
    const normalizedName = newCategory.name.trim();

    if (!normalizedName) {
      return;
    }

    const isCategoryExists = allExercises.some(
      (group) => group.category.toLowerCase() === normalizedName.toLowerCase(),
    );

    if (isCategoryExists) {
      setError("Категория с таким названием уже существует");
      return;
    }

    createCategory(normalizedName);
    handleClose();
  };

  const isCreateDisabled = !newCategory.name.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Создать категорию</DialogTitle>
          <DialogDescription>
            Введите название новой категории упражнений
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-4">
          <label htmlFor="category-name" className="text-sm font-medium">
            Название категории
          </label>
          <Input
            id="category-name"
            placeholder="Например: Плечи"
            value={newCategory.name}
            onChange={(event) => {
              setNewCategory({ name: event.target.value });
              if (error) {
                setError("");
              }
            }}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Отмена
          </Button>
          <Button onClick={handleCreate} disabled={isCreateDisabled}>
            Создать
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
