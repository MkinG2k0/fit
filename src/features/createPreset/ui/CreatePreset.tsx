import { useEffect, useState } from "react";
import {
  type TrainingPreset,
  useCatalogNameById,
  useExerciseStore,
} from "@/entities/exercise";
import { FixedBottomBar } from "@shared/ui";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import { Input } from "@/shared/ui/shadCNComponents/ui/input";
import {
  appendUniqueExerciseIds,
  dedupePreserveOrder,
} from "../lib/presetExerciseIds";
import type { NewPreset } from "../model/types";
import { AddPresetExercisesDrawer } from "./AddPresetExercisesDrawer";
import { PresetCompositionList } from "./PresetCompositionList";

interface CreatePresetProps {
  onCancel?: () => void;
  editingPreset?: TrainingPreset;
  initialExercises?: string[];
}

const createInitialPreset = (
  editingPreset?: TrainingPreset,
  initialExercises: string[] = [],
): NewPreset => {
  if (!editingPreset) {
    return {
      presetName: "",
      exercises: dedupePreserveOrder(initialExercises),
    };
  }

  return {
    presetName: editingPreset.presetName,
    exercises: dedupePreserveOrder(editingPreset.exercises),
  };
};

export const CreatePreset = ({
  onCancel,
  editingPreset,
  initialExercises = [],
}: CreatePresetProps) => {
  const isEditMode = Boolean(editingPreset);
  const [newPreset, setNewPreset] = useState<NewPreset>(() =>
    createInitialPreset(editingPreset, initialExercises),
  );
  const [error, setError] = useState<string>("");
  const nameById = useCatalogNameById();

  const trainingPresets = useExerciseStore((state) => state.trainingPreset);
  const createTrainingPreset = useExerciseStore(
    (state) => state.createTrainingPreset,
  );
  const updateTrainingPreset = useExerciseStore(
    (state) => state.updateTrainingPreset,
  );

  useEffect(() => {
    setNewPreset(createInitialPreset(editingPreset, initialExercises));
    setError("");
  }, [editingPreset, initialExercises]);

  const handleClose = () => {
    onCancel?.();
    setNewPreset(createInitialPreset(editingPreset, initialExercises));
    setError("");
  };

  const handleCreate = () => {
    if (newPreset.presetName && newPreset.exercises.length > 0) {
      const existingPreset = trainingPresets.find(
        (preset) =>
          preset.presetName.toLowerCase() ===
            newPreset.presetName.toLowerCase() &&
          preset.presetName.toLowerCase() !==
            (editingPreset?.presetName.toLowerCase() ?? ""),
      );

      if (existingPreset) {
        setError("Пресет с таким названием уже существует");
        return;
      }

      if (editingPreset) {
        updateTrainingPreset(editingPreset.id!, {
          ...newPreset,
          id: editingPreset.id,
        });
      } else {
        createTrainingPreset(newPreset);
      }

      handleClose();
    }
  };

  const handleAddExercises = (incomingIds: string[]) => {
    setNewPreset((prevState) => ({
      ...prevState,
      exercises: appendUniqueExerciseIds(prevState.exercises, incomingIds),
    }));
  };

  const handleRemoveExercise = (exerciseId: string) => {
    setNewPreset((prevState) => ({
      ...prevState,
      exercises: prevState.exercises.filter((id) => id !== exerciseId),
    }));
  };

  const handleReorderExercises = (ids: string[]) => {
    setNewPreset((prevState) => ({
      ...prevState,
      exercises: ids,
    }));
  };

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-x-hidden overflow-y-auto pb-[calc(11rem+env(safe-area-inset-bottom,0px))]">
        <label htmlFor="preset-name" className="text-sm font-medium">
          Название пресета
        </label>
        <Input
          id="preset-name"
          placeholder="Например: Грудь и трицепс"
          value={newPreset.presetName}
          onChange={(e) => {
            setNewPreset((prevState) => ({
              ...prevState,
              presetName: e.target.value,
            }));
            if (error) setError("");
          }}
        />
        {error && (
          <p className="text-sm text-destructive pt-0 pl-2 mt-[-15px] mb-0">
            {error}
          </p>
        )}

        {newPreset.exercises.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Нажмите «Добавить упражнение», чтобы собрать состав пресета.
          </p>
        ) : (
          <PresetCompositionList
            exercises={newPreset.exercises}
            nameById={nameById}
            onReorder={handleReorderExercises}
            onRemove={handleRemoveExercise}
          />
        )}
      </div>

      <FixedBottomBar>
        <div className="flex flex-col gap-2">
          <AddPresetExercisesDrawer onAdd={handleAddExercises} />
          <Button
            onClick={handleCreate}
            disabled={!newPreset.presetName || newPreset.exercises.length === 0}
          >
            {isEditMode ? "Сохранить" : "Создать"}
          </Button>
        </div>
      </FixedBottomBar>
    </div>
  );
};
