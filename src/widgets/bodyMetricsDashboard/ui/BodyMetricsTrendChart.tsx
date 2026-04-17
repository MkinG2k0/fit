import { useEffect, useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import {
  type BodyMetricDefinition,
  type BodyMetricsEntry,
} from "@/entities/bodyMetrics";
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
import { MultiSelect } from "@/shared/ui/shadCNComponents/ui/multi-select";
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

const formatDateLabel = (date: string) => {
  const dateChunk = date.includes("T") ? date.split("T")[0] : date;
  const [year, month, day] = dateChunk.split("-");
  if (!year || !month || !day) {
    return date;
  }
  return `${day}.${month}`;
};

const parseDate = (date: string) => {
  const parsed = Date.parse(date);
  return Number.isFinite(parsed) ? parsed : 0;
};

const buildChartPoints = (
  entries: BodyMetricsEntry[],
  metricDefinitions: BodyMetricDefinition[],
) => {
  const lastKnownValues: Record<string, number | undefined> = {};

  return [...entries]
    .sort((leftEntry, rightEntry) => {
      const recordedDiff =
        parseDate(leftEntry.recordedAt) - parseDate(rightEntry.recordedAt);
      if (recordedDiff !== 0) {
        return recordedDiff;
      }
      return parseDate(leftEntry.createdAt) - parseDate(rightEntry.createdAt);
    })
    .map((entry) => {
      const point: BodyMetricChartPoint = {
        date: entry.recordedAt,
      };
      metricDefinitions.forEach((definition) => {
        const entryValue = entry.measurements[definition.key];
        if (typeof entryValue === "number") {
          lastKnownValues[definition.key] = entryValue;
        }
        point[definition.key] = lastKnownValues[definition.key];
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
  const [selectedMetricKeys, setSelectedMetricKeys] = useState<string[]>([]);

  useEffect(() => {
    setSelectedMetricKeys((prevState) => {
      const availableMetricKeys = metricDefinitions.map((definition) => definition.key);
      const preservedSelection = prevState.filter((metricKey) =>
        availableMetricKeys.includes(metricKey),
      );
      if (preservedSelection.length > 0) {
        return preservedSelection;
      }
      return availableMetricKeys;
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
  const metricOptions = useMemo(
    () =>
      metricDefinitions.map((definition) => ({
        value: definition.key,
        label: definition.label,
      })),
    [metricDefinitions],
  );
  const activeDefinitions = useMemo(
    () => metricDefinitions.filter((item) => selectedMetricKeys.includes(item.key)),
    [selectedMetricKeys, metricDefinitions],
  );

  const renderActiveLine = (definition: BodyMetricDefinition) => {
    const color = metricColorMap[definition.key];
    return (
      <Line
        key={definition.key}
        dataKey={definition.key}
        type="monotone"
        stroke={color}
        strokeWidth={2}
        dot={{ r: 3, fill: color, stroke: color }}
        activeDot={{ r: 5, fill: color, stroke: color }}
        connectNulls
      />
    );
  };

  return (
    <Card className={cn("gap-3 py-4", className)}>
      <CardHeader className="px-3 sm:px-4">
        <CardTitle>График изменения параметров</CardTitle>
        <CardDescription>Все параметры на одном графике с возможностью скрытия</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 px-3 sm:px-4">
        <MultiSelect
          options={metricOptions}
          selectedValues={selectedMetricKeys}
          placeholder="Выберите параметры"
          searchPlaceholder="Найти параметр..."
          emptyText="Параметры не найдены"
          onSelectedValuesChange={setSelectedMetricKeys}
        />

        {chartPoints.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Добавьте минимум одну запись, чтобы построить график изменений.
          </p>
        ) : activeDefinitions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Включите хотя бы один параметр, чтобы увидеть линии на графике.
          </p>
        ) : (
          <ChartContainer config={chartConfig} className="h-44 w-full sm:h-72">
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
