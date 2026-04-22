import { type ChangeEvent, useEffect, useState } from "react";
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

const MAX_PHOTO_SIZE_BYTES = 2 * 1024 * 1024;

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
    description: "",
    photoDataUrl: "",
  });
  const [error, setError] = useState<string>("");
  const [photoError, setPhotoError] = useState<string>("");
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
        description: editingExercise.description,
        photoDataUrl: editingExercise.photoDataUrl,
      });
    } else {
      setNewExercise({
        category: defaultCategory ?? "",
        name: "",
        iconId: defaultIconIdForCategory(defaultCategory ?? ""),
        description: "",
        photoDataUrl: "",
      });
    }
    setError("");
    setPhotoError("");
  }, [defaultCategory, editingExercise, open]);

  const handleClose = () => {
    onOpenChange(false);
    setNewExercise({
      category: "",
      name: "",
      iconId: DEFAULT_EXERCISE_ICON_ID,
      description: "",
      photoDataUrl: "",
    });
    setError("");
    setPhotoError("");
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
        description: newExercise.description,
        photoDataUrl: newExercise.photoDataUrl,
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
      description: newExercise.description.trim(),
      photoDataUrl: newExercise.photoDataUrl.trim(),
    });
    handleClose();
  };

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setPhotoError("Можно загрузить только изображение.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_PHOTO_SIZE_BYTES) {
      setPhotoError("Фото должно быть меньше 2 МБ.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result =
        typeof reader.result === "string" ? reader.result.trim() : "";
      setNewExercise((prevState) => ({
        ...prevState,
        photoDataUrl: result,
      }));
      setPhotoError("");
    };
    reader.onerror = () => {
      setPhotoError("Не удалось прочитать файл. Попробуйте другое фото.");
    };
    reader.readAsDataURL(file);
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
        <DialogContent className="max-h-[90dvh] min-w-0 overflow-x-hidden">
          <div className="flex min-h-0 min-w-0 w-full flex-col gap-4">
            <DialogHeader className="min-w-0">
              <DialogTitle>
                {isEditing ? "Редактировать упражнение" : "Создать упражнение"}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? "Измените категорию, иконку, название, описание и фото упражнения"
                  : "Выберите категорию, иконку, название, описание и фото нового упражнения"}
              </DialogDescription>
            </DialogHeader>
            <div className="min-w-0 space-y-2">
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

            <div className="min-w-0 space-y-4">
              <div className="min-w-0 space-y-2">
                <label
                  htmlFor="exercise-description"
                  className="text-sm font-medium"
                >
                  Описание выполнения
                </label>
                <textarea
                  id="exercise-description"
                  rows={4}
                  placeholder="Например: Лопатки сведены, ноги на полу, опускать штангу к середине груди"
                  value={newExercise.description}
                  onChange={(e) =>
                    setNewExercise({
                      ...newExercise,
                      description: e.target.value,
                    })
                  }
                  className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="min-w-0 space-y-2">
                <label htmlFor="exercise-photo" className="text-sm font-medium">
                  Фото упражнения
                </label>
                <Input
                  id="exercise-photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
                {photoError ? (
                  <p className="text-sm text-red-500">{photoError}</p>
                ) : null}
                {newExercise.photoDataUrl ? (
                  <div className="space-y-2">
                    <img
                      src={newExercise.photoDataUrl}
                      alt={`Фото упражнения ${newExercise.name || ""}`}
                      className="h-36 w-full rounded-md border object-cover"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setNewExercise((prevState) => ({
                          ...prevState,
                          photoDataUrl: "",
                        }))
                      }
                    >
                      Удалить фото
                    </Button>
                  </div>
                ) : null}
              </div>

              <div className="min-w-0 space-y-2">
                <label htmlFor="category" className="text-sm font-medium">
                  Категория
                </label>
                <div className="min-w-0 w-full max-w-full overflow-x-auto overflow-y-hidden overscroll-x-contain pb-1">
                  <div className="flex w-max min-w-full flex-nowrap gap-2">
                    {allExercises.map((category) => (
                      <Button
                        key={category.category}
                        type="button"
                        variant={
                          newExercise.category === category.category
                            ? "default"
                            : "outline"
                        }
                        className="shrink-0 whitespace-nowrap"
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
              </div>

              <div className="min-w-0 space-y-2">
                <span
                  id="exercise-icon-picker-label"
                  className="text-sm font-medium"
                >
                  Иконка
                </span>
                <div className="min-w-0 w-full max-w-full overflow-x-auto overflow-y-hidden overscroll-x-contain pb-1">
                  <div
                    className="flex w-max min-w-full flex-nowrap gap-2"
                    role="listbox"
                    aria-labelledby="exercise-icon-picker-label"
                  >
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
            </div>

            <DialogFooter className="min-w-0">
              <Button variant="outline" onClick={handleClose}>
                Отмена
              </Button>

              <Button
                onClick={handleSave}
                disabled={!newExercise.category || !newExercise.name.trim()}
              >
                {isEditing ? "Сохранить" : "Создать"}
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
          </div>
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
