import type { ExerciseAnalyticsSummary } from "@/entities/analytics";
import { formatTonnage } from "@/shared/lib";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/ui/shadCNComponents/ui/card";

interface AnalyticsKpiGridProps {
  summary: ExerciseAnalyticsSummary;
}

interface KpiRow {
  id: string;
  metric: string;
  value: string;
  details: string;
}

const toFixed = (value: number) => value.toFixed(0);

export const AnalyticsKpiGrid = ({ summary }: AnalyticsKpiGridProps) => {
  const rows: KpiRow[] = [
    {
      id: "total-tonnage",
      metric: "Объем",
      value: formatTonnage(summary.volume.totalTonnage),
      details: `Средний тоннаж за день: ${formatTonnage(
        summary.volume.averageTonnagePerTrainingDay,
      )}`,
    },
    {
      id: "max-weight",
      metric: "Рабочий вес",
      value: `${toFixed(summary.weight.maxWeight)} кг`,
      details: `Средний рабочий вес: ${toFixed(
        summary.weight.averageWorkingWeight,
      )} кг`,
    },
    {
      id: "total-reps",
      metric: "Повторения",
      value: `${toFixed(summary.reps.totalReps)}`,
      details: `Лучший сет: ${toFixed(summary.reps.bestSetReps)} повторений`,
    },
    {
      id: "frequency",
      metric: "Частота",
      value: `${toFixed(summary.frequency.trainingDays)} тренировочных дней`,
      details: `Текущая серия: ${toFixed(summary.frequency.currentStreakDays)} дней`,
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Ключевые показатели</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto px-0">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="px-4 py-2 font-medium">Показатель</th>
              <th className="px-4 py-2 font-medium">Значение</th>
              <th className="px-4 py-2 font-medium">Детали</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b last:border-b-0">
                <td className="px-4 py-2 font-medium">{row.metric}</td>
                <td className="px-4 py-2 font-semibold">{row.value}</td>
                <td className="px-4 py-2 text-muted-foreground">{row.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};

