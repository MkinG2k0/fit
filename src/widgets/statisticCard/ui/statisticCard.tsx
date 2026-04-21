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
import { readAllTrainingDaysFromStorage } from "@/shared/lib/analyticsStorage";
import { calculateTonnageForExercise } from "../lib/calculateTonnage";
import { TonnageChart } from "./TonnageChart";

interface StatisticCardProps {
  exerciseName: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
}

export const StatisticCard = ({
  exerciseName,
  open,
  onOpenChange,
  showTrigger = true,
}: StatisticCardProps) => {
  const [internalDialogOpen, setInternalDialogOpen] = useState(false);
  const [chartData, setChartData] = useState<
    ReturnType<typeof calculateTonnageForExercise>
  >([]);
  const isControlled = typeof open === "boolean";
  const dialogOpen = isControlled ? open : internalDialogOpen;

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!isControlled) {
      setInternalDialogOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  useEffect(() => {
    let isDisposed = false;

    const loadChartData = async () => {
      if (!dialogOpen) {
        if (!isDisposed) {
          setChartData([]);
        }
        return;
      }

      const allTrainingDays = await readAllTrainingDaysFromStorage();
      if (!isDisposed) {
        setChartData(calculateTonnageForExercise(allTrainingDays, exerciseName));
      }
    };

    void loadChartData();

    return () => {
      isDisposed = true;
    };
  }, [dialogOpen, exerciseName]);

  return (
    <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
      <form>
        {showTrigger && (
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <ChartColumnBig />
            </Button>
          </DialogTrigger>
        )}
        <DialogContent className="sm:max-w-lg">
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
