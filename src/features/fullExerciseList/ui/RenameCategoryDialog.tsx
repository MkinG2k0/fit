import { useEffect, useState } from "react";
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

interface RenameCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
  existingCategories: string[];
  onConfirm: (newCategoryName: string) => void;
}

export const RenameCategoryDialog = ({
  open,
  onOpenChange,
  currentName,
  existingCategories,
  onConfirm,
}: RenameCategoryDialogProps) => {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setNewCategoryName(currentName);
      setError("");
    }
  }, [currentName, open]);

  const handleConfirm = () => {
    const normalizedCategoryName = newCategoryName.trim();

    if (!normalizedCategoryName) {
      setError("Название категории не может быть пустым");
      return;
    }

    const isCategoryExists = existingCategories.some(
      (categoryName) =>
        categoryName.toLowerCase() === normalizedCategoryName.toLowerCase() &&
        categoryName.toLowerCase() !== currentName.toLowerCase(),
    );

    if (isCategoryExists) {
      setError("Категория с таким названием уже существует");
      return;
    }

    onConfirm(normalizedCategoryName);
    onOpenChange(false);
  };

  const handleDialogClose = () => {
    onOpenChange(false);
  };

  const handleNameChange = (value: string) => {
    setNewCategoryName(value);
    if (error) {
      setError("");
    }
  };

  const isConfirmDisabled = !newCategoryName.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Изменить категорию</DialogTitle>
          <DialogDescription>
            Введите новое название категории
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <label htmlFor="rename-category-input" className="text-sm font-medium">
            Название категории
          </label>
          <Input
            id="rename-category-input"
            value={newCategoryName}
            onChange={(event) => handleNameChange(event.target.value)}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleDialogClose}>
            Отмена
          </Button>
          <Button onClick={handleConfirm} disabled={isConfirmDisabled}>
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
