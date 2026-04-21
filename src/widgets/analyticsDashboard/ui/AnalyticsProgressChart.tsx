import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import type { TrendPoint } from "@/entities/analytics";
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

interface AnalyticsProgressChartProps {
  trends: TrendPoint[];
}

const chartConfig = {
  tonnage: {
    label: "Объем (кг)",
    color: "var(--color-chart-1)",
  },
  totalReps: {
    label: "Повторы",
    color: "var(--color-chart-2)",
  },
} satisfies ChartConfig;

export const AnalyticsProgressChart = ({ trends }: AnalyticsProgressChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Тренды нагрузки</CardTitle>
        <CardDescription>
          Динамика объема и повторений по выбранному периоду
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pb-3 sm:px-6 sm:pb-6">
        <ChartContainer
          config={chartConfig}
          className="h-56 w-full aspect-auto sm:h-72 sm:aspect-video"
        >
          <LineChart data={trends} margin={{ left: 12, right: 12 }}>
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
              dataKey="tonnage"
              type="monotone"
              stroke="var(--color-tonnage)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="totalReps"
              type="monotone"
              stroke="var(--color-totalReps)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

