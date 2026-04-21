import type { AnalyticsPeriod, DashboardAnalytics } from "@/entities/analytics";
import { formatTonnageParts } from "@/shared/lib";
import { AnalyticsCard, AnalyticsSectionTitle } from "@/shared/ui/analytics";
import { cn } from "@/shared/ui/lib/utils";
import { AnalyticsPeriodSegmentedControl } from "./AnalyticsPeriodSegmentedControl";
import { AnalyticsMainProgressChart } from "./AnalyticsMainProgressChart";

interface AnalyticsHeroCardProps {
  analytics: DashboardAnalytics;
  summary: DashboardAnalytics["summary"];
  comparison: DashboardAnalytics["tonnageComparison"];
  period: AnalyticsPeriod;
  onPeriodChange: (period: AnalyticsPeriod) => void;
}

const formatDelta = (deltaPercent: number | null) => {
  if (deltaPercent === null) {
    return "Новый период";
  }
  const sign = deltaPercent > 0 ? "+" : "";
  return `${sign}${deltaPercent.toFixed(1)}% к прошлому`;
};

export const AnalyticsHeroCard = ({
  summary,
  comparison,
  period,
  onPeriodChange,
  analytics,
}: AnalyticsHeroCardProps) => {
  const totalTonnage = formatTonnageParts(summary.volume.totalTonnage);
  const deltaLabel = formatDelta(comparison.deltaPercent);
  const deltaClassName =
    comparison.delta > 0
      ? "text-emerald-400"
      : comparison.delta < 0
        ? "text-red-400"
        : "text-muted-foreground";

  return (
    <AnalyticsCard>
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <AnalyticsSectionTitle
          className="mb-0 min-w-0"
          subtitle="Общий тоннаж за период"
        >
          Объём
        </AnalyticsSectionTitle>
        <div className="flex gap-2 justify-between">
          <div>
            <p className="text-3xl font-extrabold tabular-nums sm:text-5xl">
              {totalTonnage.value}
              <span className="ml-2 text-lg font-semibold text-muted-foreground">
                {totalTonnage.unit}
              </span>
            </p>
            <p className={cn("mt-2 text-sm font-medium", deltaClassName)}>
              {deltaLabel}
            </p>
          </div>
          <div className=" rounded-lg border border-border bg-muted/60 px-4 py-3 sm:w-auto">
            <p className="text-xs text-muted-foreground">PR</p>
            <p className="mt-1 text-3xl font-bold text-primary">
              {summary.weight.maxWeight.toFixed(0)}
              <span className="ml-1 text-base font-semibold">кг</span>
            </p>
          </div>
        </div>
        <AnalyticsPeriodSegmentedControl
          value={period}
          onChange={onPeriodChange}
        />
        <AnalyticsMainProgressChart trends={analytics.trends} />
      </div>
    </AnalyticsCard>
  );
};
