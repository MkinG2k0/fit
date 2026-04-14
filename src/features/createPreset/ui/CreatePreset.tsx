import { ChevronDown, ChevronRight, Pipette } from "lucide-react";
import { type ChangeEvent, useEffect, useState } from "react";
import { type RgbaColor, RgbaColorPicker } from "react-colorful";
import { type TrainingPreset, useExerciseStore } from "@/entities/exercise";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/shadCNComponents/ui/popover.tsx";
import type { NewPreset } from "../model/types";

interface CreatePresetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingPreset?: TrainingPreset;
}

const DEFAULT_PRESET_COLOR: RgbaColor = { r: 255, g: 0, b: 0, a: 1 };

const createInitialPreset = (editingPreset?: TrainingPreset): NewPreset => {
  if (!editingPreset) {
    return {
      presetName: "",
      exercises: [],
      presetColor: DEFAULT_PRESET_COLOR,
    };
  }

  return {
    presetName: editingPreset.presetName,
    exercises: [...editingPreset.exercises],
    presetColor: editingPreset.presetColor,
  };
};

export const CreatePreset = ({
  open,
  onOpenChange,
  editingPreset,
}: CreatePresetProps) => {
  const isEditMode = Boolean(editingPreset);
  const [newPreset, setNewPreset] = useState<NewPreset>(() =>
    createInitialPreset(editingPreset),
  );
  const [error, setError] = useState<string>("");
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({});
  const [exerciseSearch, setExerciseSearch] = useState("");

  const allExercises = useExerciseStore((state) => state.exercises);
  const trainingPresets = useExerciseStore((state) => state.trainingPreset);
  const createTrainingPreset = useExerciseStore(
    (state) => state.createTrainingPreset,
  );
  const updateTrainingPreset = useExerciseStore(
    (state) => state.updateTrainingPreset,
  );

  useEffect(() => {
    setExpandedCategories((prevState) => {
      const nextState: Record<string, boolean> = {};

      allExercises.forEach((group) => {
        nextState[group.category] = prevState[group.category] ?? false;
      });

      return nextState;
    });
  }, [allExercises]);

  const handleColorPicker = (newColor: RgbaColor) => {
    setNewPreset({ ...newPreset, presetColor: newColor });
  };

  const handleClose = () => {
    onOpenChange(false);
    setNewPreset(createInitialPreset(editingPreset));
    setError("");
    setExerciseSearch("");
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
        updateTrainingPreset(editingPreset.presetName, newPreset);
      } else {
        createTrainingPreset(newPreset);
      }

      handleClose();
    }
  };

  const handleExerciseToggle = (exercise: string, checked: boolean) => {
    if (checked) {
      setNewPreset((prevState) => ({
        ...prevState,
        exercises: [...prevState.exercises, exercise],
      }));
      return;
    }

    setNewPreset((prevState) => ({
      ...prevState,
      exercises: prevState.exercises.filter((ex) => ex !== exercise),
    }));
  };

  const handleCategoryToggle = (categoryName: string) => {
    setExpandedCategories((prevState) => ({
      ...prevState,
      [categoryName]: !(prevState[categoryName] ?? false),
    }));
  };

  const handleCategoryClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const categoryName = e.currentTarget.dataset.category;
    if (!categoryName) {
      return;
    }

    handleCategoryToggle(categoryName);
  };

  const handleExerciseSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setExerciseSearch(e.target.value);
  };

  const normalizedSearchQuery = exerciseSearch.trim().toLowerCase();
  const isSearchActive = normalizedSearchQuery.length > 0;

  const filteredExerciseGroups = allExercises
    .map((group) => {
      const categoryMatches = group.category
        .toLowerCase()
        .includes(normalizedSearchQuery);
      const filteredExercises = categoryMatches
        ? group.exercises
        : group.exercises.filter((exercise) =>
            exercise.toLowerCase().includes(normalizedSearchQuery),
          );

      return {
        ...group,
        exercises: filteredExercises,
      };
    })
    .filter((group) => !isSearchActive || group.exercises.length > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Редактировать пресет тренировки" : "Добавить пресет тренировки"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Измените название, цвет и состав упражнений в пресете"
              : "Введите название и выберите упражнения для нового пресета"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 overflow-hidden">
          <label htmlFor="preset-name" className="text-sm font-medium">
            Название пресета
          </label>
          <div className={"flex justify-between gap-2 w-full items-center"}>
            <div className="space-y-2 w-[90%]">
              <Input
                id="preset-name"
                placeholder="Например: Грудь и трицепс"
                value={newPreset.presetName}
                onChange={(e) => {
                  setNewPreset({ ...newPreset, presetName: e.target.value });
                  if (error) setError("");
                }}
              />
            </div>
            <Popover>
              <PopoverTrigger asChild className={"items-center justify-center"}>
                <Button
                  style={{
                    backgroundColor: `rgba(${newPreset.presetColor.r},${newPreset.presetColor.g},${newPreset.presetColor.b},${
                      newPreset.presetColor.a === 1
                        ? 0.8
                        : newPreset.presetColor.a
                    })`,
                  }}
                  variant="outline"
                >
                  <Pipette />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full border-2 border-black rounded-md p-2">
                <RgbaColorPicker
                  color={newPreset.presetColor}
                  onChange={handleColorPicker}
                />
              </PopoverContent>
            </Popover>
          </div>
          {error && (
            <p className="text-sm text-red-500 pt-0 pl-2 mt-[-15px] mb-0">
              {error}
            </p>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Выберите упражнения</label>
            <div className="h-80 overflow-y-auto border rounded-md p-2">
              <Input
                placeholder="Поиск упражнения или категории"
                value={exerciseSearch}
                onChange={handleExerciseSearchChange}
                className="mb-2"
              />

              {filteredExerciseGroups.length === 0 && (
                <p className="px-2 py-4 text-sm text-muted-foreground">
                  Ничего не найдено
                </p>
              )}

              {filteredExerciseGroups.map((group) => (
                <div key={group.category} className="mb-4">
                  <button
                    type="button"
                    data-category={group.category}
                    className="flex w-full items-center gap-1 text-left text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    onClick={handleCategoryClick}
                  >
                    {(expandedCategories[group.category] ?? false) ||
                    isSearchActive ? (
                      <ChevronDown className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5" />
                    )}
                    <span>{group.category}</span>
                  </button>
                  {((expandedCategories[group.category] ?? false) ||
                    isSearchActive) && (
                    <div className="mt-2 space-y-1">
                      {group.exercises.map((exercise) => (
                        <label
                          key={exercise}
                          className="flex items-center space-x-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={newPreset.exercises.includes(exercise)}
                            onChange={(e) =>
                              handleExerciseToggle(exercise, e.target.checked)
                            }
                          />
                          <span className="text-sm truncate">{exercise}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}

            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Отмена
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!newPreset.presetName || newPreset.exercises.length === 0}
          >
            {isEditMode ? "Сохранить" : "Создать"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
