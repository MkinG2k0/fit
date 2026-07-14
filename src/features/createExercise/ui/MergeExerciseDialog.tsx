import { useEffect, useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  computeExerciseMergeStats,
  type ExerciseCategory,
  type ExerciseMergeStats,
} from "@/entities/exercise";
import { cn } from "@/shared/lib";
import { readAllTrainingDaysFromStorage } from "@/shared/lib/analyticsStorage";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/ui/shadCNComponents/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/shadCNComponents/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/shadCNComponents/ui/popover";

interface MergeCatalogOption {
  id: string;
  name: string;
  category: string;
}

interface MergeExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceExercise: { id: string; name: string };
  catalog: ExerciseCategory[];
  onConfirm: (targetId: string) => void;
}

const emptyStats = (): ExerciseMergeStats => ({
  totalReps: 0,
  sessionCount: 0,
  setCount: 0,
});

const formatStatsLine = (stats: ExerciseMergeStats) =>
  `${stats.totalReps} повт. · ${stats.sessionCount} дн. · ${stats.setCount} подх.`;

export const MergeExerciseDialog = ({
  open,
  onOpenChange,
  sourceExercise,
  catalog,
  onConfirm,
}: MergeExerciseDialogProps) => {
  const [targetId, setTargetId] = useState<string>("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [sourceStats, setSourceStats] = useState<ExerciseMergeStats>(emptyStats);
  const [targetStats, setTargetStats] = useState<ExerciseMergeStats>(emptyStats);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const catalogOptions = useMemo<MergeCatalogOption[]>(
    () =>
      catalog.flatMap((group) =>
        group.exercises
          .filter((exercise) => exercise.id !== sourceExercise.id)
          .map((exercise) => ({
            id: exercise.id,
            name: exercise.name,
            category: group.category,
          })),
      ),
    [catalog, sourceExercise.id],
  );

  const selectedTarget = catalogOptions.find(
    (option) => option.id === targetId,
  );

  useEffect(() => {
    if (!open) {
      setTargetId("");
      setPickerOpen(false);
      setSourceStats(emptyStats());
      setTargetStats(emptyStats());
      setIsConfirming(false);
      return;
    }

    let cancelled = false;
    const loadStats = async () => {
      setIsLoadingStats(true);
      try {
        const days = await readAllTrainingDaysFromStorage();
        if (cancelled) {
          return;
        }
        setSourceStats(computeExerciseMergeStats(days, sourceExercise.id));
        if (targetId) {
          setTargetStats(computeExerciseMergeStats(days, targetId));
        } else {
          setTargetStats(emptyStats());
        }
      } finally {
        if (!cancelled) {
          setIsLoadingStats(false);
        }
      }
    };

    void loadStats();
    return () => {
      cancelled = true;
    };
  }, [open, sourceExercise.id, targetId]);

  const canConfirm =
    Boolean(targetId) &&
    targetId !== sourceExercise.id &&
    !isConfirming &&
    !isLoadingStats;

  const handleConfirm = () => {
    if (!canConfirm) {
      return;
    }
    setIsConfirming(true);
    onConfirm(targetId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Смержить упражнение</DialogTitle>
          <DialogDescription>
            Данные «{sourceExercise.name}» перейдут к выбранному упражнению.
            Исходное будет удалено; название, фото и описание целевого не
            изменятся.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-md border border-border bg-muted/40 p-3">
            <p className="text-sm font-medium text-foreground">
              {sourceExercise.name}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {isLoadingStats
                ? "Считаем статистику…"
                : formatStatsLine(sourceStats)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Исходное</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              Объединить с
            </p>
            <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-between"
                  aria-expanded={pickerOpen}
                >
                  <span className="truncate text-left">
                    {selectedTarget
                      ? `${selectedTarget.name} (${selectedTarget.category})`
                      : "Выберите упражнение"}
                  </span>
                  <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[var(--radix-popover-trigger-width)] p-0"
                align="start"
              >
                <Command>
                  <CommandInput placeholder="Поиск…" />
                  <CommandList className="max-h-56 overflow-y-auto">
                    <CommandEmpty>Упражнения не найдены</CommandEmpty>
                    <CommandGroup>
                      {catalogOptions.map((option) => {
                        const isSelected = option.id === targetId;
                        return (
                          <CommandItem
                            key={option.id}
                            value={`${option.name} ${option.category}`}
                            onSelect={() => {
                              setTargetId(option.id);
                              setPickerOpen(false);
                            }}
                          >
                            <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                              <span className="truncate">
                                {option.name}
                                <span className="text-muted-foreground">
                                  {" "}
                                  · {option.category}
                                </span>
                              </span>
                              <Check
                                className={cn(
                                  "size-4 shrink-0",
                                  isSelected ? "text-primary" : "opacity-0",
                                )}
                              />
                            </span>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {selectedTarget && (
            <div className="rounded-md border border-border bg-muted/40 p-3">
              <p className="text-sm font-medium text-foreground">
                {selectedTarget.name}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {isLoadingStats
                  ? "Считаем статистику…"
                  : formatStatsLine(targetStats)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Целевое</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isConfirming}
          >
            Отмена
          </Button>
          <Button onClick={handleConfirm} disabled={!canConfirm}>
            Смержить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
