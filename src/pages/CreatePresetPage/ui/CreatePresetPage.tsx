import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useMemo } from "react";
import { type TrainingPreset, useExerciseStore } from "@/entities/exercise";
import { CreatePreset } from "@/features/createPreset";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";

interface PresetPageLocationState {
  initialExercises?: string[];
}

const findEditingPreset = (
  presetName: string,
  presets: TrainingPreset[],
): TrainingPreset | undefined =>
  presets.find((preset) => preset.presetName === presetName);

export const CreatePresetPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const presets = useExerciseStore((state) => state.trainingPreset);

  const editName = searchParams.get("name")?.trim() ?? "";
  const isEditMode = Boolean(editName);
  const state = location.state as PresetPageLocationState | null;

  const editingPreset = useMemo(() => {
    if (!isEditMode) {
      return undefined;
    }
    return findEditingPreset(editName, presets);
  }, [editName, isEditMode, presets]);

  const initialExercises = useMemo(
    () =>
      Array.isArray(state?.initialExercises) ? state.initialExercises : [],
    [state?.initialExercises],
  );

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-3xl flex-col gap-4 p-4">
      {isEditMode && !editingPreset ? (
        <div className="bg-card text-card-foreground rounded-lg border p-4">
          <p className="text-sm">
            Пресет для редактирования не найден. Возможно, он был удален.
          </p>
          <Button className="mt-3" onClick={() => navigate("/exercises")}>
            Вернуться к списку
          </Button>
        </div>
      ) : (
        <CreatePreset
          editingPreset={editingPreset}
          initialExercises={initialExercises}
          onCancel={() => navigate("/exercises")}
        />
      )}
    </div>
  );
};
