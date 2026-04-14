import { useState } from "react";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/shared/ui/shadCNComponents/ui/drawer";
import { CreateExercise } from "@/features/createExercise";
import { CreatePreset } from "@/features/createPreset";
import { useCalendarStore } from "@/entities/calendarDay";
import { useExerciseStore } from "@/entities/exercise";
import { FullExerciseCommand } from "@/features/fullExerciseList";
import { useExerciseSelection } from "../lib/useExerciseSelection";
import { submitExercises } from "../lib/submitExercises";
import { CreateButtons } from "./CreateButtons";

export const AddExercise = () => {
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [openAddPopover, setOpenAddPopover] = useState(false);
  const [openExerciseModal, setOpenExerciseModal] = useState(false);
  const [openPresetModal, setOpenPresetModal] = useState(false);

  const addExercise = useCalendarStore((state) => state.addExercise);
  const allExercises = useExerciseStore((state) => state.exercises);
  const trainingPreset = useExerciseStore((state) => state.trainingPreset);

  const {
    selectedPresetCheckboxes,
    selectedExerciseCheckboxes,
    presetSelectHandler,
    exerciseSelectHandler,
    reset,
  } = useExerciseSelection();

  const handleSubmit = () => {
    submitExercises(
      selectedExerciseCheckboxes,
      selectedPresetCheckboxes,
      allExercises,
      trainingPreset,
      addExercise,
    );
    reset();
    setDrawerOpen(false);
  };

  return (
    <>
      <Drawer
        direction="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <DrawerTrigger asChild>
          <Button
            variant="outline"
            className="text-xl justify-center w-full p-6 border-1 border-black rounded-xl bg-white hover:bg-gray-50 text-black"
            onClick={() => setDrawerOpen(true)}
          >
            Добавить тренировку
          </Button>
        </DrawerTrigger>
        <DrawerContent className="grid grid-rows-[auto_1fr_auto] h-[100dvh] overflow-hidden">
          <div className="flex-shrink-0">
            <DrawerHeader>
              <DrawerTitle
                className={"text-2xl w-full flex justify-between items-center"}
              >
                Добавьте упражнения
                <CreateButtons
                  openAddPopover={openAddPopover}
                  onOpenAddPopoverChange={setOpenAddPopover}
                  onOpenExerciseModal={() => setOpenExerciseModal(true)}
                  onOpenPresetModal={() => setOpenPresetModal(true)}
                />
              </DrawerTitle>
              <DrawerDescription></DrawerDescription>
            </DrawerHeader>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <FullExerciseCommand
              selectedExerciseCheckboxes={selectedExerciseCheckboxes}
              selectedPresetCheckboxes={selectedPresetCheckboxes}
              presetSelectHandler={presetSelectHandler}
              exerciseSelectHandler={exerciseSelectHandler}
              checkable={"checkbox"}
            />
          </div>

          <DrawerFooter className="w-full flex-shrink-0">
            <Button
              disabled={
                selectedExerciseCheckboxes.length === 0 &&
                selectedPresetCheckboxes.length === 0
              }
              onClick={handleSubmit}
            >
              Добавить
            </Button>
            <Button variant="outline" onClick={() => setDrawerOpen(false)}>
              Отмена
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <CreateExercise
        open={openExerciseModal}
        onOpenChange={setOpenExerciseModal}
      />
      <CreatePreset open={openPresetModal} onOpenChange={setOpenPresetModal} />
    </>
  );
};
