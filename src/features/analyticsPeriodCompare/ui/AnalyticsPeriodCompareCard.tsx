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

const getDeltaColorClassName = (delta: number) => {
  if (delta > 0) {
    return "text-primary";
  }
  if (delta < 0) {
    return "text-destructive";
  }
  return "text-muted-foreground";
};

export const AnalyticsPeriodCompareCard = ({
  period,
  comparison,
  className,
}: AnalyticsPeriodCompareCardProps) => {
  const periodLabel = getPeriodLabel(period);
  const deltaText = formatPeriodDelta(comparison);
  const deltaColorClassName = getDeltaColorClassName(comparison.delta);

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
          <span className={cn("text-right font-semibold", deltaColorClassName)}>
            {deltaText.signedDelta} кг ({deltaText.percent})
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

