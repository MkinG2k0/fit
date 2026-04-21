import type { AnalyticsPeriod, PeriodComparison } from "@/entities/analytics";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/shadCNComponents/ui/card";
import { cn } from "@/shared/ui/lib/utils";
import { formatPeriodDelta, getPeriodLabel } from "../model/formatPeriodComparison";

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
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>Сравнение периодов</CardTitle>
        <CardDescription>
          Изменение тоннажа за последние {periodLabel}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2">
        <div className="flex items-center justify-between gap-2 text-sm">
          <span className="text-muted-foreground">Текущий период</span>
          <span className="font-semibold">{comparison.currentValue.toFixed(0)} кг</span>
        </div>
        <div className="flex items-center justify-between gap-2 text-sm">
          <span className="text-muted-foreground">Прошлый период</span>
          <span className="font-semibold">{comparison.previousValue.toFixed(0)} кг</span>
        </div>
        <div className="flex items-start justify-between gap-2 text-sm">
          <span className="text-muted-foreground">Разница</span>
          <span
            className={cn(
              "text-right font-semibold",
              comparison.delta > 0
                ? "text-primary"
                : comparison.delta < 0
                  ? "text-destructive"
                  : "text-muted-foreground",
            )}
          >
            {deltaText.signedDelta} кг ({deltaText.percent})
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

