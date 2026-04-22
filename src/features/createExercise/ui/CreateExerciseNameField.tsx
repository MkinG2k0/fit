import { Input } from "@/shared/ui/shadCNComponents/ui/input";

interface CreateExerciseNameFieldProps {
  name: string;
  error: string;
  onNameChange: (name: string) => void;
}

export const CreateExerciseNameField = ({
  name,
  error,
  onNameChange,
}: CreateExerciseNameFieldProps) => {
  return (
    <div className="min-w-0 space-y-2">
      <label htmlFor="exercise-name" className="text-sm font-medium">
        Название упражнения
      </label>
      <Input
        id="exercise-name"
        placeholder="Например: Жим лежа"
        value={name}
        onChange={(event) => onNameChange(event.target.value)}
      />
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
};
