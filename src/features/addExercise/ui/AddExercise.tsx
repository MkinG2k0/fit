import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import { CreateCategory } from "@/features/createCategory";
import { useCalendarStore } from "@/entities/calendarDay";
import { useExerciseStore } from "@/entities/exercise";
import { FullExerciseCommand } from "@/features/fullExerciseList";
import { useExerciseSelection } from "../lib/useExerciseSelection";
import { submitExercises } from "../lib/submitExercises";
import { CreateButtons } from "./CreateButtons";
import { mapCurrentWorkoutToPresetExercises } from "@/features/createPreset/lib/mapCurrentWorkoutToPresetExercises";

const DRAWER_QUERY_PARAM = "add-exercise";
const DRAWER_QUERY_VALUE = "1";

export const AddExercise = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [openAddPopover, setOpenAddPopover] = useState(false);
  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const isDrawerOpen =
    searchParams.get(DRAWER_QUERY_PARAM) === DRAWER_QUERY_VALUE;

  const addExercise = useCalendarStore((state) => state.addExercise);
  const days = useCalendarStore((state) => state.days);
  const selectedDate = useCalendarStore((state) => state.selectedDate);
  const allExercises = useExerciseStore((state) => state.exercises);
  const trainingPreset = useExerciseStore((state) => state.trainingPreset);
  const currentWorkoutExercises =
    days[selectedDate.format("DD-MM-YYYY")]?.exercises ?? [];
  const currentWorkoutPresetExercises = mapCurrentWorkoutToPresetExercises(
    currentWorkoutExercises,
    allExercises,
  );

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

  const handleOpenPresetModal = () => {
    handleDrawerOpenChange(false);
    navigate("/presets/create");
  };

  const handleOpenPresetFromCurrentWorkoutModal = () => {
    handleDrawerOpenChange(false);
    navigate("/presets/create", {
      state: { initialExercises: currentWorkoutPresetExercises },
    });
  };

  const handleOpenBulkCreatePage = () => {
    handleDrawerOpenChange(false);
    navigate("/exercises/bulk-create");
  };

  const handleOpenCreateExercisePage = () => {
    handleDrawerOpenChange(false);
    navigate("/exercises/create");
  };

  return (
    <>
      <Drawer
        direction="right"
        open={isDrawerOpen}
        onOpenChange={handleDrawerOpenChange}
      >
        <DrawerTrigger asChild>
          <Button className="text-xl font-bold justify-center w-full p-6">
            Добавить упражнение
          </Button>
        </DrawerTrigger>
        <DrawerContent className="grid h-dvh grid-rows-[auto_1fr_auto] overflow-hidden">
          <div className="shrink-0">
            <DrawerHeader className="p-0 mb-2">
              <DrawerTitle
                className={"text-2xl w-full flex justify-between items-center"}
              >
                Добавьте упражнения
                <CreateButtons
                  openAddPopover={openAddPopover}
                  onOpenAddPopoverChange={setOpenAddPopover}
                  onOpenExerciseModal={handleOpenCreateExercisePage}
                  onOpenCategoryModal={() => setOpenCategoryModal(true)}
                  onOpenPresetModal={handleOpenPresetModal}
                  onOpenBulkCreatePage={handleOpenBulkCreatePage}
                  onOpenPresetFromCurrentWorkoutModal={
                    handleOpenPresetFromCurrentWorkoutModal
                  }
                  isCreateFromCurrentWorkoutDisabled={
                    currentWorkoutPresetExercises.length === 0
                  }
                />
              </DrawerTitle>
              <DrawerDescription></DrawerDescription>
            </DrawerHeader>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden ">
            <FullExerciseCommand
              selectedExerciseCheckboxes={selectedExerciseCheckboxes}
              selectedPresetCheckboxes={selectedPresetCheckboxes}
              presetSelectHandler={presetSelectHandler}
              exerciseSelectHandler={exerciseSelectHandler}
              checkable={"checkbox"}
            />
          </div>

          <DrawerFooter className="w-full shrink-0 p-0 mt-2">
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

      <CreateCategory
        open={openCategoryModal}
        onOpenChange={setOpenCategoryModal}
      />
    </>
  );
};
