import { useEffect, useMemo, useState } from "react";
import type { CalendarDay } from "@/entities/calendarDay";
import { buildDashboardAnalytics } from "@/entities/analytics";
import {
  AnalyticsFilters,
  useAnalyticsFilters,
} from "@/features/analyticsFilters";
import { readAllTrainingDaysFromStorage } from "@/shared/lib/analyticsStorage";
import { AnalyticsDashboard } from "@/widgets/analyticsDashboard";
import { Header } from "@/widgets/header";

export const AnalyticsPage = () => {
  const {
    filters,
    handlePeriodChange,
    handleExerciseNameChange,
    handleCategoryChange,
    resetFilters,
  } = useAnalyticsFilters();

  const [allTrainingDays, setAllTrainingDays] = useState<
    Record<string, CalendarDay>
  >({});

  useEffect(() => {
    let isDisposed = false;

    const loadTrainingDays = async () => {
      const days = await readAllTrainingDaysFromStorage();
      if (!isDisposed) {
        setAllTrainingDays(days);
      }
    };

    void loadTrainingDays();

    return () => {
      isDisposed = true;
    };
  }, []);

  const analytics = useMemo(
    () => buildDashboardAnalytics(allTrainingDays, filters),
    [allTrainingDays, filters],
  );

  return (
    <div className="flex h-dvh flex-col gap-2 overflow-hidden">
      <Header title="Аналитика" navigateBack />

      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
        <div className="mx-auto grid max-w-6xl gap-3 sm:gap-4">
          <p className="text-sm text-muted-foreground">
            Динамика упражнений, нагрузки и частоты тренировок
          </p>
          <AnalyticsFilters
            filters={filters}
            onPeriodChange={handlePeriodChange}
            onExerciseNameChange={handleExerciseNameChange}
            onCategoryChange={handleCategoryChange}
            onReset={resetFilters}
          />
          <AnalyticsDashboard analytics={analytics} period={filters.period} />
        </div>
      </div>
    </div>
  );
};
