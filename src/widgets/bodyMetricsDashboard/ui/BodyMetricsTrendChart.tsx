import { type MouseEvent, useEffect, useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import {
  type BodyMetricDefinition,
  type BodyMetricsEntry,
} from "@/entities/bodyMetrics";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
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

interface BodyMetricsTrendChartProps {
  entries: BodyMetricsEntry[];
  metricDefinitions: BodyMetricDefinition[];
  className?: string;
}

type BodyMetricChartPoint = Record<string, number | string | undefined> & {
  date: string;
};

const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];
const LINE_CHART_MARGIN = { left: 12, right: 12 };

const formatDateLabel = (date: string) => date.slice(0, 5);

const parseDate = (date: string) => {
  const parsed = Date.parse(date);
  return Number.isFinite(parsed) ? parsed : 0;
};

const buildChartPoints = (
  entries: BodyMetricsEntry[],
  metricDefinitions: BodyMetricDefinition[],
) => {
  return [...entries]
    .sort(
      (leftEntry, rightEntry) =>
        parseDate(leftEntry.recordedAt) - parseDate(rightEntry.recordedAt),
    )
    .map((entry) => {
      const point: BodyMetricChartPoint = { date: entry.recordedAt };
      metricDefinitions.forEach((definition) => {
        point[definition.key] = entry.measurements[definition.key];
      });
      return point;
    });
};

const toChartConfig = (metricDefinitions: BodyMetricDefinition[]) => {
  return metricDefinitions.reduce<ChartConfig>((accumulator, definition, index) => {
    accumulator[definition.key] = {
      label: definition.label,
      color: CHART_COLORS[index % CHART_COLORS.length],
    };
    return accumulator;
  }, {});
};

const toMetricColorMap = (metricDefinitions: BodyMetricDefinition[]) => {
  return metricDefinitions.reduce<Record<string, string>>((accumulator, definition, index) => {
    accumulator[definition.key] = CHART_COLORS[index % CHART_COLORS.length];
    return accumulator;
  }, {});
};

export const BodyMetricsTrendChart = ({
  entries,
  metricDefinitions,
  className,
}: BodyMetricsTrendChartProps) => {
  const [enabledMetrics, setEnabledMetrics] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setEnabledMetrics((prevState) => {
      return metricDefinitions.reduce<Record<string, boolean>>((accumulator, definition) => {
        accumulator[definition.key] = prevState[definition.key] ?? true;
        return accumulator;
      }, {});
    });
  }, [metricDefinitions]);

  const chartPoints = useMemo(
    () => buildChartPoints(entries, metricDefinitions),
    [entries, metricDefinitions],
  );
  const chartConfig = useMemo(
    () => toChartConfig(metricDefinitions),
    [metricDefinitions],
  );
  const metricColorMap = useMemo(
    () => toMetricColorMap(metricDefinitions),
    [metricDefinitions],
  );
  const activeDefinitions = useMemo(
    () => metricDefinitions.filter((item) => enabledMetrics[item.key]),
    [enabledMetrics, metricDefinitions],
  );

  const handleMetricToggle = (event: MouseEvent<HTMLButtonElement>) => {
    const { metricKey } = event.currentTarget.dataset;
    if (!metricKey) {
      return;
    }

    setEnabledMetrics((prevState) => ({
      ...prevState,
      [metricKey]: !prevState[metricKey],
    }));
  };

  const renderDefinitionToggle = (definition: BodyMetricDefinition) => {
    const isEnabled = enabledMetrics[definition.key];
    return (
      <Button
        key={definition.key}
        type="button"
        variant={isEnabled ? "default" : "outline"}
        size="sm"
        data-metric-key={definition.key}
        onClick={handleMetricToggle}
      >
        {definition.label}
      </Button>
    );
  };

  const renderActiveLine = (definition: BodyMetricDefinition) => {
    return (
      <Line
        key={definition.key}
        dataKey={definition.key}
        type="monotone"
        stroke={metricColorMap[definition.key]}
        strokeWidth={2}
        dot={false}
        connectNulls
      />
    );
  };

  return (
    <Card className={cn("gap-3 py-4", className)}>
      <CardHeader className="px-4">
        <CardTitle>График изменения параметров</CardTitle>
        <CardDescription>Все параметры на одном графике с возможностью скрытия</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 px-4">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {metricDefinitions.map(renderDefinitionToggle)}
        </div>

        {chartPoints.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Добавьте минимум одну запись, чтобы построить график изменений.
          </p>
        ) : activeDefinitions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Включите хотя бы один параметр, чтобы увидеть линии на графике.
          </p>
        ) : (
          <ChartContainer config={chartConfig} className="h-56 w-full sm:h-72">
            <LineChart data={chartPoints} margin={LINE_CHART_MARGIN}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={24}
                tickFormatter={formatDateLabel}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              {activeDefinitions.map(renderActiveLine)}
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};
