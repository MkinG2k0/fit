import { useState } from "react";
import { Dumbbell, FolderPlus, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FixedBottomBar } from "@shared/ui";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/shadCNComponents/ui/popover";
import type { TrainingPreset } from "@/entities/exercise";
import { type CatalogExerciseEditSource } from "@/features/createExercise";
import { CreateCategory } from "@/features/createCategory";
import { FullExerciseCommand } from "@/features/fullExerciseList/ui/fullExerciseCommand";

export const AllExercises = () => {
  const navigate = useNavigate();
  const [openAddPopover, setOpenAddPopover] = useState(false);
  const [openCategoryModal, setOpenCategoryModal] = useState(false);

  const handleOpenExerciseModal = () => {
    setOpenAddPopover(false);
    navigate("/exercises/create");
  };

  const handleOpenExerciseEditModal = (payload: CatalogExerciseEditSource) => {
    navigate(
      `/exercises/edit?category=${encodeURIComponent(payload.category)}&name=${encodeURIComponent(payload.name)}`,
    );
  };

  const handleOpenExerciseModalByCategory = (categoryName: string) => {
    navigate(`/exercises/create?category=${encodeURIComponent(categoryName)}`);
  };

  const handleOpenCategoryModal = () => {
    setOpenAddPopover(false);
    setOpenCategoryModal(true);
  };

  const handleOpenPresetModal = () => {
    setOpenAddPopover(false);
    navigate("/presets/create");
  };

  const handleOpenPresetEditModal = (preset: TrainingPreset) => {
    setOpenAddPopover(false);
    navigate(`/presets/edit?name=${encodeURIComponent(preset.presetName)}`);
  };

  return (
    <div className="h-full min-h-0">
      <div className="flex h-full min-h-0 flex-col">
        <div className="min-h-0 flex-1 ">
          <FullExerciseCommand
            checkable={false}
            deletable={true}
            onCreateExerciseInCategory={handleOpenExerciseModalByCategory}
            onEditExercise={handleOpenExerciseEditModal}
            onEditPreset={handleOpenPresetEditModal}
          />
        </div>
        <FixedBottomBar className="text-xl max-w-[800px] mx-auto">
          <Popover open={openAddPopover} onOpenChange={setOpenAddPopover}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full p-6">
                Создать
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2" align="center">
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
              </div>
            </PopoverContent>
          </Popover>
        </FixedBottomBar>
      </div>
      <CreateCategory
        open={openCategoryModal}
        onOpenChange={setOpenCategoryModal}
      />
    </div>
  );
};
