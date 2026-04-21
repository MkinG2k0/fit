import { useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import type { ExerciseTrendRow } from "@/entities/analytics";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/shadCNComponents/ui/dialog";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/ui/shadCNComponents/ui/chart";

interface AnalyticsExerciseDetailsDialogProps {
  row: ExerciseTrendRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const chartConfig = {
  tonnage: {
    label: "Тоннаж",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export const AnalyticsExerciseDetailsDialog = ({
  row,
  open,
  onOpenChange,
}: AnalyticsExerciseDetailsDialogProps) => {
  if (!row) {
    return null;
  }

  const chartData = row.trend.map((point) => ({
    dateKey: point.dateKey,
    dateLabel: point.dateKey.slice(0, 5),
    tonnage: point.tonnage,
  }));
  const peakDayTonnage = row.trend.reduce(
    (acc, point) => Math.max(acc, point.tonnage),
    0,
  );
  const activeDaysCount = row.trend.filter((point) => point.tonnage > 0).length;
  const averageTonnagePerSession =
    row.sessions > 0 ? row.tonnage / row.sessions : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{row.name}</DialogTitle>
          <DialogDescription>
            Детальная динамика тоннажа по выбранному периоду
          </DialogDescription>
        </DialogHeader>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <LineChart data={chartData} margin={{ left: 0, right: 0 }}>
            <CartesianGrid vertical={false} strokeOpacity={0.12} />
            <XAxis
              dataKey="dateLabel"
              tickLine={false}
              axisLine={false}
              minTickGap={18}
              tickMargin={8}
              padding={{ left: 0, right: 0 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={38}
              tickFormatter={(value) => `${(Number(value) / 1000).toFixed(1)}т`}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="line"
                  labelFormatter={(_, payload) =>
                    String(payload?.[0]?.payload?.dateKey ?? "")
                  }
                />
              }
            />
            <Line
              type="monotone"
              dataKey="tonnage"
              stroke="var(--color-tonnage)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ChartContainer>

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="flex  gap-2">
            <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 flex-auto">
              <p className="text-[11px] text-muted-foreground">Всего тоннаж</p>
              <p className="text-base font-semibold text-primary">
                {(row.tonnage / 1000).toFixed(1)}т
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 flex-auto">
              <p className="text-[11px] text-muted-foreground">Тренировок</p>
              <p className="text-base font-semibold text-foreground">
                {row.sessions}
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
            <p className="text-[11px] text-muted-foreground">
              Средний тоннаж за тренировку
            </p>
            <p className="text-base font-semibold text-foreground">
              {(averageTonnagePerSession / 1000).toFixed(1)}т
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
            <p className="text-[11px] text-muted-foreground">Пиковый день</p>
            <p className="text-base font-semibold text-foreground">
              {(peakDayTonnage / 1000).toFixed(1)}т
            </p>
            <p className="text-[11px] text-muted-foreground">
              {activeDaysCount} активных дней
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
