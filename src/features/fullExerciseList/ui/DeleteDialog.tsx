import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/shadCNComponents/ui/dialog";

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "exercise" | "preset" | "category";
  name: string;
  onConfirm: () => void;
}

export const DeleteDialog = ({
  open,
  onOpenChange,
  type,
  name,
  onConfirm,
}: DeleteDialogProps) => {
  const handleClose = () => {
    onOpenChange(false);
  };

  const deleteTargetLabel =
    type === "exercise"
      ? "упражнение"
      : type === "preset"
        ? "пресет"
        : "категорию";
  const deleteDescription =
    type === "category"
      ? `Вы уверены, что хотите удалить категорию "${name}" вместе со всеми упражнениями внутри? Это действие нельзя отменить.`
      : `Вы уверены, что хотите удалить ${deleteTargetLabel} "${name}"? Это действие нельзя отменить.`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Подтвердите удаление</DialogTitle>
          <DialogDescription>{deleteDescription}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
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

