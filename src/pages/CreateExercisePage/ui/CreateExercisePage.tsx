import { useNavigate, useSearchParams } from "react-router-dom";
import { useMemo } from "react";
import { useExerciseStore } from "@/entities/exercise";
import {
  CreateExercise,
  type CatalogExerciseEditSource,
} from "@/features/createExercise";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";

const findEditingExercise = (
  exerciseId: string,
  exercises: ReturnType<typeof useExerciseStore.getState>["exercises"],
): CatalogExerciseEditSource | undefined => {
  for (const group of exercises) {
    const exercise = group.exercises.find((entry) => entry.id === exerciseId);
    if (exercise) {
      return {
        id: exercise.id,
        category: group.category,
        name: exercise.name,
        iconId: exercise.iconId,
        description: exercise.description,
        photoDataUrls: exercise.photoDataUrls,
        measurementType: exercise.measurementType,
        ...(exercise.measurementStep !== undefined
          ? { measurementStep: exercise.measurementStep }
          : {}),
      };
    }
  }
  return undefined;
};

export const CreateExercisePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const exercises = useExerciseStore((state) => state.exercises);

  const editId = searchParams.get("id")?.trim() ?? "";
  const editCategory = searchParams.get("category")?.trim() ?? "";
  const editName = searchParams.get("name")?.trim() ?? "";
  const defaultCategory = searchParams.get("category")?.trim() ?? undefined;
  const isEditMode = Boolean(editId || (editCategory && editName));

  const editingExercise = useMemo(() => {
    if (!isEditMode) {
      return undefined;
    }
    if (editId) {
      return findEditingExercise(editId, exercises);
    }
    for (const group of exercises) {
      const exercise = group.exercises.find((entry) => entry.name === editName);
      if (exercise && group.category === editCategory) {
        return {
          id: exercise.id,
          category: group.category,
          name: exercise.name,
          iconId: exercise.iconId,
          description: exercise.description,
          photoDataUrls: exercise.photoDataUrls,
          measurementType: exercise.measurementType,
          ...(exercise.measurementStep !== undefined
            ? { measurementStep: exercise.measurementStep }
            : {}),
        };
      }
    }
    return undefined;
  }, [editCategory, editId, editName, exercises, isEditMode]);

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-3xl flex-col gap-4 ">
      {isEditMode && !editingExercise ? (
        <div className="bg-card text-card-foreground rounded-lg border p-4">
          <p className="text-sm">
            Упражнение для редактирования не найдено. Возможно, оно было
            удалено.
          </p>
          <Button className="mt-3" onClick={() => navigate("/exercises")}>
            Вернуться к списку
          </Button>
        </div>
      ) : (
        <CreateExercise
          defaultCategory={defaultCategory}
          editingExercise={editingExercise}
          onCancel={() => navigate("/exercises")}
        />
      )}
    </div>
  );
};
