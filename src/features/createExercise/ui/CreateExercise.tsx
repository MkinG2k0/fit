import { Camera, MediaTypeSelection } from "@capacitor/camera";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
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

const MAX_PHOTO_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_PHOTOS_COUNT = 8;

const buildResetExerciseState = (): NewExercise => ({
  category: "",
  name: "",
  iconId: DEFAULT_EXERCISE_ICON_ID,
  description: "",
  photoDataUrls: [],
});

const buildInitialExerciseState = (
  defaultCategory: string | undefined,
  editingExercise: CatalogExerciseEditSource | undefined,
): NewExercise => {
  if (editingExercise) {
    return {
      category: editingExercise.category,
      name: editingExercise.name,
      iconId: editingExercise.iconId,
      description: editingExercise.description,
      photoDataUrls: editingExercise.photoDataUrls,
    };
  }

  return {
    category: defaultCategory ?? "",
    name: "",
    iconId: defaultIconIdForCategory(defaultCategory ?? ""),
    description: "",
    photoDataUrls: [],
  };
};

interface CreateExerciseProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultCategory?: string;
  editingExercise?: CatalogExerciseEditSource;
}

interface PhotoCandidate {
  webPath?: string;
  metadata?: {
    size?: number;
  };
}

export const CreateExercise = ({
  open,
  onOpenChange,
  defaultCategory,
  editingExercise,
}: CreateExerciseProps) => {
  const [newExercise, setNewExercise] = useState<NewExercise>(buildResetExerciseState);
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

    setNewExercise(buildInitialExerciseState(defaultCategory, editingExercise));
    setError("");
    setPhotoError("");
  }, [defaultCategory, editingExercise, open]);

  const handleClose = () => {
    onOpenChange(false);
    setNewExercise(buildResetExerciseState());
    setError("");
    setPhotoError("");
  };

  const handleIconSelect = (iconId: ExerciseIconId) => {
    setNewExercise((prevState) => ({ ...prevState, iconId }));
  };

  const normalizeName = (name: string) => name.trim();

  const normalizeDescription = (description: string) => description.trim();

  const normalizePhotoDataUrls = (photoDataUrls: string[]) =>
    photoDataUrls
      .map((photoDataUrl) => photoDataUrl.trim())
      .filter((photoDataUrl) => photoDataUrl.length > 0);

  const hasExerciseNameDuplicate = (
    normalizedName: string,
    sourceExercise: CatalogExerciseEditSource | undefined,
  ) =>
    allExercises.some((group) =>
      group.exercises.some((exercise) => {
        const nameMatches =
          exercise.name.toLowerCase() === normalizedName.toLowerCase();
        if (!nameMatches) {
          return false;
        }
        if (!sourceExercise) {
          return true;
        }
        return !(
          group.category === sourceExercise.category &&
          exercise.name === sourceExercise.name
        );
      }),
    );

  const buildCreateExercisePayload = (normalizedName: string): NewExercise => ({
    ...newExercise,
    name: normalizedName,
    description: normalizeDescription(newExercise.description),
    photoDataUrls: normalizePhotoDataUrls(newExercise.photoDataUrls),
  });

  const buildUpdateExercisePayload = (normalizedName: string) => {
    if (!editingExercise) {
      return null;
    }

    return {
      previousName: editingExercise.name,
      previousCategory: editingExercise.category,
      name: normalizedName,
      category: newExercise.category,
      iconId: newExercise.iconId,
      description: newExercise.description,
      photoDataUrls: newExercise.photoDataUrls,
    };
  };

  const handleSave = () => {
    const normalizedName = normalizeName(newExercise.name);
    if (!newExercise.category || !normalizedName) {
      return;
    }

    if (hasExerciseNameDuplicate(normalizedName, editingExercise)) {
      setError("Упражнение с таким названием уже существует");
      return;
    }

    if (editingExercise) {
      const payload = buildUpdateExercisePayload(normalizedName);
      if (!payload) {
        return;
      }
      updateExercise(payload);
      handleClose();
      return;
    }

    createExercise(buildCreateExercisePayload(normalizedName));
    handleClose();
  };

  const readBlobAsDataUrl = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = typeof reader.result === "string" ? reader.result : "";
        resolve(result.trim());
      };
      reader.onerror = () => reject(new Error("read-error"));
      reader.readAsDataURL(blob);
    });

  const webPathToDataUrl = async (webPath: string): Promise<string> => {
    const response = await fetch(webPath);
    const blob = await response.blob();
    return readBlobAsDataUrl(blob);
  };

  const appendPhotoDataUrls = (newPhotoDataUrls: string[]) => {
    setNewExercise((prevState) => {
      const mergedPhotoDataUrls = [
        ...prevState.photoDataUrls,
        ...newPhotoDataUrls,
      ].slice(0, MAX_PHOTOS_COUNT);
      return {
        ...prevState,
        photoDataUrls: mergedPhotoDataUrls,
      };
    });
  };

  const getPhotoSlotsLeft = () =>
    MAX_PHOTOS_COUNT - newExercise.photoDataUrls.length;

  const ensurePhotoSlotsLeft = () => {
    const slotsLeft = getPhotoSlotsLeft();
    if (slotsLeft <= 0) {
      setPhotoError(`Можно добавить максимум ${MAX_PHOTOS_COUNT} фото.`);
      return null;
    }
    return slotsLeft;
  };

  const isPhotoTooLarge = (size: number | undefined) =>
    typeof size === "number" && size > MAX_PHOTO_SIZE_BYTES;

  const loadPhotoDataUrls = async (photoCandidates: PhotoCandidate[]) => {
    const loadedDataUrls: string[] = [];
    let skippedLarge = 0;

    for (const photoCandidate of photoCandidates) {
      if (isPhotoTooLarge(photoCandidate.metadata?.size)) {
        skippedLarge += 1;
        continue;
      }
      if (!photoCandidate.webPath) {
        continue;
      }
      const dataUrl = await webPathToDataUrl(photoCandidate.webPath);
      loadedDataUrls.push(dataUrl);
    }

    return {
      loadedDataUrls,
      skippedLarge,
    };
  };

  const handlePickPhotos = async () => {
    if (!ensurePhotoSlotsLeft()) {
      return;
    }

    try {
      const result = await Camera.takePhoto({
        includeMetadata: true,
        quality: 90,
        saveToGallery: false,
      });

      if (!result.webPath) {
        setPhotoError("Не удалось получить фото с камеры.");
        return;
      }

      if (isPhotoTooLarge(result.metadata?.size)) {
        setPhotoError("Фото превышает 10 МБ.");
        return;
      }

      const { loadedDataUrls } = await loadPhotoDataUrls([result]);
      if (!loadedDataUrls.length) {
        setPhotoError("Не удалось получить фото с камеры.");
        return;
      }

      appendPhotoDataUrls(loadedDataUrls);
      setPhotoError("");
    } catch {
      setPhotoError("Не удалось сделать фото через камеру.");
    }
  };

  const handlePickFromGallery = async () => {
    const slotsLeft = ensurePhotoSlotsLeft();
    if (!slotsLeft) {
      return;
    }

    try {
      const { results } = await Camera.chooseFromGallery({
        mediaType: MediaTypeSelection.Photo,
        allowMultipleSelection: true,
        limit: slotsLeft,
        includeMetadata: true,
        quality: 90,
      });

      if (!results.length) {
        return;
      }

      const { loadedDataUrls, skippedLarge } = await loadPhotoDataUrls(results);

      if (!loadedDataUrls.length) {
        setPhotoError(
          skippedLarge > 0
            ? "Выбранные фото превышают 10 МБ."
            : "Не удалось получить выбранные фото.",
        );
        return;
      }

      appendPhotoDataUrls(loadedDataUrls);
      setPhotoError(
        skippedLarge > 0
          ? `Некоторые фото пропущены: размер больше 10 МБ (${skippedLarge}).`
          : "",
      );
    } catch {
      setPhotoError("Не удалось выбрать фото из галереи.");
    }
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
              <div className="flex gap-2 flex-col ">
                <label htmlFor="exercise-photo" className="text-sm font-medium">
                  Фото упражнения
                </label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePickPhotos}
                  >
                    Сделать фото
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePickFromGallery}
                  >
                    Выбрать из галереи
                  </Button>
                </div>
                {photoError ? (
                  <p className="text-sm text-red-500">{photoError}</p>
                ) : null}
                <p className="text-xs text-muted-foreground">
                  До {MAX_PHOTOS_COUNT} фото, каждое до 10 МБ.
                </p>
                {newExercise.photoDataUrls.length > 0 ? (
                  <div className="space-y-2">
                    <Swiper
                      slidesPerView={1}
                      spaceBetween={8}
                      className="w-full"
                    >
                      {newExercise.photoDataUrls.map((photoDataUrl, index) => (
                        <SwiperSlide key={photoDataUrl}>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">
                              Фото {index + 1} из{" "}
                              {newExercise.photoDataUrls.length}
                            </p>
                            <img
                              src={photoDataUrl}
                              alt={`Фото упражнения ${newExercise.name || ""} #${index + 1}`}
                              className="h-40 w-full rounded-md border object-cover"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full"
                              onClick={() =>
                                setNewExercise((prevState) => ({
                                  ...prevState,
                                  photoDataUrls: prevState.photoDataUrls.filter(
                                    (_, photoIndex) => photoIndex !== index,
                                  ),
                                }))
                              }
                            >
                              Удалить
                            </Button>
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
                ) : null}
              </div>

              <div className="min-w-0 space-y-2">
                <label htmlFor="category" className="text-sm font-medium">
                  Категория
                </label>
                <div className="min-w-0 w-full max-w-full overflow-x-auto overflow-y-hidden overscroll-x-contain pb-2">
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
                <div className="min-w-0 w-full max-w-full overflow-x-auto overflow-y-hidden overscroll-x-contain pb-2">
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
