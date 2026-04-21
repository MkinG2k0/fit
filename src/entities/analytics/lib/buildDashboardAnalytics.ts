import type { CalendarDay } from "@/entities/calendarDay";
import type { AnalyticsFilters, DashboardAnalytics } from "../model/types";
import { calculateActivityHeatmap } from "./calculateActivityHeatmap";
import { calculateExerciseRows } from "./calculateExerciseRows";
import { calculateMuscleBalance } from "./calculateMuscleBalance";
import { calculatePeriodComparison } from "./calculatePeriodComparison";
import { calculateSummaryMetrics } from "./calculateSummaryMetrics";
import { calculateTrends } from "./calculateTrends";
import { normalizeTrainingSessions } from "./normalizeTrainingSessions";
import {
  selectPreviousSessionsByPeriod,
  selectSessionsByPeriod,
} from "./selectSessionsByPeriod";

export const buildDashboardAnalytics = (
  days: Record<string, CalendarDay>,
  filters: AnalyticsFilters,
): DashboardAnalytics => {
  const normalizedSessions = normalizeTrainingSessions(days, filters);
  const currentSessions = selectSessionsByPeriod(normalizedSessions, filters.period);
  const previousSessions = selectPreviousSessionsByPeriod(
    normalizedSessions,
    filters.period,
  );

  return {
    summary: calculateSummaryMetrics(currentSessions),
    trends: calculateTrends(currentSessions),
    tonnageComparison: calculatePeriodComparison(currentSessions, previousSessions),
    activityHeatmap: calculateActivityHeatmap(currentSessions, filters.period),
    muscleBalance: calculateMuscleBalance(currentSessions),
    exerciseRows: calculateExerciseRows(currentSessions, filters.period),
  };
};

