import { DialogTrigger } from "@radix-ui/react-dialog";
import { ChartColumnBig } from "lucide-react";
import { useEffect, useState } from "react";
import {
  findCatalogExerciseByName,
  useExerciseStore,
} from "@/entities/exercise";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import {
  Dialog,
  DialogContent,
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
  const [activeTab, setActiveTab] = useState<"stats" | "info">("stats");
  const catalogExercises = useExerciseStore((state) => state.exercises);
  const exerciseInfo = findCatalogExerciseByName(
    catalogExercises,
    exerciseName,
  );
  const isControlled = typeof open === "boolean";
  const dialogOpen = isControlled ? open : internalDialogOpen;

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!isControlled) {
      setInternalDialogOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  useEffect(() => {
    if (!dialogOpen) {
      setActiveTab("stats");
    }
  }, [dialogOpen]);

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
        setChartData(
          calculateTonnageForExercise(allTrainingDays, exerciseName),
        );
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
        <DialogContent className="sm:max-w-lg h-[80dvh]">
          <div className="space-y-3 mt-6">
            <div className="grid grid-cols-2 gap-2 rounded-md border bg-muted p-1">
              <Button
                type="button"
                variant={activeTab === "stats" ? "default" : "ghost"}
                onClick={() => setActiveTab("stats")}
              >
                Статистика
              </Button>
              <Button
                type="button"
                variant={activeTab === "info" ? "default" : "ghost"}
                onClick={() => setActiveTab("info")}
              >
                Инфо
              </Button>
            </div>
            {activeTab === "stats" ? (
              <TonnageChart exerciseName={exerciseName} data={chartData} />
            ) : (
              <div className="space-y-3 rounded-md border bg-card p-4 text-sm text-card-foreground">
                {exerciseInfo?.photoDataUrls.length ? (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {exerciseInfo.photoDataUrls.map((photoDataUrl, index) => (
                      <img
                        key={photoDataUrl}
                        src={photoDataUrl}
                        alt={`Фото упражнения ${exerciseName} #${index + 1}`}
                        className="h-36 w-full rounded-md border object-cover"
                      />
                    ))}
                  </div>
                ) : null}
                {exerciseInfo?.description.trim() ? (
                  <p className="whitespace-pre-wrap wrap-break-word">
                    {exerciseInfo.description}
                  </p>
                ) : (
                  <p className="text-muted-foreground">
                    Описание пока не добавлено для этого упражнения.
                  </p>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </form>
    </Dialog>
  );
};
