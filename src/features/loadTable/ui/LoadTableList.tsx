import { Trash2 } from "lucide-react";
import { findCatalogExerciseById, useExerciseStore } from "@/entities/exercise";
import { useLoadTableStore } from "@/entities/loadTable";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";

interface LoadTableListProps {
  onSelect: (id: string) => void;
  onAddClick: () => void;
}

export const LoadTableList = ({ onSelect, onAddClick }: LoadTableListProps) => {
  const exercises = useLoadTableStore((state) => state.exercises);
  const removeExercise = useLoadTableStore((state) => state.removeExercise);
  const catalog = useExerciseStore((state) => state.exercises);

  if (exercises.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Пока нет упражнений в таблице нагрузок
        </p>
        <Button type="button" onClick={onAddClick}>
          Добавить
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <Button type="button" onClick={onAddClick}>
          Добавить
        </Button>
      </div>
      <ul className="flex flex-col gap-2">
        {exercises.map((entry) => {
          const catalogEntry = findCatalogExerciseById(
            catalog,
            entry.catalogExerciseId,
          );
          const name = catalogEntry?.name ?? "Упражнение";

          return (
            <li key={entry.id}>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-card">
                <button
                  type="button"
                  className="flex min-w-0 flex-1 flex-col items-start gap-0.5 px-3 py-3 text-left hover:bg-muted/50"
                  onClick={() => onSelect(entry.id)}
                >
                  <span className="truncate text-sm font-medium text-foreground">
                    {name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    MAX {entry.maxKg} кг
                  </span>
                </button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="mr-1 shrink-0 text-muted-foreground hover:text-destructive"
                  aria-label={`Удалить ${name}`}
                  onClick={() => removeExercise(entry.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
