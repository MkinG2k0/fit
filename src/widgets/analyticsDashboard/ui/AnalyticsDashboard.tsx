import type { AnalyticsPeriod, DashboardAnalytics } from "@/entities/analytics";
import { AnalyticsPeriodCompareCard } from "@/features/analyticsPeriodCompare";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/shadCNComponents/ui/card";
import { cn } from "@/shared/ui/lib/utils";
import { AnalyticsFrequencyChart } from "./AnalyticsFrequencyChart";
import { AnalyticsKpiGrid } from "./AnalyticsKpiGrid";
import { AnalyticsProgressChart } from "./AnalyticsProgressChart";

interface AnalyticsDashboardProps {
  analytics: DashboardAnalytics;
  period: AnalyticsPeriod;
  className?: string;
}

export const AnalyticsDashboard = ({
  analytics,
  period,
  className,
}: AnalyticsDashboardProps) => {
  if (analytics.trends.length === 0) {
    return (
      <Card className={cn(className)}>
        <CardHeader>
          <CardTitle>Нет данных для аналитики</CardTitle>
          <CardDescription>
            Добавьте упражнения или измените фильтры для построения метрик.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <section className={cn("grid gap-3 sm:gap-4", className)}>
      <AnalyticsKpiGrid summary={analytics.summary} />
      <div className="grid gap-4 lg:grid-cols-2">
        <AnalyticsProgressChart trends={analytics.trends} />
        <AnalyticsFrequencyChart trends={analytics.trends} />
      </div>
      <AnalyticsPeriodCompareCard
        period={period}
        comparison={analytics.tonnageComparison}
      />
      <Card>
        <CardHeader>
          <CardTitle>Ключевые факты</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-1 text-sm text-muted-foreground">
          <p>
            Лучший дневной объем:{" "}
            {analytics.summary.volume.bestDayTonnage.toFixed(0)} кг
          </p>
          <p>
            Средняя плотность по неделе:{" "}
            {analytics.summary.frequency.averageSessionsPerWeek.toFixed(1)} сессий
          </p>
        </CardContent>
      </Card>
    </section>
  );
};

