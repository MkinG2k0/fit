import { useExerciseSelection } from "@/features/addExercise/lib/useExerciseSelection";
import { useDrawerViewportStyle } from "@/features/addExercise/lib/useDrawerViewportStyle";
import { FullExerciseCommand } from "@/features/fullExerciseList";
import {
  ADD_PRESET_EXERCISE_PARAM,
  useOverlaySearchParam,
} from "@/shared/lib/navigation";
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

const noopPresetSelectHandler = () => {};

interface AddPresetExercisesDrawerProps {
  onAdd: (exerciseIds: string[]) => void;
}

export const AddPresetExercisesDrawer = ({
  onAdd,
}: AddPresetExercisesDrawerProps) => {
  const {
    isOpen: isDrawerOpen,
    close: closeDrawer,
    onOpenChange: handleDrawerOpenChange,
  } = useOverlaySearchParam(ADD_PRESET_EXERCISE_PARAM, "1");
  const drawerViewportStyle = useDrawerViewportStyle(isDrawerOpen);

  const {
    selectedExerciseCheckboxes,
    exerciseSelectHandler,
    reset,
  } = useExerciseSelection();

  const handleSubmit = () => {
    onAdd(selectedExerciseCheckboxes);
    reset();
    closeDrawer();
  };

  return (
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
            <DrawerTitle className="text-2xl w-full flex justify-between items-center">
              Добавьте упражнения
            </DrawerTitle>
            <DrawerDescription></DrawerDescription>
          </DrawerHeader>
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          <FullExerciseCommand
            variant="exercises"
            selectedExerciseCheckboxes={selectedExerciseCheckboxes}
            selectedPresetCheckboxes={[]}
            presetSelectHandler={noopPresetSelectHandler}
            exerciseSelectHandler={exerciseSelectHandler}
            checkable="checkbox"
            deletable={false}
            scrollBottomPadding={false}
          />
        </div>
        <DrawerFooter className="w-full shrink-0 p-0 mt-2">
          <Button
            disabled={selectedExerciseCheckboxes.length === 0}
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
  );
};
