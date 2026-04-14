import { useState } from "react";
import type { AnalyticsFilters, AnalyticsPeriod } from "@/entities/analytics";
import { DEFAULT_ANALYTICS_FILTERS } from "../model/types";

export const useAnalyticsFilters = (initialState = DEFAULT_ANALYTICS_FILTERS) => {
  const [filters, setFilters] = useState<AnalyticsFilters>(initialState);

  const handlePeriodChange = (period: AnalyticsPeriod) => {
    setFilters((prevState) => ({
      ...prevState,
      period,
    }));
  };

  const handleExerciseNameChange = (exerciseName: string) => {
    setFilters((prevState) => ({
      ...prevState,
      exerciseName,
    }));
  };

  const handleCategoryChange = (category: string) => {
    setFilters((prevState) => ({
      ...prevState,
      category,
    }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_ANALYTICS_FILTERS);
  };

  return {
    filters,
    handlePeriodChange,
    handleExerciseNameChange,
    handleCategoryChange,
    resetFilters,
  };
};

