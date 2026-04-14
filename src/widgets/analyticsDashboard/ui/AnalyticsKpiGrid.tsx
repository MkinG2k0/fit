import type { ExerciseAnalyticsSummary } from "@/entities/analytics";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/shadCNComponents/ui/card";

interface AnalyticsKpiGridProps {
  summary: ExerciseAnalyticsSummary;
}

interface KpiCard {
  id: string;
  title: string;
  value: string;
  description: string;
}

const toFixed = (value: number) => value.toFixed(0);

export const AnalyticsKpiGrid = ({ summary }: AnalyticsKpiGridProps) => {
  const cards: KpiCard[] = [
    {
      id: "total-tonnage",
      title: "Объем",
      value: `${toFixed(summary.volume.totalTonnage)} кг`,
      description: `Средний тоннаж за день: ${toFixed(
        summary.volume.averageTonnagePerTrainingDay,
      )} кг`,
    },
    {
      id: "max-weight",
      title: "Рабочий вес",
      value: `${toFixed(summary.weight.maxWeight)} кг`,
      description: `Средний рабочий вес: ${toFixed(
        summary.weight.averageWorkingWeight,
      )} кг`,
    },
    {
      id: "total-reps",
      title: "Повторения",
      value: `${toFixed(summary.reps.totalReps)}`,
      description: `Лучший сет: ${toFixed(summary.reps.bestSetReps)} повторений`,
    },
    {
      id: "frequency",
      title: "Частота",
      value: `${toFixed(summary.frequency.trainingDays)} тренировочных дней`,
      description: `Текущая серия: ${toFixed(summary.frequency.currentStreakDays)} дней`,
    },
  ];

  return (
    <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
      {cards.map((card) => (
        <Card key={card.id}>
          <CardHeader className="gap-1 pb-2">
            <CardDescription className="text-sm">{card.title}</CardDescription>
            <CardTitle className="text-xl leading-tight sm:text-2xl">
              {card.value}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-muted-foreground">
            {card.description}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

