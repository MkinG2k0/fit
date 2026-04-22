interface CreateExerciseDescriptionFieldProps {
  description: string;
  onDescriptionChange: (description: string) => void;
}

export const CreateExerciseDescriptionField = ({
  description,
  onDescriptionChange,
}: CreateExerciseDescriptionFieldProps) => {
  return (
    <div className="min-w-0 space-y-2">
      <label htmlFor="exercise-description" className="text-sm font-medium">
        Описание выполнения
      </label>
      <textarea
        id="exercise-description"
        rows={4}
        placeholder="Например: Лопатки сведены, ноги на полу, опускать штангу к середине груди"
        value={description}
        onChange={(event) => onDescriptionChange(event.target.value)}
        className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  );
};
