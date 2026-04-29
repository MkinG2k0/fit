import { Button } from "@/shared/ui/shadCNComponents/ui/button";

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
    <div className="flex min-w-0 flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <Button variant="outline" className="flex-auto" onClick={onCancel}>
        Отмена
      </Button>

      <Button onClick={onSave} className="flex-auto" disabled={saveDisabled}>
        {isEditing ? "Сохранить" : "Создать"}
      </Button>

      {canDelete && (
        <Button variant="destructive" className="flex-auto" onClick={onDelete}>
          Удалить упражнение
        </Button>
      )}
    </div>
  );
};
