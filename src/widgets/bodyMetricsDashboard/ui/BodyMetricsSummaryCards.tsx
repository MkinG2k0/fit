import type { BodyMetricTrendSummary } from "@/entities/bodyMetrics";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/shadCNComponents/ui/card";
import { cn } from "@/shared/ui/lib/utils";

interface BodyMetricsSummaryCardsProps {
  summary: BodyMetricTrendSummary[];
  className?: string;
}

const formatSignedDelta = (value: number) => {
  if (value === 0) {
    return "0";
  }
  return value > 0 ? `+${value.toFixed(1)}` : value.toFixed(1);
};

const getTrendTextClass = (trend: BodyMetricTrendSummary["trend"]) => {
  if (trend === "up") {
    return "text-emerald-600 dark:text-emerald-400";
  }
  if (trend === "down") {
    return "text-blue-600 dark:text-blue-400";
  }
  return "text-muted-foreground";
};

const getTrendLabel = (trendSummary: BodyMetricTrendSummary) => {
  if (trendSummary.delta === null) {
    return "Недостаточно данных для сравнения";
  }

  if (trendSummary.delta === 0) {
    return "Без изменений";
  }

  return `${formatSignedDelta(trendSummary.delta)} ${trendSummary.unit} к прошлому замеру`;
};

const renderSummaryCard = (item: BodyMetricTrendSummary) => {
  return (
    <article
      key={item.key}
      className={cn("min-w-0 rounded-lg border border-border p-3")}
    >
      <p className="truncate text-sm text-muted-foreground">{item.label}</p>
      <p className="truncate text-lg font-semibold sm:text-xl">
        {item.currentValue === null ? "—" : `${item.currentValue.toFixed(1)} ${item.unit}`}
      </p>
      <p className={cn("break-words text-xs", getTrendTextClass(item.trend))}>
        {getTrendLabel(item)}
      </p>
    </article>
  );
};

export const BodyMetricsSummaryCards = ({
  summary,
  className,
}: BodyMetricsSummaryCardsProps) => {
  const visibleSummary = summary.filter((item) => item.currentValue !== null);

  return (
    <Card className={cn("gap-3 py-4", className)}>
      <CardHeader className="px-4">
        <CardTitle>Текущие показатели</CardTitle>
        <CardDescription>
          Последний замер и изменение относительно предыдущей записи
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4">
        {visibleSummary.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Нет данных для анализа. Добавьте первый замер через форму ниже.
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {visibleSummary.map(renderSummaryCard)}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
