import type { AnalyticsPeriod, PeriodComparison } from "@/entities/analytics";
import { AnalyticsCard, AnalyticsSectionTitle } from "@/shared/ui/analytics";
import { cn } from "@/shared/ui/lib/utils";
import {
  formatPeriodDelta,
  formatTonnageInTons,
  getPeriodLabel,
} from "../model/formatPeriodComparison";

interface AnalyticsPeriodCompareCardProps {
  period: AnalyticsPeriod;
  comparison: PeriodComparison;
  className?: string;
}

export const AnalyticsPeriodCompareCard = ({
  period,
  comparison,
  className,
}: AnalyticsPeriodCompareCardProps) => {
  const periodLabel = getPeriodLabel(period);
  const deltaText = formatPeriodDelta(comparison);

  return (
    <AnalyticsCard className={cn(className)}>
      <AnalyticsSectionTitle
        subtitle={`Изменение тоннажа за последние ${periodLabel}`}
      >
        Сравнение периодов
      </AnalyticsSectionTitle>
      <div className="grid gap-2">
        <div className="flex items-center justify-between gap-2 text-sm">
          <span className="text-muted-foreground">Текущий период</span>
          <span className="font-semibold text-foreground">
            {formatTonnageInTons(comparison.currentValue)} т
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 text-sm">
          <span className="text-muted-foreground">Прошлый период</span>
          <span className="font-semibold text-foreground">
            {formatTonnageInTons(comparison.previousValue)} т
          </span>
        </div>
        <div className="flex items-start justify-between gap-2 text-sm">
          <span className="text-muted-foreground">Разница</span>
          <span
            className={cn(
              "text-right font-semibold",
              comparison.delta > 0
                ? "text-emerald-400"
                : comparison.delta < 0
                  ? "text-red-400"
                  : "text-muted-foreground",
            )}
          >
            {deltaText.signedDelta} т ({deltaText.percent})
          </span>
        </div>
      </div>
    </AnalyticsCard>
  );
};
