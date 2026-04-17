import { Trash2 } from "lucide-react";
import { EXERCISE_ICON_PATHS, type ExerciseIconId } from "@/entities/exercise";
import { cn, publicAssetUrl } from "@/shared/lib";
import { Checkbox } from "@/shared/ui/shadCNComponents/ui/checkbox";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import { CommandItem } from "@/shared/ui/shadCNComponents/ui/command";
import { RadioGroupItem } from "../../../shared/ui/shadCNComponents/ui/radio-group.tsx";

const exerciseItemIconClassName = "size-4 shrink-0 object-contain opacity-80";

interface ExerciseItemProps {
  name: string;
  iconId: ExerciseIconId;
  checkable: "checkbox" | "radio" | false;
  deletable: boolean;
  selected: boolean;
  onSelect?: (value: string) => void;
  onDelete: (name: string, category: string) => void;
  category: string;
}

export const ExerciseItem = ({
  name,
  iconId,
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
        <img
          alt=""
          draggable={false}
          src={publicAssetUrl(EXERCISE_ICON_PATHS[iconId])}
          className={cn(exerciseItemIconClassName)}
        />
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
