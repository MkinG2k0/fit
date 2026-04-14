import { useMemo } from "react";
import { buildDashboardAnalytics } from "@/entities/analytics";
import { AnalyticsFilters, useAnalyticsFilters } from "@/features/analyticsFilters";
import { readAllTrainingDaysFromStorage } from "@/shared/lib/analyticsStorage";
import { Separator } from "@/shared/ui/shadCNComponents/ui/separator";
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

  const allTrainingDays = useMemo(() => readAllTrainingDaysFromStorage(), []);
  const analytics = useMemo(
    () => buildDashboardAnalytics(allTrainingDays, filters),
    [allTrainingDays, filters],
  );

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <Header title="Аналитика" navigateBack />
      <Separator />
      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-3 py-3 sm:px-4 sm:py-4">
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

