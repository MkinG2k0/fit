import { DialogTrigger } from "@radix-ui/react-dialog";
import { ChartColumnBig } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/shadCNComponents/ui/dialog";
import type { CalendarDay } from "@/entities/calendarDay";
import { getAllExercisesFromStorage } from "@/shared/lib/storage";
import { calculateTonnageForExercise } from "../lib/calculateTonnage";
import { TonnageChart } from "./TonnageChart";

export const StatisticCard = ({ exerciseName }: { exerciseName: string }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [exerciseObj, setExerciseObj] = useState<Record<string, CalendarDay>>(
    {},
  );
  const [chartData, setChartData] = useState<
    { date: string; tonnage: number }[]
  >([]);

  useEffect(() => {
    if (dialogOpen) {
      const allExercises: Record<string, CalendarDay> =
        getAllExercisesFromStorage().reduce((result, currentValue) => {
          return {
            ...result,
            ...currentValue,
          };
        }, {});
      setExerciseObj(allExercises);
    }
  }, [dialogOpen]);

  useEffect(() => {
    if (Object.keys(exerciseObj).length > 0) {
      const tonnageData = calculateTonnageForExercise(exerciseObj, exerciseName);
      setChartData(tonnageData);
    }
  }, [exerciseObj, exerciseName]);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <form>
        <DialogTrigger asChild>
          <Button variant="outline">
            <ChartColumnBig />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Статистика упражнения</DialogTitle>
            <DialogDescription>
              Просмотр динамики тоннажа для упражнения {exerciseName}
            </DialogDescription>
          </DialogHeader>
          <TonnageChart exerciseName={exerciseName} data={chartData} />
        </DialogContent>
      </form>
    </Dialog>
  );
};
