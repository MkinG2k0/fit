import { useState } from "react";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandList,
  CommandSeparator,
} from "@/shared/ui/shadCNComponents/ui/command";
import { useExerciseStore } from "@/entities/exercise";
import { DeleteDialog } from "./DeleteDialog";
import { ExerciseItem } from "./ExerciseItem";
import { PresetItem } from "./PresetItem";
import { RadioGroup } from "@/shared/ui/shadCNComponents/ui/radio-group";

interface BaseProps {
  checkable?: "checkbox" | "radio" | false;
  deletable?: boolean;
  variant?: "exercises" | "presets" | "all";
}

interface RadioProps extends BaseProps {
  checkable?: "radio";
  exerciseSelectHandler: (value: string) => void;
  presetSelectHandler?: never;
  selectedExerciseCheckboxes: string;
  selectedPresetCheckboxes?: never;
}

interface CheckableProps extends BaseProps {
  checkable?: "checkbox";
  exerciseSelectHandler: (value: string) => void;
  presetSelectHandler: (value: string) => void;
  selectedExerciseCheckboxes: string[];
  selectedPresetCheckboxes: string[];
}

interface NonCheckableProps extends BaseProps {
  checkable?: false;
  exerciseSelectHandler?: never;
  presetSelectHandler?: never;
  selectedExerciseCheckboxes?: never;
  selectedPresetCheckboxes?: never;
}

export type FullExerciseCommandProps =
  | CheckableProps
  | NonCheckableProps
  | RadioProps;

export const FullExerciseCommand = ({
  selectedExerciseCheckboxes = [],
  selectedPresetCheckboxes = [],
  presetSelectHandler,
  exerciseSelectHandler,
  checkable = false,
  deletable = false,
  variant = "all",
}: FullExerciseCommandProps) => {
  const allExercises = useExerciseStore((state) => state.exercises);
  const trainingPreset = useExerciseStore((state) => state.trainingPreset);
  const deleteExercise = useExerciseStore((state) => state.deleteExercise);
  const deleteTrainingPreset = useExerciseStore(
    (state) => state.deleteTrainingPreset,
  );

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: "exercise" | "preset";
    name: string;
    category?: string;
  }>({
    open: false,
    type: "exercise",
    name: "",
  });

  const handleDeleteConfirm = () => {
    if (deleteDialog.type === "exercise" && deleteDialog.category) {
      deleteExercise(deleteDialog.name, deleteDialog.category);
    } else if (deleteDialog.type === "preset") {
      deleteTrainingPreset(deleteDialog.name);
    }
    setDeleteDialog({ open: false, type: "exercise", name: "" });
  };

  const openDeleteDialog = (
    type: "exercise" | "preset",
    name: string,
    category?: string,
  ) => {
    setDeleteDialog({ open: true, type, name, category });
  };

  return (
    <>
      <Command className="w-full h-full">
        <CommandInput placeholder="Поиск..." />
        <CommandList className={"flex-1 overflow-y-scroll"}>
          <RadioGroup>
            {(variant === "exercises" || variant === "all") &&
              allExercises.map((group) => (
                <CommandGroup heading={group.category} key={group.category}>
                  <CommandSeparator />
                  {group.exercises.map((name) => (
                    <ExerciseItem
                      key={name}
                      name={name}
                      category={group.category}
                      checkable={checkable}
                      deletable={deletable}
                      selected={selectedExerciseCheckboxes.includes(name)}
                      onSelect={exerciseSelectHandler}
                      onDelete={(name, category) =>
                        openDeleteDialog("exercise", name, category)
                      }
                    />
                  ))}
                </CommandGroup>
              ))}
          </RadioGroup>
          {(variant === "presets" || variant === "all") && (
            <CommandGroup heading={"Пресеты"}>
              {trainingPreset.map((preset) => (
                <PresetItem
                  key={preset.presetName}
                  preset={preset}
                  checkable={checkable}
                  deletable={deletable}
                  selected={selectedPresetCheckboxes.includes(
                    preset.presetName,
                  )}
                  onSelect={presetSelectHandler}
                  onDelete={(name) => openDeleteDialog("preset", name)}
                />
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>

      <DeleteDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        type={deleteDialog.type}
        name={deleteDialog.name}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
};
