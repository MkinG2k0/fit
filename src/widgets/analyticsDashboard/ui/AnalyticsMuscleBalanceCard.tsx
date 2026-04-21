import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import type { MuscleBalance } from "@/entities/analytics";
import { AnalyticsCard, AnalyticsSectionTitle } from "@/shared/ui/analytics";
import { ChartContainer, type ChartConfig } from "@/shared/ui/shadCNComponents/ui/chart";

interface AnalyticsMuscleBalanceCardProps {
  muscleBalance: MuscleBalance;
}

const chartConfig = {
  load: {
    label: "Нагрузка",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export const AnalyticsMuscleBalanceCard = ({
  muscleBalance,
}: AnalyticsMuscleBalanceCardProps) => {
  const radarData = muscleBalance.items.map((item) => ({
    muscle: item.muscle,
    load: Number(item.percent.toFixed(1)),
  }));

  return (
    <AnalyticsCard>
      <AnalyticsSectionTitle subtitle="Доля нагрузки по группам">
        Мышечный баланс
      </AnalyticsSectionTitle>
      <div className="grid gap-4 sm:grid-cols-[200px_1fr] sm:items-center">
        <ChartContainer config={chartConfig} className="mx-auto h-40 w-full max-w-[220px]">
          <RadarChart data={radarData}>
            <PolarGrid stroke="rgba(255,255,255,0.2)" />
            <PolarAngleAxis
              dataKey="muscle"
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            />
            <Radar
              dataKey="load"
              stroke="var(--color-load)"
              fill="var(--color-load)"
              fillOpacity={0.35}
            />
          </RadarChart>
        </ChartContainer>
        <div className="grid gap-2">
          {muscleBalance.items.map((item) => (
            <div key={item.muscle} className="grid grid-cols-[minmax(84px,1fr)_1fr_auto] items-center gap-2">
              <span className="text-xs text-muted-foreground">{item.muscle}</span>
              <div className="h-2 rounded-full bg-[rgba(255,255,255,0.08)]">
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{ width: `${Math.max(4, item.percent)}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-primary">
                {item.percent.toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </AnalyticsCard>
  );
};
