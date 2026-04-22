import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/shadCNComponents/ui/dialog";

interface CreateExerciseHeaderProps {
  isEditing: boolean;
}

export const CreateExerciseHeader = ({
  isEditing,
}: CreateExerciseHeaderProps) => {
  return (
    <DialogHeader className="min-w-0">
      <DialogTitle>
        {isEditing ? "Редактировать упражнение" : "Создать упражнение"}
      </DialogTitle>
      <DialogDescription>
        {isEditing
          ? "Измените категорию, иконку, название, описание и фото упражнения"
          : "Выберите категорию, иконку, название, описание и фото нового упражнения"}
      </DialogDescription>
    </DialogHeader>
  );
};
