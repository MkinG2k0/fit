import { RotateCcw } from "lucide-react";
import { useMemo } from "react";
import { useExerciseStore } from "@/entities/exercise";
import type { AnalyticsFilters as AnalyticsFiltersState } from "@/entities/analytics";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import { Label } from "@/shared/ui/shadCNComponents/ui/label";
import { cn } from "@/shared/ui/lib/utils";
import {
  SearchableSelect,
  type SearchableSelectOption,
} from "./SearchableSelect";

interface AnalyticsFiltersProps {
  filters: AnalyticsFiltersState;
  onExerciseIdChange: (exerciseId: string) => void;
  onCategoryChange: (categoryId: string) => void;
  onReset: () => void;
  className?: string;
}

export const AnalyticsFilters = ({
  filters,
  onExerciseIdChange,
  onCategoryChange,
  onReset,
  className,
}: AnalyticsFiltersProps) => {
  const exerciseCatalog = useExerciseStore((state) => state.exercises);
  const categoryOptions = useMemo<SearchableSelectOption[]>(() => {
    return exerciseCatalog.map((category) => ({
      value: category.id,
      label: category.category,
    }));
  }, [exerciseCatalog]);

  const exercisesByCategory = useMemo(() => {
    return exerciseCatalog.reduce<Record<string, SearchableSelectOption[]>>(
      (acc, category) => {
        acc[category.id] = category.exercises.map((exercise) => ({
          value: exercise.id,
          label: exercise.name,
        }));
        return acc;
      },
      {},
    );
  }, [exerciseCatalog]);

  const allExerciseOptions = useMemo<SearchableSelectOption[]>(() => {
    return exerciseCatalog.flatMap((category) =>
      category.exercises.map((exercise) => ({
        value: exercise.id,
        label: exercise.name,
      })),
    );
  }, [exerciseCatalog]);

  const uniqueById = (items: SearchableSelectOption[]) => {
    const seen = new Set<string>();
    return items.filter((item) => {
      if (seen.has(item.value)) {
        return false;
      }
      seen.add(item.value);
      return true;
    });
  };

  const exerciseOptions = useMemo<SearchableSelectOption[]>(() => {
    const exercises =
      filters.category.length > 0
        ? (exercisesByCategory[filters.category] ?? [])
        : allExerciseOptions;
    return uniqueById(exercises);
  }, [allExerciseOptions, exercisesByCategory, filters.category]);

  const handleExerciseSelect = (exerciseId: string) => {
    onExerciseIdChange(exerciseId);
  };

  const handleCategorySelect = (category: string) => {
    onCategoryChange(category);
    if (category.length === 0) {
      return;
    }

    const categoryExercises = exercisesByCategory[category] ?? [];
    if (!categoryExercises.some((exercise) => exercise.value === filters.exerciseId)) {
      onExerciseIdChange("");
    }
  };

  return (
    <section
      className={cn(
        "rounded-xl border border-border bg-card p-3 sm:p-4",
        className,
      )}
    >
      <div className="mb-3 flex flex-col gap-2 sm:mb-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-foreground">Фильтры</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="self-start text-muted-foreground hover:text-foreground sm:self-auto"
        >
          <RotateCcw className="size-4" />
          Сброс
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label className="text-muted-foreground">Упражнение</Label>
          <SearchableSelect
            value={filters.exerciseId}
            options={exerciseOptions}
            placeholder="Например: Жим лежа"
            searchPlaceholder="Поиск упражнения..."
            emptyText="Упражнения не найдены"
            onValueChange={handleExerciseSelect}
          />
        </div>
        <div className="grid gap-2">
          <Label className="text-muted-foreground">Категория</Label>
          <SearchableSelect
            value={filters.category}
            options={categoryOptions}
            placeholder="Например: Грудь"
            searchPlaceholder="Поиск категории..."
            emptyText="Категории не найдены"
            onValueChange={handleCategorySelect}
          />
        </div>
      </div>
    </section>
  );
};
