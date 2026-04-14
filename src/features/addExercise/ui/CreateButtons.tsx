import { Dumbbell, FolderPlus, Zap } from "lucide-react";
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
}

export const CreateButtons = ({
  openAddPopover,
  onOpenAddPopoverChange,
  onOpenExerciseModal,
  onOpenCategoryModal,
  onOpenPresetModal,
}: CreateButtonsProps) => {
  const createButtonClasses = "justify-start py-3 text-lg";

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

  return (
    <Popover open={openAddPopover} onOpenChange={onOpenAddPopoverChange}>
      <PopoverTrigger asChild>
        <Button>Создать</Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-2" align="center">
        <div className="flex flex-col gap-2">
          <Button
            variant="ghost"
            className={createButtonClasses}
            onClick={handleOpenExerciseModal}
          >
            <Dumbbell className="mr-2 h-5 w-5" />
            Упражнение
          </Button>
          <Button
            variant="ghost"
            className={createButtonClasses}
            onClick={handleOpenCategoryModal}
          >
            <FolderPlus className="mr-2 h-5 w-5" />
            Категорию
          </Button>
          <Button
            variant="ghost"
            className={createButtonClasses}
            onClick={handleOpenPresetModal}
          >
            <Zap className="mr-2 h-5 w-5" />
            Тренировку
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
