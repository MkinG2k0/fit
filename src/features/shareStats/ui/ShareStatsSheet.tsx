import { useEffect, useMemo, useRef, useState } from "react";
import type { AnalyticsPeriod } from "@/entities/analytics";
import type { CalendarDay } from "@/entities/calendarDay";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/ui/shadCNComponents/ui/drawer";
import { cn } from "@/shared/ui/lib/utils";
import { buildShareModel } from "../lib/buildShareModel";
import {
  listShareExerciseOptions,
  listShareWorkoutDateKeys,
} from "../lib/listShareOptions";
import { renderShareCardToPng } from "../lib/renderShareCardToPng";
import { sharePngFile } from "../lib/sharePngFile";
import {
  SHARE_PERIOD_LABELS,
  type ShareScope,
  type ShareSelection,
} from "../model/types";
import { ShareCard } from "./ShareCard";

interface ShareStatsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  days: Record<string, CalendarDay>;
  defaultPeriod: AnalyticsPeriod;
}

const SCOPE_OPTIONS: Array<{ value: ShareScope; label: string }> = [
  { value: "period", label: "Период" },
  { value: "exercise", label: "Упражнение" },
  { value: "workout", label: "Тренировка" },
];

const PERIOD_OPTIONS = Object.entries(SHARE_PERIOD_LABELS) as Array<
  [AnalyticsPeriod, string]
>;

export const ShareStatsSheet = ({
  open,
  onOpenChange,
  days,
  defaultPeriod,
}: ShareStatsSheetProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const exerciseOptions = useMemo(() => listShareExerciseOptions(days), [days]);
  const workoutDateKeys = useMemo(() => listShareWorkoutDateKeys(days), [days]);
  const [scope, setScope] = useState<ShareScope>("period");
  const [exerciseId, setExerciseId] = useState("");
  const [workoutDateKey, setWorkoutDateKey] = useState("");
  const [period, setPeriod] = useState<AnalyticsPeriod>(defaultPeriod);
  const [status, setStatus] = useState<{
    variant: "error";
    text: string;
  } | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setPeriod(defaultPeriod);
    setExerciseId(exerciseOptions[0]?.id ?? "");
    setWorkoutDateKey(workoutDateKeys[0] ?? "");
    setStatus(null);
  }, [defaultPeriod, exerciseOptions, open, workoutDateKeys]);

  const selection = useMemo<ShareSelection>(() => {
    if (scope === "exercise") {
      return { scope, exerciseId, period };
    }
    if (scope === "workout") {
      return { scope, dateKey: workoutDateKey };
    }
    return { scope, period };
  }, [exerciseId, period, scope, workoutDateKey]);

  const model = useMemo(
    () => buildShareModel(days, selection),
    [days, selection],
  );

  const handleScopeChange = (nextScope: ShareScope) => {
    setScope(nextScope);
    setStatus(null);
  };

  const handleShare = async () => {
    setStatus(null);
    setIsSharing(true);

    try {
      const node = cardRef.current;
      if (!node) {
        throw new Error("Карточка не готова.");
      }

      const blob = await renderShareCardToPng(node);
      const result = await sharePngFile(`fit-share-${Date.now()}.png`, blob);
      if (result === "native-cancelled" || result === "web-cancelled") {
        return;
      }
    } catch (error) {
      setStatus({
        variant: "error",
        text: error instanceof Error ? error.message : "Не удалось поделиться.",
      });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="mx-auto max-h-[92dvh] w-full max-w-2xl">
        <DrawerHeader className="text-left">
          <DrawerTitle className="text-xl">Поделиться прогрессом</DrawerTitle>
          <DrawerDescription>
            Выберите данные и создайте карточку для публикации.
          </DrawerDescription>
        </DrawerHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4">
          <div
            className="grid grid-cols-3 rounded-lg border border-border bg-muted/60 p-1"
            aria-label="Тип статистики"
          >
            {SCOPE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={scope === option.value}
                onClick={() => handleScopeChange(option.value)}
                className={cn(
                  "rounded-md px-2 py-2 text-xs font-semibold transition-colors sm:text-sm",
                  scope === option.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          {scope !== "workout" && (
            <div className="grid grid-cols-5 rounded-lg border border-border bg-muted/60 p-1">
              {PERIOD_OPTIONS.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={period === value}
                  onClick={() => {
                    setPeriod(value);
                    setStatus(null);
                  }}
                  className={cn(
                    "rounded-md px-1 py-2 text-xs font-semibold transition-colors",
                    period === value
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {scope === "exercise" && (
            <label className="grid gap-1.5 text-sm font-medium">
              Упражнение
              <select
                value={exerciseId}
                onChange={(event) => {
                  setExerciseId(event.target.value);
                  setStatus(null);
                }}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {exerciseOptions.length === 0 && (
                  <option value="">Нет упражнений</option>
                )}
                {exerciseOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name} · {option.category}
                  </option>
                ))}
              </select>
            </label>
          )}

          {scope === "workout" && (
            <label className="grid gap-1.5 text-sm font-medium">
              Тренировка
              <select
                value={workoutDateKey}
                onChange={(event) => {
                  setWorkoutDateKey(event.target.value);
                  setStatus(null);
                }}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {workoutDateKeys.length === 0 && (
                  <option value="">Нет тренировок</option>
                )}
                {workoutDateKeys.map((dateKey) => (
                  <option key={dateKey} value={dateKey}>
                    {dateKey}
                  </option>
                ))}
              </select>
            </label>
          )}

          <div className="mx-auto h-[50vh] max-h-[538px] w-full overflow-auto rounded-lg border border-border bg-muted/30">
            <div className="relative mx-auto h-[538px] w-[302px] overflow-hidden">
              <ShareCard
                model={model}
                className="absolute left-0 top-0 origin-top-left scale-[0.28]"
              />
            </div>
          </div>

          {status?.variant === "error" && (
            <p role="alert" className="text-sm text-destructive">
              {status.text}
            </p>
          )}
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none fixed left-[-10000px] top-0"
        >
          <ShareCard ref={cardRef} model={model} />
        </div>

        <DrawerFooter>
          <Button
            type="button"
            disabled={model.kind === "empty" || isSharing}
            onClick={() => void handleShare()}
          >
            {isSharing ? "Создаём изображение…" : "Поделиться"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isSharing}
            onClick={() => onOpenChange(false)}
          >
            Закрыть
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
