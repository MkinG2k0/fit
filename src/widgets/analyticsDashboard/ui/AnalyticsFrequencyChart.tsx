import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
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

interface AnalyticsFrequencyChartProps {
  trends: TrendPoint[];
}

const chartConfig = {
  sessions: {
    label: "Подходы",
    color: "var(--color-chart-3)",
  },
  maxWeight: {
    label: "Максимальный вес",
    color: "var(--color-chart-4)",
  },
} satisfies ChartConfig;

const chartClassName = "h-56 w-full aspect-auto sm:h-72 sm:aspect-video";

export const AnalyticsFrequencyChart = ({
  trends,
}: AnalyticsFrequencyChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Частота и интенсивность</CardTitle>
        <CardDescription>
          Количество сессий по дням и пик рабочего веса
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pb-3 sm:px-6 sm:pb-6">
        <ChartContainer config={chartConfig} className={chartClassName}>
          <BarChart data={trends} margin={{ left: 12, right: 12 }}>
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
            <Bar dataKey="sessions" fill="var(--color-sessions)" radius={4} />
            <Bar dataKey="maxWeight" fill="var(--color-maxWeight)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

