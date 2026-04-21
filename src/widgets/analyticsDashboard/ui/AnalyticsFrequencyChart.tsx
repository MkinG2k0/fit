import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis } from "recharts";
import type { PeriodComparison, TrendPoint } from "@/entities/analytics";
import { formatTonnage } from "@/shared/lib";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/shadCNComponents/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/ui/shadCNComponents/ui/chart";
import { cn } from "@/shared/ui/lib/utils";

interface AnalyticsFrequencyChartProps {
  trends: TrendPoint[];
  comparison: PeriodComparison;
}

const chartConfig = {
  maxWeight: {
    label: "Максимальный вес",
    color: "var(--color-chart-4)",
  },
  tonnage: {
    label: "Объем",
    color: "var(--color-chart-1)",
  },
} satisfies ChartConfig;

export const AnalyticsFrequencyChart = ({
  trends,
  comparison,
}: AnalyticsFrequencyChartProps) => {
  const trainingDays = trends.length;
  const totalTonnage = trends.reduce((acc, point) => acc + point.tonnage, 0);
  const avgTonnage = trainingDays > 0 ? totalTonnage / trainingDays : 0;
  const maxWeight = trends.reduce(
    (acc, point) => Math.max(acc, point.maxWeight),
    0,
  );
  const deltaText =
    comparison.deltaPercent === null
      ? "новый период"
      : `${comparison.deltaPercent > 0 ? "+" : ""}${comparison.deltaPercent.toFixed(1)}%`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Прогресс нагрузки</CardTitle>
        <CardDescription>
          Максимальный вес и объем по тренировочным дням
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 px-2 pb-3 sm:px-6 sm:pb-6">
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="rounded-md border p-2">
            <div className="text-xs text-muted-foreground">Тренировок</div>
            <div className="text-lg font-semibold">{trainingDays}</div>
          </div>
          <div className="rounded-md border p-2">
            <div className="text-xs text-muted-foreground">Средний объем</div>
            <div className="text-lg font-semibold">{formatTonnage(avgTonnage)}</div>
          </div>
          <div className="rounded-md border p-2">
            <div className="text-xs text-muted-foreground">Изм. к прошлому</div>
            <div
              className={cn(
                "text-lg font-semibold",
                comparison.delta > 0
                  ? "text-primary"
                  : comparison.delta < 0
                    ? "text-destructive"
                    : "text-muted-foreground",
              )}
            >
              {deltaText}
            </div>
          </div>
        </div>

        <div className="rounded-md border p-2">
          <div className="mb-1 text-xs text-muted-foreground">
            Максимальный вес: {maxWeight.toFixed(0)} кг
          </div>
          <ChartContainer config={chartConfig} className="h-40 w-full aspect-auto">
            <LineChart data={trends} margin={{ left: 8, right: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={24}
                tickFormatter={(value) => value.slice(0, 5)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Line
                dataKey="maxWeight"
                type="monotone"
                stroke="var(--color-maxWeight)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </div>

        <div className="rounded-md border p-2">
          <div className="mb-1 text-xs text-muted-foreground">Объем по датам</div>
          <ChartContainer config={chartConfig} className="h-40 w-full aspect-auto">
            <BarChart data={trends} margin={{ left: 8, right: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={24}
                tickFormatter={(value) => value.slice(0, 5)}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar dataKey="tonnage" fill="var(--color-tonnage)" radius={4} />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

