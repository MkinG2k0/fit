import { useNavigate, useSearchParams } from "react-router-dom";
import { useMemo } from "react";
import { useExerciseStore } from "@/entities/exercise";
import {
  CreateExercise,
  type CatalogExerciseEditSource,
} from "@/features/createExercise";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";

const findEditingExercise = (
  category: string,
  name: string,
  exercises: ReturnType<typeof useExerciseStore.getState>["exercises"],
): CatalogExerciseEditSource | undefined => {
  const exerciseGroup = exercises.find((group) => group.category === category);
  const exercise = exerciseGroup?.exercises.find(
    (entry) => entry.name === name,
  );
  if (!exercise || !exerciseGroup) {
    return undefined;
  }
  return {
    category: exerciseGroup.category,
    name: exercise.name,
    iconId: exercise.iconId,
    description: exercise.description,
    photoDataUrls: exercise.photoDataUrls,
  };
};

export const CreateExercisePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const exercises = useExerciseStore((state) => state.exercises);

  const editCategory = searchParams.get("category")?.trim() ?? "";
  const editName = searchParams.get("name")?.trim() ?? "";
  const defaultCategory = searchParams.get("category")?.trim() ?? undefined;
  const isEditMode = Boolean(editCategory && editName);

  const editingExercise = useMemo(() => {
    if (!isEditMode) {
      return undefined;
    }
    return findEditingExercise(editCategory, editName, exercises);
  }, [editCategory, editName, exercises, isEditMode]);

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-3xl flex-col gap-4 p-4">
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
