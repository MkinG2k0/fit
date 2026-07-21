import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis } from "recharts";
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
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/ui/shadCNComponents/ui/chart";
import type { TonnageData } from "../lib/calculateTonnage";

const chartConfig = {
  maxWeight: {
    label: "КГ",
    color: "var(--color-chart-1)",
  },
} satisfies ChartConfig;

interface MaxWeightChartProps {
  exerciseName: string;
  data: TonnageData[];
  highlightDateKey?: string;
}

export const MaxWeightChart = ({
  exerciseName,
  data,
  highlightDateKey,
}: MaxWeightChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Макс. вес в упражнении: {exerciseName}</CardTitle>
        <CardDescription>
          Максимальный рабочий вес по датам
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={data}
            margin={{
              top: 20,
            }}
          >
            <CartesianGrid />
            <XAxis
              dataKey="date"
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => {
                const parts = value.split("-");
                return parts.length >= 2 ? `${parts[0]}-${parts[1]}` : value;
              }}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar dataKey="maxWeight" radius={4}>
              {data.map((entry) => (
                <Cell
                  key={entry.date}
                  fill={
                    entry.date === highlightDateKey
                      ? "var(--color-chart-2)"
                      : "var(--color-maxWeight)"
                  }
                />
              ))}
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
