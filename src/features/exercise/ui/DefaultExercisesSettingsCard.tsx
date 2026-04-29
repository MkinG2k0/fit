import { useMemo, useState } from "react";
import { RefreshCcw } from "lucide-react";
import { useExerciseStore } from "@/entities/exercise";
import { cn } from "@/shared/lib/classMerge";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/shadCNComponents/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/shadCNComponents/ui/dialog";

interface DefaultExercisesSettingsCardProps {
  className?: string;
}

export const DefaultExercisesSettingsCard = ({
  className,
}: DefaultExercisesSettingsCardProps) => {
  const syncDefaultExercises = useExerciseStore((s) => s.syncDefaultExercises);
  const [syncResult, setSyncResult] = useState<{
    replacedExerciseNames: string[];
    addedExerciseNames: string[];
  } | null>(null);
  const [resultOpen, setResultOpen] = useState(false);

  const replacedCount = syncResult?.replacedExerciseNames.length ?? 0;
  const addedCount = syncResult?.addedExerciseNames.length ?? 0;

  const hasChanges = useMemo(
    () => replacedCount > 0 || addedCount > 0,
    [addedCount, replacedCount],
  );

  const handleSyncClick = () => {
    const result = syncDefaultExercises();
    setSyncResult(result);
    setResultOpen(true);
  };

  return (
    <>
      <Card className={cn("gap-3 py-4", className)}>
        <CardHeader className="px-4">
          <CardTitle className="flex items-center gap-2">
            <RefreshCcw className="size-5 text-muted-foreground" aria-hidden />
            Обновить упражнения
          </CardTitle>
          <CardDescription>
            Подтянуть дефолтный каталог упражнений: недостающие добавятся, а
            совпадающие по названию обновятся до дефолтной версии.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4">
          <Button type="button" variant="secondary" onClick={handleSyncClick}>
            Обновить упражнения
          </Button>
        </CardContent>
      </Card>

      <Dialog open={resultOpen} onOpenChange={setResultOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Результат обновления упражнений</DialogTitle>
            <DialogDescription>
              {hasChanges
                ? `Заменено: ${replacedCount}, добавлено: ${addedCount}.`
                : "Изменений не найдено: текущий каталог уже совпадает с дефолтным."}
            </DialogDescription>
          </DialogHeader>

          {replacedCount > 0 ? (
            <div className="max-h-64 overflow-y-auto rounded-md border border-border p-3">
              <p className="mb-2 text-sm font-medium">Заменённые упражнения:</p>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                {syncResult?.replacedExerciseNames.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <DialogFooter>
            <Button type="button" onClick={() => setResultOpen(false)}>
              Понятно
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
