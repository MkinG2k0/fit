import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from "recharts";
import type { HealthDailyPoint } from "@/entities/health";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/shadCNComponents/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/ui/shadCNComponents/ui/chart";

const chartConfig = {
  steps: {
    label: "Шаги",
    color: "var(--color-chart-1)",
  },
  calories: {
    label: "Ккал (активные)",
    color: "var(--color-chart-2)",
  },
} satisfies ChartConfig;

interface HealthMetricsChartProps {
  data: HealthDailyPoint[];
}

const chartMargins = { top: 8, right: 12, left: 4, bottom: 8 };

export const HealthMetricsChart = ({ data }: HealthMetricsChartProps) => {
  return (
    <Card className="min-w-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">По датам</CardTitle>
        <CardDescription>
          Шаги (столбцы) и активные калории (линия) за последние 14 дней
        </CardDescription>
      </CardHeader>
      <CardContent className="min-w-0 px-2 sm:px-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-[4/3] min-h-[280px] w-full min-w-0 max-w-full sm:aspect-video sm:min-h-[300px]"
        >
          <ComposedChart accessibilityLayer data={data} margin={chartMargins}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={6}
              angle={-40}
              textAnchor="end"
              height={56}
              interval={0}
              tick={{ fontSize: 10 }}
            />
            <YAxis
              yAxisId="left"
              tickLine={false}
              axisLine={false}
              width={40}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickLine={false}
              axisLine={false}
              width={36}
              tick={{ fontSize: 11 }}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              yAxisId="left"
              dataKey="steps"
              fill="var(--color-steps)"
              radius={[3, 3, 0, 0]}
              maxBarSize={28}
            />
            <Line
              yAxisId="right"
              dataKey="calories"
              type="monotone"
              stroke="var(--color-calories)"
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
