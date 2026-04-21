import { Dumbbell, FolderPlus, Sparkles, Zap } from "lucide-react";
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
  onOpenCategoryModal: () => void;
  onOpenPresetModal: () => void;
  onOpenPresetFromCurrentWorkoutModal: () => void;
  isCreateFromCurrentWorkoutDisabled: boolean;
}

export const CreateButtons = ({
  openAddPopover,
  onOpenAddPopoverChange,
  onOpenExerciseModal,
  onOpenCategoryModal,
  onOpenPresetModal,
  onOpenPresetFromCurrentWorkoutModal,
  isCreateFromCurrentWorkoutDisabled,
}: CreateButtonsProps) => {
  const handleOpenExerciseModal = () => {
    onOpenAddPopoverChange(false);
    onOpenExerciseModal();
  };

  const handleOpenCategoryModal = () => {
    onOpenAddPopoverChange(false);
    onOpenCategoryModal();
  };

  const handleOpenPresetModal = () => {
    onOpenAddPopoverChange(false);
    onOpenPresetModal();
  };

  const handleOpenPresetFromCurrentWorkoutModal = () => {
    onOpenAddPopoverChange(false);
    onOpenPresetFromCurrentWorkoutModal();
  };

  return (
    <Popover open={openAddPopover} onOpenChange={onOpenAddPopoverChange}>
      <PopoverTrigger asChild>
        <Button>Создать</Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-2" align="center">
        <div className="flex flex-col gap-2">
          <Button
            variant="ghost"
            className="justify-start py-3 text-lg"
            onClick={handleOpenExerciseModal}
          >
            <Dumbbell className="mr-2 h-5 w-5" />
            Упражнение
          </Button>
          <Button
            variant="ghost"
            className="justify-start py-3 text-lg"
            onClick={handleOpenCategoryModal}
          >
            <FolderPlus className="mr-2 h-5 w-5" />
            Категорию
          </Button>
          <Button
            variant="ghost"
            className="justify-start py-3 text-lg"
            onClick={handleOpenPresetModal}
          >
            <Zap className="mr-2 h-5 w-5" />
            Тренировку
          </Button>
          <Button
            variant="ghost"
            className="justify-start py-3 text-lg"
            onClick={handleOpenPresetFromCurrentWorkoutModal}
            disabled={isCreateFromCurrentWorkoutDisabled}
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Создать из текущей тренировки
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
