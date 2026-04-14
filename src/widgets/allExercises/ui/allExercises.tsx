import { useState } from "react";
import { Dumbbell, Zap } from "lucide-react";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/shadCNComponents/ui/popover";
import { CreateExercise } from "@/features/createExercise";
import { CreatePreset } from "@/features/createPreset";
import { FullExerciseCommand } from "@/features/fullExerciseList/ui/fullExerciseCommand";

export const AllExercises = () => {
  // States for add functionality
  const [openAddPopover, setOpenAddPopover] = useState(false);
  const [openExerciseModal, setOpenExerciseModal] = useState(false);
  const [openPresetModal, setOpenPresetModal] = useState(false);

  return (
    <div className="h-[calc(100dvh-64px)] max-[330px]:h-[calc(100dvh-54px)]">
      <div className="h-full grid grid-rows-[85%_15%]]">
        <div className={"overflow-scroll"}>
          <FullExerciseCommand checkable={false} deletable={true} />
        </div>
        {/* Кнопка добавления */}
        <div className={"flex justify-center items-center"}>
          <Popover open={openAddPopover} onOpenChange={setOpenAddPopover}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="text-xl justify-center w-1/2 mb-8 p-6 border-1 border-black rounded-xl bg-white text-black"
              >
                Создать
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2" align="center">
              <div className="flex flex-col gap-2">
                <Button
                  variant="ghost"
                  className="justify-start text-lg py-3"
                  onClick={() => {
                    setOpenAddPopover(false);
                    setOpenExerciseModal(true);
                  }}
                >
                  <Dumbbell className="mr-2 h-5 w-5" />
                  Упражнение
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start text-lg py-3"
                  onClick={() => {
                    setOpenAddPopover(false);
                    setOpenPresetModal(true);
                  }}
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
      />

      {/* Модальное окно добавления пресета */}
      <CreatePreset open={openPresetModal} onOpenChange={setOpenPresetModal} />
    </div>
  );
};
