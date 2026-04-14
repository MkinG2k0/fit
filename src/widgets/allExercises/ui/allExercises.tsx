import { useState } from "react";
import { Dumbbell, FolderPlus, Zap } from "lucide-react";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/shadCNComponents/ui/popover";
import { CreateExercise } from "@/features/createExercise";
import { CreateCategory } from "@/features/createCategory";
import { CreatePreset } from "@/features/createPreset";
import { FullExerciseCommand } from "@/features/fullExerciseList/ui/fullExerciseCommand";

export const AllExercises = () => {
  const [openAddPopover, setOpenAddPopover] = useState(false);
  const [openExerciseModal, setOpenExerciseModal] = useState(false);
  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const [openPresetModal, setOpenPresetModal] = useState(false);
  const [preselectedCategory, setPreselectedCategory] = useState<
    string | undefined
  >(undefined);
  const addActionButtonClassName = "justify-start text-lg py-3";
  const createButtonClassName =
    "fixed bottom-0 left-1/2 right-0 mb-8 -translate-x-1/2 justify-center border-1 border-black bg-white p-6 text-xl text-black";

  const handleOpenExerciseModal = () => {
    setOpenAddPopover(false);
    setPreselectedCategory(undefined);
    setOpenExerciseModal(true);
  };

  const handleOpenExerciseModalByCategory = (categoryName: string) => {
    setPreselectedCategory(categoryName);
    setOpenExerciseModal(true);
  };

  const handleOpenCategoryModal = () => {
    setOpenAddPopover(false);
    setOpenCategoryModal(true);
  };

  const handleOpenPresetModal = () => {
    setOpenAddPopover(false);
    setOpenPresetModal(true);
  };

  return (
    <div className="h-full min-h-0">
      <div className="flex h-full min-h-0 flex-col">
        <div className="min-h-0 flex-1 pb-28">
          <FullExerciseCommand
            checkable={false}
            deletable={true}
            onCreateExerciseInCategory={handleOpenExerciseModalByCategory}
          />
        </div>
        {/* Кнопка добавления */}
        <div className={"flex justify-center items-center"}>
          <Popover open={openAddPopover} onOpenChange={setOpenAddPopover}>
            <PopoverTrigger asChild>
              <Button variant="outline" className={createButtonClassName}>
                Создать
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2" align="center">
              <div className="flex flex-col gap-2">
                <Button
                  variant="ghost"
                  className={addActionButtonClassName}
                  onClick={handleOpenExerciseModal}
                >
                  <Dumbbell className="mr-2 h-5 w-5" />
                  Упражнение
                </Button>
                <Button
                  variant="ghost"
                  className={addActionButtonClassName}
                  onClick={handleOpenCategoryModal}
                >
                  <FolderPlus className="mr-2 h-5 w-5" />
                  Категорию
                </Button>
                <Button
                  variant="ghost"
                  className={addActionButtonClassName}
                  onClick={handleOpenPresetModal}
                >
                  <Zap className="mr-2 h-5 w-5" />
                  Тренировку
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Модальное окно добавления упражнения */}
      <CreateExercise
        open={openExerciseModal}
        onOpenChange={setOpenExerciseModal}
        defaultCategory={preselectedCategory}
      />

      <CreateCategory
        open={openCategoryModal}
        onOpenChange={setOpenCategoryModal}
      />

      {/* Модальное окно добавления пресета */}
      <CreatePreset open={openPresetModal} onOpenChange={setOpenPresetModal} />
    </div>
  );
};
