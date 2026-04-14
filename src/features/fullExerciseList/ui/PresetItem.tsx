import { ListChecks, Trash2 } from "lucide-react";
import { Checkbox } from "@/shared/ui/shadCNComponents/ui/checkbox";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import { CommandItem } from "@/shared/ui/shadCNComponents/ui/command";
import type { TrainingPreset } from "@/entities/exercise";

interface PresetItemProps {
  preset: TrainingPreset;
  checkable: "checkbox" | "radio" | false;
  deletable: boolean;
  selected: boolean;
  onSelect?: (value: string) => void;
  onDelete: (name: string) => void;
}

export const PresetItem = ({
  preset,
  checkable,
  deletable,
  selected,
  onSelect,
  onDelete,
}: PresetItemProps) => {
  return (
    <CommandItem
      value={preset.presetName}
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
            <Checkbox value={preset.presetName} checked={selected} />
          )}
          {deletable && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(preset.presetName);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <div className="text-sm text-muted-foreground">
        {preset.exercises.join(" • ")}
      </div>
    </CommandItem>
  );
};
