import type { ActivityHeatmap } from "@/entities/analytics";
import { AnalyticsCard, AnalyticsSectionTitle } from "@/shared/ui/analytics";
import { cn } from "@/shared/ui/lib/utils";

interface AnalyticsActivityHeatmapCardProps {
  heatmap: ActivityHeatmap;
}

const DAY_ENTRIES = [
  { id: "mon", label: "Пн", dayIndex: 0 },
  { id: "tue", label: "Вт", dayIndex: 1 },
  { id: "wed", label: "Ср", dayIndex: 2 },
  { id: "thu", label: "Чт", dayIndex: 3 },
  { id: "fri", label: "Пт", dayIndex: 4 },
  { id: "sat", label: "Сб", dayIndex: 5 },
  { id: "sun", label: "Вс", dayIndex: 6 },
];

const intensityClassNames = [
  "bg-[rgba(255,255,255,0.06)]",
  "bg-[rgba(245,130,32,0.24)]",
  "bg-[rgba(245,130,32,0.4)]",
  "bg-[rgba(245,130,32,0.58)]",
  "bg-[rgba(245,130,32,0.78)]",
];

export const AnalyticsActivityHeatmapCard = ({
  heatmap,
}: AnalyticsActivityHeatmapCardProps) => {
  const weekIndexes = Array.from({ length: heatmap.weeks }, (_, weekIndex) => weekIndex);
  const cellsByPosition = new Map(
    heatmap.cells.map((cell) => [`${cell.weekIndex}-${cell.dayIndex}`, cell]),
  );

  return (
    <AnalyticsCard>
      <AnalyticsSectionTitle subtitle="Распределение тренировок по дням">
        Активность
      </AnalyticsSectionTitle>
      <div className="grid grid-cols-[auto_1fr] gap-2">
        <div className="grid gap-1.5 pt-0.5">
          {DAY_ENTRIES.map((day) => (
            <span
              key={day.id}
              className="h-4 text-[10px] text-muted-foreground"
            >
              {day.label}
            </span>
          ))}
        </div>
        <div
          className="grid gap-1.5"
          style={{ gridTemplateColumns: `repeat(${heatmap.weeks}, minmax(0, 1fr))` }}
        >
          {weekIndexes.map((weekIndex) => (
            <div key={`week-${weekIndex}`} className="grid gap-1.5">
              {DAY_ENTRIES.map((day) => {
                const cell = cellsByPosition.get(`${weekIndex}-${day.dayIndex}`);
                const intensity = cell?.intensity ?? 0;
                return (
                  <div
                    key={`${weekIndex}-${day.id}`}
                    title={`${cell?.dateKey ?? "-"} • ${cell?.sessions ?? 0} сессий`}
                    className={cn("h-4 rounded-[4px]", intensityClassNames[intensity])}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </AnalyticsCard>
  );
};
