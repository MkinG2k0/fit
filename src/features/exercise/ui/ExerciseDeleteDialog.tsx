import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/shadCNComponents/ui/dialog";

interface ExerciseDeleteDialogProps {
  open: boolean;
  exerciseName: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export const ExerciseDeleteDialog = ({
  open,
  exerciseName,
  onOpenChange,
  onConfirm,
}: ExerciseDeleteDialogProps) => {
  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Подтвердите удаление</DialogTitle>
          <DialogDescription>
            {`Вы уверены, что хотите удалить упражнение "${exerciseName}"? Это действие нельзя отменить.`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Отмена
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Удалить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
