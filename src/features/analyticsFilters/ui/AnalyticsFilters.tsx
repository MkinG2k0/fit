import { RotateCcw } from "lucide-react";
import type { ChangeEvent } from "react";
import type {
  AnalyticsFilters as AnalyticsFiltersState,
  AnalyticsPeriod,
} from "@/entities/analytics";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import { Input } from "@/shared/ui/shadCNComponents/ui/input";
import { Label } from "@/shared/ui/shadCNComponents/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/shared/ui/shadCNComponents/ui/radio-group";
import { cn } from "@/shared/ui/lib/utils";
import { ANALYTICS_PERIOD_OPTIONS } from "../model/types";

interface AnalyticsFiltersProps {
  filters: AnalyticsFiltersState;
  onPeriodChange: (period: AnalyticsPeriod) => void;
  onExerciseNameChange: (exerciseName: string) => void;
  onCategoryChange: (category: string) => void;
  onReset: () => void;
  className?: string;
}

const inputClassName = "h-9";
const radioGroupClassName = "grid-cols-1 sm:grid-cols-3";
const periodOptionClassName =
  "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm";

export const AnalyticsFilters = ({
  filters,
  onPeriodChange,
  onExerciseNameChange,
  onCategoryChange,
  onReset,
  className,
}: AnalyticsFiltersProps) => {
  const handleExerciseInputChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    onExerciseNameChange(event.target.value);
  };

  const handleCategoryInputChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    onCategoryChange(event.target.value);
  };

  const handlePeriodValueChange = (value: string) => {
    if (value === "7d" || value === "30d" || value === "90d") {
      onPeriodChange(value);
    }
  };

  return (
    <section className={cn("rounded-lg border p-3 sm:p-4", className)}>
      <div className="mb-3 flex flex-col items-start justify-between gap-2 sm:mb-4 sm:flex-row sm:items-center">
        <h2 className="text-lg font-semibold">Фильтры аналитики</h2>
        <Button variant="ghost" size="sm" onClick={onReset}>
          <RotateCcw className="size-4" />
          Сброс
        </Button>
      </div>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="analytics-exercise">Упражнение</Label>
          <Input
            id="analytics-exercise"
            className={inputClassName}
            placeholder="Например: Жим лежа"
            value={filters.exerciseName}
            onChange={handleExerciseInputChange}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="analytics-category">Категория</Label>
          <Input
            id="analytics-category"
            className={inputClassName}
            placeholder="Например: Грудь"
            value={filters.category}
            onChange={handleCategoryInputChange}
          />
        </div>
        <div className="grid gap-2">
          <Label>Период</Label>
          <RadioGroup
            className={radioGroupClassName}
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

