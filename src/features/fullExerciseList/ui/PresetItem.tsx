import { ListChecks, Pencil, Trash2 } from "lucide-react";
import { Checkbox } from "@/shared/ui/shadCNComponents/ui/checkbox";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import { CommandItem } from "@/shared/ui/shadCNComponents/ui/command";
import { type TrainingPreset, useExerciseStore } from "@/entities/exercise";

interface PresetItemProps {
  preset: TrainingPreset;
  checkable: "checkbox" | "radio" | false;
  deletable: boolean;
  selected: boolean;
  onSelect?: (value: string) => void;
  onDelete: (id: string, name: string) => void;
  onEdit?: (preset: TrainingPreset) => void;
}

export const PresetItem = ({
  preset,
  checkable,
  deletable,
  selected,
  onSelect,
  onDelete,
  onEdit,
}: PresetItemProps) => {
  const exerciseCatalog = useExerciseStore((state) => state.exercises);
  const exercisePreview = preset.exercises
    .map((exerciseRef) => {
      for (const group of exerciseCatalog) {
        const entry = group.exercises.find((exercise) => exercise.id === exerciseRef);
        if (entry) {
          return entry.name;
        }
      }
      return "Неизвестное упражнение";
    })
    .join(" • ");

  const handleDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onDelete(preset.id!, preset.presetName);
  };

  const handleEditClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onEdit?.(preset);
  };

  return (
    <CommandItem
      value={preset.id!}
      keywords={[preset.presetName, exercisePreview]}
      className="flex flex-col items-start py-3"
      onSelect={onSelect}
    >
      <div className="flex justify-between w-full">
        <div className="flex items-center gap-2">
          <ListChecks className="text-muted-foreground" />
          <span className="text-base font-medium">{preset.presetName}</span>
        </div>
        <div className="flex items-center gap-2">
          {checkable && (
            <Checkbox value={preset.id!} checked={selected} />
          )}
          {deletable && (
            <>
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={handleEditClick}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={handleDeleteClick}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
      <div className="text-sm text-muted-foreground">
        {exercisePreview}
      </div>
    </CommandItem>
  );
};
