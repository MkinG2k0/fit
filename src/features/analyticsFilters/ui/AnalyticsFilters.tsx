import { RotateCcw } from "lucide-react";
import { useMemo } from "react";
import type { AnalyticsFilters as AnalyticsFiltersState } from "@/entities/analytics";
import { allExercises } from "@/shared/config/constants";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import { Label } from "@/shared/ui/shadCNComponents/ui/label";
import { cn } from "@/shared/ui/lib/utils";
import {
  SearchableSelect,
  type SearchableSelectOption,
} from "./SearchableSelect";

interface AnalyticsFiltersProps {
  filters: AnalyticsFiltersState;
  onExerciseNameChange: (exerciseName: string) => void;
  onCategoryChange: (category: string) => void;
  onReset: () => void;
  className?: string;
}

export const AnalyticsFilters = ({
  filters,
  onExerciseNameChange,
  onCategoryChange,
  onReset,
  className,
}: AnalyticsFiltersProps) => {
  const categoryOptions = useMemo<SearchableSelectOption[]>(() => {
    return allExercises.map((category) => ({
      value: category.category,
      label: category.category,
    }));
  }, []);

  const exercisesByCategory = useMemo(() => {
    return allExercises.reduce<Record<string, string[]>>((acc, category) => {
      acc[category.category] = category.exercises.map(
        (exercise) => exercise.name,
      );
      return acc;
    }, {});
  }, []);

  const exerciseOptions = useMemo<SearchableSelectOption[]>(() => {
    const exercises =
      filters.category.length > 0
        ? (exercisesByCategory[filters.category] ?? [])
        : allExercises.flatMap((category) =>
            category.exercises.map((exercise) => exercise.name),
          );
    const uniqueExercises = Array.from(new Set(exercises));

    return uniqueExercises.map((exercise) => ({
      value: exercise,
      label: exercise,
    }));
  }, [exercisesByCategory, filters.category]);

  const handleExerciseSelect = (exerciseName: string) => {
    onExerciseNameChange(exerciseName);
  };

  const handleCategorySelect = (category: string) => {
    onCategoryChange(category);
    if (category.length === 0) {
      return;
    }

    const categoryExercises = exercisesByCategory[category] ?? [];
    if (!categoryExercises.includes(filters.exerciseName)) {
      onExerciseNameChange("");
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
            value={filters.exerciseName}
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
