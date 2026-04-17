import type { MouseEvent } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { ExerciseIconId } from "@/entities/exercise";
import { cn } from "@/shared/lib";
import { ExerciseIconGraphic } from "@/shared/ui";
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
  /** Показывать корзину в строке списка (удаление из экрана редактирования — отдельно). */
  allowListDelete?: boolean;
  selected: boolean;
  onSelect?: (value: string) => void;
  onDelete: (name: string, category: string) => void;
  onEdit?: (payload: {
    name: string;
    category: string;
    iconId: ExerciseIconId;
  }) => void;
  category: string;
}

export const ExerciseItem = ({
  name,
  iconId,
  checkable,
  deletable,
  allowListDelete = true,
  selected,
  onSelect,
  onDelete,
  onEdit,
  category,
}: ExerciseItemProps) => {
  const handleDeleteClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onDelete(name, category);
  };

  const handleEditClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onEdit?.({ name, category, iconId });
  };

  return (
    <CommandItem
      value={name}
      className="text-base flex justify-between w-full"
      onSelect={onSelect}
    >
      <div className={"flex gap-2 items-center overflow-hidden"}>
        <ExerciseIconGraphic
          iconId={iconId}
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
            {allowListDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={handleDeleteClick}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </>
        )}
      </div>
    </CommandItem>
  );
};
