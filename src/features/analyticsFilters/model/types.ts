import type { AnalyticsFilters, AnalyticsPeriod } from "@/entities/analytics";

export interface AnalyticsPeriodOption {
  value: AnalyticsPeriod;
  label: string;
}

export const DEFAULT_ANALYTICS_FILTERS: AnalyticsFilters = {
  period: "30d",
  exerciseName: "",
  category: "",
};

export const ANALYTICS_PERIOD_OPTIONS: AnalyticsPeriodOption[] = [
  { value: "7d", label: "7 дней" },
  { value: "30d", label: "30 дней" },
  { value: "90d", label: "90 дней" },
];

