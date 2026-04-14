import { Pencil } from "lucide-react";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import { type ExerciseCategory } from "@/entities/exercise";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/shadCNComponents/ui/dialog.tsx";
import { useState } from "react";
import { FullExerciseCommand } from "../../fullExerciseList";

interface ExerciseNameSelectorProps {
  exerciseName: string;
  isEditable: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (name: string) => void;
  allExercises: ExerciseCategory[];
}

export const ExerciseNameSelector = ({
  exerciseName,
  isEditable,
  open,
  onOpenChange,
  onSelect,
}: ExerciseNameSelectorProps) => {
  const [selectedExercise, setSelectedExercise] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          disabled={!isEditable}
          variant="ghost"
          className="justify-between text-md overflow-hidden max-w-[150px] min-[330px]:max-w-[200px]"
        >
          <span className={"truncate"}>
            {exerciseName || "Выберите упражнение"}
          </span>
          {isEditable && <Pencil className="opacity-50" />}
        </Button>
      </DialogTrigger>
      <DialogContent
        onPointerDownOutside={(e) => {
          if (e.target instanceof HTMLElement) {
            const isBackDrop = e.target.dataset.radixDialogOverlay === "";
            if (isBackDrop) onOpenChange(false);
          }
        }}
        onInteractOutside={(e) => {
          const isBackDrop =
            (e.target as HTMLElement).dataset.radixDialogOverlay === "";
          if (isBackDrop) onOpenChange(false);
        }}
        showCloseButton={false}
        className="p-0"
      >
        <DialogTitle className={"text-center pt-4"}>
          Выберите упражнение
        </DialogTitle>
        <div className={"max-h-[50dvh] max-w-full overflow-y-scroll"}>
          <FullExerciseCommand
            variant={"exercises"}
            checkable={"radio"}
            selectedExerciseCheckboxes={selectedExercise}
            exerciseSelectHandler={setSelectedExercise}
          />
        </div>
        <div className={"flex justify-center p-2 pt-0 border-gray-200"}>
          <Button onClick={() => onSelect(selectedExercise)}>Выбрать</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
