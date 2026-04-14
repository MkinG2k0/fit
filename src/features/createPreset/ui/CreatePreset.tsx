import { Pipette } from "lucide-react";
import { useState } from "react";
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
import { useExerciseStore } from "@/entities/exercise";
import { type RgbaColor, RgbaColorPicker } from "react-colorful";
import type { NewPreset } from "../model/types";

interface CreatePresetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreatePreset = ({ open, onOpenChange }: CreatePresetProps) => {
  const [newPreset, setNewPreset] = useState<NewPreset>({
    presetName: "",
    exercises: [],
    presetColor: { r: 0, g: 0, b: 0, a: 1 },
  });
  const [error, setError] = useState<string>("");

  const allExercises = useExerciseStore((state) => state.exercises);
  const trainingPresets = useExerciseStore((state) => state.trainingPreset);
  const createTrainingPreset = useExerciseStore(
    (state) => state.createTrainingPreset,
  );

  const handleColorPicker = (newColor: RgbaColor) => {
    setNewPreset({ ...newPreset, presetColor: newColor });
  };

  const handleClose = () => {
    onOpenChange(false);
    setNewPreset({
      presetName: "",
      exercises: [],
      presetColor: { r: 0, g: 0, b: 0, a: 1 },
    });
    setError("");
  };

  const handleCreate = () => {
    if (newPreset.presetName && newPreset.exercises.length > 0) {
      // Check if preset with this name already exists
      const existingPreset = trainingPresets.find(
        (preset) =>
          preset.presetName.toLowerCase() ===
          newPreset.presetName.toLowerCase(),
      );

      if (existingPreset) {
        setError("Пресет с таким названием уже существует");
        return;
      }

      createTrainingPreset(newPreset);
      handleClose();
    }
  };

  const handleExerciseToggle = (exercise: string, checked: boolean) => {
    if (checked) {
      setNewPreset({
        ...newPreset,
        exercises: [...newPreset.exercises, exercise],
      });
    } else {
      setNewPreset({
        ...newPreset,
        exercises: newPreset.exercises.filter((ex) => ex !== exercise),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить пресет тренировки</DialogTitle>
          <DialogDescription>
            Введите название и выберите упражнения для нового пресета
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
                <RgbaColorPicker onChange={handleColorPicker} />
              </PopoverContent>
            </Popover>
          </div>
          {error && (
            <p className="text-sm text-red-500 pt-0 pl-2 mt-[-15px] mb-0">
              {error}
            </p>
          )}

          <div className="space-y-2 max-[330px]:h-30">
            <label className="text-sm font-medium">Выберите упражнения</label>
            <div className="max-h-64 overflow-y-auto border rounded-md p-2">
              {allExercises.map((group) => (
                <div key={group.category} className="mb-4">
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">
                    {group.category}
                  </h4>
                  <div className="space-y-1">
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
            Создать
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
