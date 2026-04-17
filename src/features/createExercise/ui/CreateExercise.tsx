import { useEffect, useState } from "react";
import {
  DEFAULT_EXERCISE_ICON_ID,
  EXERCISE_ICON_PICKER_IDS,
  defaultIconIdForCategory,
  useExerciseStore,
  type ExerciseIconId,
} from "@/entities/exercise";
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
import { DeleteDialog } from "@/features/fullExerciseList/ui/DeleteDialog";
import type { CatalogExerciseEditSource, NewExercise } from "../model/types";
import { ExerciseIconOption } from "./ExerciseIconOption";

interface CreateExerciseProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultCategory?: string;
  editingExercise?: CatalogExerciseEditSource;
}

export const CreateExercise = ({
  open,
  onOpenChange,
  defaultCategory,
  editingExercise,
}: CreateExerciseProps) => {
  const [newExercise, setNewExercise] = useState<NewExercise>({
    category: "",
    name: "",
    iconId: DEFAULT_EXERCISE_ICON_ID,
  });
  const [error, setError] = useState<string>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const createExercise = useExerciseStore((state) => state.createExercise);
  const updateExercise = useExerciseStore((state) => state.updateExercise);
  const deleteExercise = useExerciseStore((state) => state.deleteExercise);
  const allExercises = useExerciseStore((state) => state.exercises);
  const isEditing = Boolean(editingExercise);

  useEffect(() => {
    if (!open) {
      setDeleteDialogOpen(false);
      return;
    }

    if (editingExercise) {
      setNewExercise({
        category: editingExercise.category,
        name: editingExercise.name,
        iconId: editingExercise.iconId,
      });
    } else {
      setNewExercise({
        category: defaultCategory ?? "",
        name: "",
        iconId: defaultIconIdForCategory(defaultCategory ?? ""),
      });
    }
    setError("");
  }, [defaultCategory, editingExercise, open]);

  const handleClose = () => {
    onOpenChange(false);
    setNewExercise({
      category: "",
      name: "",
      iconId: DEFAULT_EXERCISE_ICON_ID,
    });
    setError("");
  };

  const handleIconSelect = (iconId: ExerciseIconId) => {
    setNewExercise((prevState) => ({ ...prevState, iconId }));
  };

  const handleSave = () => {
    const trimmedName = newExercise.name.trim();
    if (!newExercise.category || !trimmedName) {
      return;
    }

    if (editingExercise) {
      const duplicateElsewhere = allExercises.some((group) =>
        group.exercises.some(
          (exercise) =>
            exercise.name.toLowerCase() === trimmedName.toLowerCase() &&
            !(
              group.category === editingExercise.category &&
              exercise.name === editingExercise.name
            ),
        ),
      );

      if (duplicateElsewhere) {
        setError("Упражнение с таким названием уже существует");
        return;
      }

      updateExercise({
        previousName: editingExercise.name,
        previousCategory: editingExercise.category,
        name: trimmedName,
        category: newExercise.category,
        iconId: newExercise.iconId,
      });
      handleClose();
      return;
    }

    const existingExercise = allExercises.some((category) =>
      category.exercises.some(
        (exercise) => exercise.name.toLowerCase() === trimmedName.toLowerCase(),
      ),
    );

    if (existingExercise) {
      setError("Упражнение с таким названием уже существует");
      return;
    }

    createExercise({
      ...newExercise,
      name: trimmedName,
    });
    handleClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!editingExercise) {
      return;
    }
    deleteExercise(editingExercise.name, editingExercise.category);
    setDeleteDialogOpen(false);
    handleClose();
  };

  const handleDeleteDialogOpenChange = (nextOpen: boolean) => {
    setDeleteDialogOpen(nextOpen);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={"max-h-[90dvh]"}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Редактировать упражнение" : "Создать упражнение"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Измените категорию, иконку или название упражнения"
                : "Выберите категорию, иконку и название нового упражнения"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">
                Категория
              </label>
              {/* <CategorySelector
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
            /> */}
              <div className="flex gap-2 flex-wrap">
                {allExercises.map((category) => (
                  <Button
                    key={category.category}
                    variant={
                      newExercise.category === category.category
                        ? "default"
                        : "outline"
                    }
                    onClick={() =>
                      setNewExercise({
                        ...newExercise,
                        category: category.category,
                        iconId: defaultIconIdForCategory(category.category),
                      })
                    }
                  >
                    {category.category}
                  </Button>
                ))}
              </div>
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
              {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium">Иконка</span>
              <div className="flex flex-wrap gap-2">
                {EXERCISE_ICON_PICKER_IDS.map((iconId) => (
                  <ExerciseIconOption
                    key={iconId}
                    iconId={iconId}
                    isSelected={newExercise.iconId === iconId}
                    onSelect={handleIconSelect}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={handleSave}
              disabled={!newExercise.category || !newExercise.name.trim()}
            >
              {isEditing ? "Сохранить" : "Создать"}
            </Button>

            <Button variant="outline" onClick={handleClose}>
              Отмена
            </Button>

            {isEditing && editingExercise && (
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleDeleteClick}
              >
                Удалить упражнение
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {editingExercise && (
        <DeleteDialog
          open={deleteDialogOpen}
          onOpenChange={handleDeleteDialogOpenChange}
          type="exercise"
          name={editingExercise.name}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </>
  );
};
