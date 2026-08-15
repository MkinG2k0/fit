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
import { CreateCategory } from "@/features/createCategory";
import { useCalendarStore } from "@/entities/calendarDay";
import { useExerciseStore } from "@/entities/exercise";
import { FullExerciseCommand } from "@/features/fullExerciseList";
import {
  ADD_EXERCISE_PARAM,
  useOverlaySearchParam,
} from "@/shared/lib/navigation";
import { useExerciseSelection } from "../lib/useExerciseSelection";
import { submitExercises } from "../lib/submitExercises";
import { CreateButtons } from "./CreateButtons";
import { mapCurrentWorkoutToPresetExercises } from "@/features/createPreset/lib/mapCurrentWorkoutToPresetExercises";
import { useDrawerViewportStyle } from "../lib/useDrawerViewportStyle";

export const AddExercise = () => {
  const {
    isOpen: isDrawerOpen,
    close: closeDrawer,
    closeAndNavigate,
    onOpenChange: handleDrawerOpenChange,
  } = useOverlaySearchParam(ADD_EXERCISE_PARAM, "1");
  const [openAddPopover, setOpenAddPopover] = useState(false);
  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const drawerViewportStyle = useDrawerViewportStyle(isDrawerOpen);

  const addExercise = useCalendarStore((state) => state.addExercise);
  const days = useCalendarStore((state) => state.days);
  const selectedDate = useCalendarStore((state) => state.selectedDate);
  const allExercises = useExerciseStore((state) => state.exercises);
  const trainingPreset = useExerciseStore((state) => state.trainingPreset);
  const currentWorkoutExercises =
    days[selectedDate.format("DD-MM-YYYY")]?.exercises ?? [];
  const currentWorkoutPresetExercises = mapCurrentWorkoutToPresetExercises(
    currentWorkoutExercises,
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
    closeDrawer();
  };

  const handleOpenPresetModal = () => {
    closeAndNavigate("/presets/create");
  };

  const handleOpenPresetFromCurrentWorkoutModal = () => {
    closeAndNavigate("/presets/create", {
      state: { initialExercises: currentWorkoutPresetExercises },
    });
  };

  const handleOpenBulkCreatePage = () => {
    closeAndNavigate("/exercises/bulk-create");
  };

  const handleOpenCreateExercisePage = () => {
    closeAndNavigate("/exercises/create");
  };

  return (
    <>
      <Drawer
        direction="right"
        open={isDrawerOpen}
        onOpenChange={handleDrawerOpenChange}
      >
        {!isDrawerOpen ? (
          <DrawerTrigger asChild>
            <Button className="text-xl font-bold justify-center w-full p-6">
              Добавить упражнение
            </Button>
          </DrawerTrigger>
        ) : null}
        <DrawerContent
          className="flex h-dvh min-h-0 flex-col overflow-hidden"
          style={
            drawerViewportStyle.height
              ? {
                  height: drawerViewportStyle.height,
                  top: drawerViewportStyle.top,
                  bottom: "auto",
                }
              : undefined
          }
        >
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
              scrollBottomPadding={false}
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
            <Button variant="outline" onClick={closeDrawer}>
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
