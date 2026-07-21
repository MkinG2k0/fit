import type { AnalyticsPeriod, DashboardAnalytics } from "@/entities/analytics";
import type { CalendarDay } from "@/entities/calendarDay";
import { AnalyticsPeriodCompareCard } from "@/features/analyticsPeriodCompare";
import { ShareStatsButton } from "@/features/shareStats";
import { AnalyticsCard } from "@/shared/ui/analytics";
import { cn } from "@/shared/ui/lib/utils";
import { AnalyticsActivityHeatmapCard } from "./AnalyticsActivityHeatmapCard";
import { AnalyticsExerciseListCard } from "./AnalyticsExerciseListCard";
import { AnalyticsHeroCard } from "./AnalyticsHeroCard";
import { AnalyticsMuscleBalanceCard } from "./AnalyticsMuscleBalanceCard";

interface AnalyticsDashboardProps {
  analytics: DashboardAnalytics;
  period: AnalyticsPeriod;
  onPeriodChange: (period: AnalyticsPeriod) => void;
  days: Record<string, CalendarDay>;
  className?: string;
}

export const AnalyticsDashboard = ({
  analytics,
  period,
  onPeriodChange,
  days,
  className,
}: AnalyticsDashboardProps) => {
  if (analytics.trends.length === 0) {
    return (
      <section className={cn("grid gap-3 sm:gap-4", className)}>
        <AnalyticsCard>
          <p className="text-lg font-semibold text-foreground">
            Нет данных для аналитики
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Добавьте упражнения или измените фильтры для построения метрик.
          </p>
        </AnalyticsCard>
        <ShareStatsButton days={days} defaultPeriod={period} />
      </section>
    );
  }

  return (
    <section className={cn("grid gap-3 sm:gap-4", className)}>
      <AnalyticsHeroCard
        analytics={analytics}
        summary={analytics.summary}
        comparison={analytics.tonnageComparison}
        period={period}
        onPeriodChange={onPeriodChange}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <AnalyticsActivityHeatmapCard heatmap={analytics.activityHeatmap} />
        <AnalyticsMuscleBalanceCard muscleBalance={analytics.muscleBalance} />
      </div>
      <div className="grid gap-3 sm:grid-cols-[1.5fr_1fr]">
        <AnalyticsExerciseListCard rows={analytics.exerciseRows} />
        <AnalyticsPeriodCompareCard
          period={period}
          comparison={analytics.tonnageComparison}
        />
      </div>
      <ShareStatsButton days={days} defaultPeriod={period} />
    </section>
  );
};
