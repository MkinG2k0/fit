import { RotateCcw } from "lucide-react";
import { useMemo } from "react";
import type {
  AnalyticsFilters as AnalyticsFiltersState,
  AnalyticsPeriod,
} from "@/entities/analytics";
import { allExercises } from "@/shared/config/constants";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import { Label } from "@/shared/ui/shadCNComponents/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/shared/ui/shadCNComponents/ui/radio-group";
import { cn } from "@/shared/ui/lib/utils";
import { ANALYTICS_PERIOD_OPTIONS } from "../model/types";
import {
  SearchableSelect,
  type SearchableSelectOption,
} from "./SearchableSelect";

interface AnalyticsFiltersProps {
  filters: AnalyticsFiltersState;
  onPeriodChange: (period: AnalyticsPeriod) => void;
  onExerciseNameChange: (exerciseName: string) => void;
  onCategoryChange: (category: string) => void;
  onReset: () => void;
  className?: string;
}

const periodGroupClassName = "flex gap-2";
const periodOptionClassName =
  "flex flex-1 cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm";

export const AnalyticsFilters = ({
  filters,
  onPeriodChange,
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

  const handlePeriodValueChange = (value: string) => {
    if (value === "7d" || value === "30d" || value === "90d") {
      onPeriodChange(value);
    }
  };

  return (
    <section className={cn("rounded-lg border p-3 sm:p-4", className)}>
      <div className="mb-3 flex items-start justify-between gap-2 sm:mb-4 sm:flex-row sm:items-center">
        <h2 className="text-lg font-semibold">Фильтры аналитики</h2>
        <Button variant="ghost" size="sm" onClick={onReset}>
          <RotateCcw className="size-4" />
          Сброс
        </Button>
      </div>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label>Упражнение</Label>
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
          <Label>Категория</Label>
          <SearchableSelect
            value={filters.category}
            options={categoryOptions}
            placeholder="Например: Грудь"
            searchPlaceholder="Поиск категории..."
            emptyText="Категории не найдены"
            onValueChange={handleCategorySelect}
          />
        </div>
        <div className="grid gap-2">
          <Label>Период</Label>
          <RadioGroup
            className={periodGroupClassName}
            value={filters.period}
            onValueChange={handlePeriodValueChange}
          >
            {ANALYTICS_PERIOD_OPTIONS.map((option) => {
              const itemId = `period-${option.value}`;
              return (
                <Label
                  key={option.value}
                  htmlFor={itemId}
                  className={periodOptionClassName}
                >
                  <RadioGroupItem id={itemId} value={option.value} />
                  <span>{option.label}</span>
                </Label>
              );
            })}
          </RadioGroup>
        </div>
      </div>
    </section>
  );
};
