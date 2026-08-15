import { useSearchParams } from "react-router-dom";
import { useExerciseSelection } from "@/features/addExercise/lib/useExerciseSelection";
import { useDrawerViewportStyle } from "@/features/addExercise/lib/useDrawerViewportStyle";
import { FullExerciseCommand } from "@/features/fullExerciseList";
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

const DRAWER_QUERY_PARAM = "add-exercise";
const DRAWER_QUERY_VALUE = "1";

const noopPresetSelectHandler = () => {};

interface AddPresetExercisesDrawerProps {
  onAdd: (exerciseIds: string[]) => void;
}

export const AddPresetExercisesDrawer = ({
  onAdd,
}: AddPresetExercisesDrawerProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const isDrawerOpen =
    searchParams.get(DRAWER_QUERY_PARAM) === DRAWER_QUERY_VALUE;
  const drawerViewportStyle = useDrawerViewportStyle(isDrawerOpen);

  const {
    selectedExerciseCheckboxes,
    exerciseSelectHandler,
    reset,
  } = useExerciseSelection();

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

  const handleSubmit = () => {
    onAdd(selectedExerciseCheckboxes);
    reset();
    handleDrawerOpenChange(false);
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
          <Button
            variant="outline"
            onClick={() => handleDrawerOpenChange(false)}
          >
            Отмена
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
