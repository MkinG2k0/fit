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
      <div className="flex w-full min-w-0 items-center gap-2 overflow-hidden px-0 text-md">
        <span className="block flex-1 min-w-0 truncate text-left">
          {exerciseName || "Выберите упражнение"}
        </span>
        {isEditable && (
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 shrink-0 p-0 text-muted-foreground hover:text-foreground"
              aria-label="Редактировать упражнение"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
            >
              <Pencil className="opacity-70" />
            </Button>
          </DialogTrigger>
        )}
      </div>
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
        <div className="flex h-[65dvh] min-h-96 max-h-[80dvh] flex-col">
          <DialogTitle className={"text-center pt-4"}>
            Выберите упражнение
          </DialogTitle>
          <div className="min-h-0 flex-1 max-w-full overflow-y-auto">
            <FullExerciseCommand
              variant={"exercises"}
              checkable={"radio"}
              selectedExerciseCheckboxes={selectedExercise}
              exerciseSelectHandler={setSelectedExercise}
            />
          </div>
        </div>
        <div className="flex justify-center gap-2 p-2 pt-0 border-gray-200">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Закрыть
          </Button>
          <Button onClick={() => onSelect(selectedExercise)}>Выбрать</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
