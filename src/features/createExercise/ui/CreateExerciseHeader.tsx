interface CreateExerciseHeaderProps {
  isEditing: boolean;
}

export const CreateExerciseHeader = ({
  isEditing,
}: CreateExerciseHeaderProps) => {
  return (
    <div className="min-w-0 space-y-1.5">
      <p className="text-muted-foreground text-sm">
        {isEditing
          ? "Измените категорию, иконку, название, описание и фото упражнения"
          : "Выберите категорию, иконку, название, описание и фото нового упражнения"}
      </p>
    </div>
  );
};
