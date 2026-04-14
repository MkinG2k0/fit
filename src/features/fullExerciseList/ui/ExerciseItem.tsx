import { Dumbbell, Trash2 } from "lucide-react";
import { Checkbox } from "@/shared/ui/shadCNComponents/ui/checkbox";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import { CommandItem } from "@/shared/ui/shadCNComponents/ui/command";
import { RadioGroupItem } from "../../../shared/ui/shadCNComponents/ui/radio-group.tsx";

interface ExerciseItemProps {
  name: string;
  checkable: "checkbox" | "radio" | false;
  deletable: boolean;
  selected: boolean;
  onSelect?: (value: string) => void;
  onDelete: (name: string, category: string) => void;
  category: string;
}

export const ExerciseItem = ({
  name,
  checkable,
  deletable,
  selected,
  onSelect,
  onDelete,
  category,
}: ExerciseItemProps) => {
  return (
    <CommandItem
      value={name}
      className="text-base flex justify-between w-full"
      onSelect={onSelect}
    >
      <div className={"flex gap-2 items-center overflow-hidden"}>
        <Dumbbell className="text-muted-foreground" />
        <span className="text-base overflow-hidden truncate font-medium">
          {name}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {checkable === "radio" && (
          <RadioGroupItem checked={selected} value={name} id={name} />
        )}
        {checkable === "checkbox" && (
          <Checkbox value={name} checked={selected} />
        )}
        {deletable && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(name, category);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </CommandItem>
  );
};
