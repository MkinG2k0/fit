import { useState } from "react";
import { useSearchParams } from "react-router-dom";
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
import { CreateCategory } from "@/features/createCategory";
import { CreatePreset } from "@/features/createPreset";
import { useCalendarStore } from "@/entities/calendarDay";
import { useExerciseStore } from "@/entities/exercise";
import { FullExerciseCommand } from "@/features/fullExerciseList";
import { useExerciseSelection } from "../lib/useExerciseSelection";
import { submitExercises } from "../lib/submitExercises";
import { CreateButtons } from "./CreateButtons";

const DRAWER_QUERY_PARAM = "add-exercise";
const DRAWER_QUERY_VALUE = "1";

export const AddExercise = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [openAddPopover, setOpenAddPopover] = useState(false);
  const [openExerciseModal, setOpenExerciseModal] = useState(false);
  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const [openPresetModal, setOpenPresetModal] = useState(false);
  const isDrawerOpen =
    searchParams.get(DRAWER_QUERY_PARAM) === DRAWER_QUERY_VALUE;

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
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete(DRAWER_QUERY_PARAM);
    setSearchParams(nextSearchParams, { replace: true });
  };

  const handleDrawerOpenChange = (open: boolean) => {
    if (open) {
      if (isDrawerOpen) {
        return;
      }
      const nextSearchParams = new URLSearchParams(searchParams);
      nextSearchParams.set(DRAWER_QUERY_PARAM, DRAWER_QUERY_VALUE);
      setSearchParams(nextSearchParams);
      return;
    }
    if (!isDrawerOpen) {
      return;
    }
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete(DRAWER_QUERY_PARAM);
    setSearchParams(nextSearchParams, { replace: true });
  };

  return (
    <>
      <Drawer
        direction="right"
        open={isDrawerOpen}
        onOpenChange={handleDrawerOpenChange}
      >
        <DrawerTrigger asChild>
          <Button
            variant="outline"
            className="transition-colors text-xl justify-center w-full p-6 border-2 rounded-xl  hover:bg-gray-200 "
          >
            Добавить тренировку
          </Button>
        </DrawerTrigger>
        <DrawerContent className="grid h-dvh grid-rows-[auto_1fr_auto] overflow-hidden">
          <div className="shrink-0">
            <DrawerHeader>
              <DrawerTitle
                className={"text-2xl w-full flex justify-between items-center"}
              >
                Добавьте упражнения
                <CreateButtons
                  openAddPopover={openAddPopover}
                  onOpenAddPopoverChange={setOpenAddPopover}
                  onOpenExerciseModal={() => setOpenExerciseModal(true)}
                  onOpenCategoryModal={() => setOpenCategoryModal(true)}
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

          <DrawerFooter className="w-full shrink-0">
            <Button
              disabled={
                selectedExerciseCheckboxes.length === 0 &&
                selectedPresetCheckboxes.length === 0
              }
              onClick={handleSubmit}
            >
              Добавить
            </Button>
            <Button
              variant="outline"
              onClick={() => handleDrawerOpenChange(false)}
            >
              Отмена
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <CreateExercise
        open={openExerciseModal}
        onOpenChange={setOpenExerciseModal}
      />
      <CreateCategory
        open={openCategoryModal}
        onOpenChange={setOpenCategoryModal}
      />
      <CreatePreset open={openPresetModal} onOpenChange={setOpenPresetModal} />
    </>
  );
};
