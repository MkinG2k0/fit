import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import { DialogFooter } from "@/shared/ui/shadCNComponents/ui/dialog";

interface CreateExerciseFooterProps {
  isEditing: boolean;
  canDelete: boolean;
  saveDisabled: boolean;
  onCancel: () => void;
  onSave: () => void;
  onDelete: () => void;
}

export const CreateExerciseFooter = ({
  isEditing,
  canDelete,
  saveDisabled,
  onCancel,
  onSave,
  onDelete,
}: CreateExerciseFooterProps) => {
  return (
    <DialogFooter className="min-w-0">
      <Button variant="outline" onClick={onCancel}>
        Отмена
      </Button>

      <Button onClick={onSave} disabled={saveDisabled}>
        {isEditing ? "Сохранить" : "Создать"}
      </Button>

      {canDelete && (
        <Button variant="destructive" className="w-full" onClick={onDelete}>
          Удалить упражнение
        </Button>
      )}
    </DialogFooter>
  );
};
