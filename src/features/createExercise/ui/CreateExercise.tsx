import { Camera, MediaTypeSelection } from "@capacitor/camera";
import { useEffect, useState } from "react";
import {
  DEFAULT_EXERCISE_ICON_ID,
  defaultIconIdForCategory,
  useExerciseStore,
  type ExerciseIconId,
} from "@/entities/exercise";
import {
  Dialog,
  DialogContent,
} from "@/shared/ui/shadCNComponents/ui/dialog";
import { DeleteDialog } from "@/features/fullExerciseList/ui/DeleteDialog";
import type { CatalogExerciseEditSource, NewExercise } from "../model/types";
import { CreateExerciseCategorySection } from "./CreateExerciseCategorySection";
import { CreateExerciseDescriptionField } from "./CreateExerciseDescriptionField";
import { CreateExerciseFooter } from "./CreateExerciseFooter";
import { CreateExerciseHeader } from "./CreateExerciseHeader";
import { CreateExerciseIconSection } from "./CreateExerciseIconSection";
import { CreateExerciseNameField } from "./CreateExerciseNameField";
import { CreateExercisePhotosSection } from "./CreateExercisePhotosSection";

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

  const handleNameChange = (name: string) => {
    setNewExercise((prevState) => ({ ...prevState, name }));
    if (error) {
      setError("");
    }
  };

  const handleDescriptionChange = (description: string) => {
    setNewExercise((prevState) => ({ ...prevState, description }));
  };

  const handlePhotoRemove = (index: number) => {
    setNewExercise((prevState) => ({
      ...prevState,
      photoDataUrls: prevState.photoDataUrls.filter(
        (_, photoIndex) => photoIndex !== index,
      ),
    }));
  };

  const handleCategorySelect = (category: string) => {
    setNewExercise((prevState) => ({
      ...prevState,
      category,
      iconId: defaultIconIdForCategory(category),
    }));
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90dvh] min-w-0 overflow-x-hidden">
          <div className="flex min-h-0 min-w-0 w-full flex-col gap-4">
            <CreateExerciseHeader isEditing={isEditing} />
            <CreateExerciseNameField
              name={newExercise.name}
              error={error}
              onNameChange={handleNameChange}
            />
            <div className="min-w-0 space-y-4">
              <CreateExerciseDescriptionField
                description={newExercise.description}
                onDescriptionChange={handleDescriptionChange}
              />
              <CreateExercisePhotosSection
                photoDataUrls={newExercise.photoDataUrls}
                exerciseName={newExercise.name}
                photoError={photoError}
                maxPhotosCount={MAX_PHOTOS_COUNT}
                onTakePhoto={handlePickPhotos}
                onPickFromGallery={handlePickFromGallery}
                onRemovePhoto={handlePhotoRemove}
              />
              <CreateExerciseCategorySection
                categories={allExercises}
                selectedCategory={newExercise.category}
                onSelectCategory={handleCategorySelect}
              />
              <CreateExerciseIconSection
                selectedIconId={newExercise.iconId}
                onSelectIcon={handleIconSelect}
              />
            </div>

            <CreateExerciseFooter
              isEditing={isEditing}
              canDelete={Boolean(isEditing && editingExercise)}
              saveDisabled={!newExercise.category || !newExercise.name.trim()}
              onCancel={handleClose}
              onSave={handleSave}
              onDelete={handleDeleteClick}
            />
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
