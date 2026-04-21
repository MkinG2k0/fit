import { useState } from "react";
import { Dumbbell, FolderPlus, Zap } from "lucide-react";
import { FixedBottomBar } from "@shared/ui";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/shadCNComponents/ui/popover";
import type { TrainingPreset } from "@/entities/exercise";
import {
  CreateExercise,
  type CatalogExerciseEditSource,
} from "@/features/createExercise";
import { CreateCategory } from "@/features/createCategory";
import { CreatePreset } from "@/features/createPreset";
import { FullExerciseCommand } from "@/features/fullExerciseList/ui/fullExerciseCommand";

export const AllExercises = () => {
  const [openAddPopover, setOpenAddPopover] = useState(false);
  const [openExerciseModal, setOpenExerciseModal] = useState(false);
  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const [openPresetModal, setOpenPresetModal] = useState(false);
  const [editingPreset, setEditingPreset] = useState<
    TrainingPreset | undefined
  >(undefined);
  const [editingExercise, setEditingExercise] = useState<
    CatalogExerciseEditSource | undefined
  >(undefined);
  const [preselectedCategory, setPreselectedCategory] = useState<
    string | undefined
  >(undefined);

  const handleOpenExerciseModal = () => {
    setOpenAddPopover(false);
    setPreselectedCategory(undefined);
    setEditingExercise(undefined);
    setOpenExerciseModal(true);
  };

  const handleOpenExerciseEditModal = (payload: CatalogExerciseEditSource) => {
    setEditingExercise(payload);
    setOpenExerciseModal(true);
  };

  const handleOpenExerciseModalByCategory = (categoryName: string) => {
    setEditingExercise(undefined);
    setPreselectedCategory(categoryName);
    setOpenExerciseModal(true);
  };

  const handleOpenCategoryModal = () => {
    setOpenAddPopover(false);
    setOpenCategoryModal(true);
  };

  const handleOpenPresetModal = () => {
    setOpenAddPopover(false);
    setEditingPreset(undefined);
    setOpenPresetModal(true);
  };

  const handleOpenPresetEditModal = (preset: TrainingPreset) => {
    setOpenAddPopover(false);
    setEditingPreset(preset);
    setOpenPresetModal(true);
  };

  const handlePresetModalOpenChange = (open: boolean) => {
    setOpenPresetModal(open);
    if (!open) {
      setEditingPreset(undefined);
    }
  };

  const handleExerciseModalOpenChange = (open: boolean) => {
    setOpenExerciseModal(open);
    if (!open) {
      setEditingExercise(undefined);
      setPreselectedCategory(undefined);
    }
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

      {/* Модальное окно добавления упражнения */}
      <CreateExercise
        key={
          editingExercise
            ? `${editingExercise.category}-${editingExercise.name}`
            : "create-exercise"
        }
        open={openExerciseModal}
        onOpenChange={handleExerciseModalOpenChange}
        defaultCategory={preselectedCategory}
        editingExercise={editingExercise}
      />

      <CreateCategory
        open={openCategoryModal}
        onOpenChange={setOpenCategoryModal}
      />

      {/* Модальное окно добавления пресета */}
      <CreatePreset
        key={editingPreset?.presetName ?? "create-preset"}
        open={openPresetModal}
        onOpenChange={handlePresetModalOpenChange}
        editingPreset={editingPreset}
      />
    </div>
  );
};
