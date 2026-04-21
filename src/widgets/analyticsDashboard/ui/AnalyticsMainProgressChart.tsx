import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import type { TrendPoint } from "@/entities/analytics";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/ui/shadCNComponents/ui/chart";

const chartConfig = {
  tonnage: {
    label: "Объем",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

interface AnalyticsMainProgressChartProps {
  trends: TrendPoint[];
}

export const AnalyticsMainProgressChart = ({
  trends,
}: AnalyticsMainProgressChartProps) => {
  return (
    <div className="mt-4">
      {/* <AnalyticsSectionTitle subtitle="Динамика объема по тренировочным дням">
        Прогресс
      </AnalyticsSectionTitle> */}
      <ChartContainer config={chartConfig} className="h-44 w-full sm:h-56">
        <AreaChart data={trends} margin={{ left: 8, right: 8 }}>
          <defs>
            <linearGradient id="analytics-tonnage" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-tonnage)"
                stopOpacity={0.42}
              />
              <stop
                offset="95%"
                stopColor="var(--color-tonnage)"
                stopOpacity={0.06}
              />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeOpacity={0.12} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            minTickGap={24}
            tickMargin={8}
            tickFormatter={(value) => value.slice(0, 5)}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="line" />}
          />
          <Area
            type="monotone"
            dataKey="tonnage"
            stroke="var(--color-tonnage)"
            strokeWidth={2}
            fill="url(#analytics-tonnage)"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
};
