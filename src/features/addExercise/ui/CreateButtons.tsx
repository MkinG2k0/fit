import { Dumbbell, Zap } from "lucide-react";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/shadCNComponents/ui/popover";

interface CreateButtonsProps {
  openAddPopover: boolean;
  onOpenAddPopoverChange: (open: boolean) => void;
  onOpenExerciseModal: () => void;
  onOpenPresetModal: () => void;
}

export const CreateButtons = ({
  openAddPopover,
  onOpenAddPopoverChange,
  onOpenExerciseModal,
  onOpenPresetModal,
}: CreateButtonsProps) => {
  return (
    <Popover open={openAddPopover} onOpenChange={onOpenAddPopoverChange}>
      <PopoverTrigger asChild>
        <Button className={"w-10 text-2xl"}>+</Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p2" align="center">
        <div className="flex flex-col gap-2">
          <Button
            variant="ghost"
            className="justify-start text-lg py-3"
            onClick={() => {
              onOpenAddPopoverChange(false);
              onOpenExerciseModal();
            }}
          >
            <Dumbbell className="mr-2 h-5 w-5" />
            Упражнение
          </Button>
          <Button
            variant="ghost"
            className="justify-start text-lg py-3"
            onClick={() => {
              onOpenAddPopoverChange(false);
              onOpenPresetModal();
            }}
          >
            <Zap className="mr-2 h-5 w-5" />
            Тренировку
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
