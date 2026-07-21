import { useEffect, useMemo, useRef, useState } from "react";
import type { AnalyticsPeriod } from "@/entities/analytics";
import type { CalendarDay } from "@/entities/calendarDay";
import { parseDateKey } from "@/entities/analytics/lib/dateKey";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/ui/shadCNComponents/ui/drawer";
import { MultiSelect } from "@/shared/ui/shadCNComponents/ui/multi-select";
import { cn } from "@/shared/ui/lib/utils";
import {
  buildShareModel,
  listSharePeriodExercises,
} from "../lib/buildShareModel";
import {
  listShareExercisesForDate,
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

const DEFAULT_PERIOD_EXERCISE_COUNT = 5;

const formatShareDateLabel = (dateKey: string) => {
  const parsed = parseDateKey(dateKey);
  if (!parsed) {
    return dateKey;
  }
  return parsed.locale("ru").format("D MMMM YYYY");
};

const formatExerciseOptionLabel = (option: {
  name: string;
  category: string;
  maxWeight?: number;
}) => {
  const base = option.category
    ? `${option.name} · ${option.category}`
    : option.name;
  if (option.maxWeight === undefined || option.maxWeight <= 0) {
    return base;
  }
  return `${base} · ${option.maxWeight.toLocaleString("ru-RU", {
    maximumFractionDigits: 1,
  })} кг`;
};

const formatPeriodExerciseOptionLabel = (option: {
  name: string;
  maxWeightFrom: number;
  maxWeightTo: number;
}) => {
  const from = option.maxWeightFrom.toLocaleString("ru-RU", {
    maximumFractionDigits: 1,
  });
  const to = option.maxWeightTo.toLocaleString("ru-RU", {
    maximumFractionDigits: 1,
  });
  return `${option.name} · ${from} → ${to} кг`;
};

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
  const workoutDateKeys = useMemo(() => listShareWorkoutDateKeys(days), [days]);
  const [scope, setScope] = useState<ShareScope>("period");
  const [exerciseDateKey, setExerciseDateKey] = useState("");
  const [exerciseId, setExerciseId] = useState("");
  const [workoutDateKey, setWorkoutDateKey] = useState("");
  const [period, setPeriod] = useState<AnalyticsPeriod>(defaultPeriod);
  const [periodExerciseIds, setPeriodExerciseIds] = useState<string[]>([]);
  const [status, setStatus] = useState<{
    variant: "error";
    text: string;
  } | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  const exerciseOptions = useMemo(
    () => listShareExercisesForDate(days, exerciseDateKey),
    [days, exerciseDateKey],
  );

  const periodExerciseOptions = useMemo(
    () => listSharePeriodExercises(days, period),
    [days, period],
  );

  const periodMultiSelectOptions = useMemo(
    () =>
      periodExerciseOptions.map((option) => ({
        value: option.id,
        label: formatPeriodExerciseOptionLabel(option),
      })),
    [periodExerciseOptions],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    const initialDateKey = workoutDateKeys[0] ?? "";
    setPeriod(defaultPeriod);
    setExerciseDateKey(initialDateKey);
    setWorkoutDateKey(initialDateKey);
    setStatus(null);
  }, [defaultPeriod, open, workoutDateKeys]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const defaultIds = periodExerciseOptions
      .slice(0, DEFAULT_PERIOD_EXERCISE_COUNT)
      .map((option) => option.id);
    setPeriodExerciseIds(defaultIds);
  }, [open, period, periodExerciseOptions]);

  useEffect(() => {
    if (!open || scope !== "exercise") {
      return;
    }

    const stillValid = exerciseOptions.some((option) => option.id === exerciseId);
    if (!stillValid) {
      setExerciseId(exerciseOptions[0]?.id ?? "");
    }
  }, [exerciseId, exerciseOptions, open, scope]);

  const selection = useMemo<ShareSelection>(() => {
    if (scope === "exercise") {
      return { scope, exerciseId, period };
    }
    if (scope === "workout") {
      return { scope, dateKey: workoutDateKey };
    }
    return { scope, period, exerciseIds: periodExerciseIds };
  }, [exerciseId, period, periodExerciseIds, scope, workoutDateKey]);

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

          {scope === "period" && (
            <label className="grid gap-1.5 text-sm font-medium">
              Упражнения в списке
              <MultiSelect
                options={periodMultiSelectOptions}
                selectedValues={periodExerciseIds}
                placeholder="Выберите упражнения"
                emptyText="Нет упражнений за период"
                searchPlaceholder="Поиск упражнения..."
                onSelectedValuesChange={(values) => {
                  setPeriodExerciseIds(values);
                  setStatus(null);
                }}
              />
            </label>
          )}

          {scope === "exercise" && (
            <div className="grid gap-3">
              <label className="grid gap-1.5 text-sm font-medium">
                День тренировки
                <select
                  value={exerciseDateKey}
                  onChange={(event) => {
                    setExerciseDateKey(event.target.value);
                    setStatus(null);
                  }}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {workoutDateKeys.length === 0 && (
                    <option value="">Нет тренировок</option>
                  )}
                  {workoutDateKeys.map((dateKey) => (
                    <option key={dateKey} value={dateKey}>
                      {formatShareDateLabel(dateKey)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1.5 text-sm font-medium">
                Упражнение в этот день
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
                      {formatExerciseOptionLabel(option)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
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
                    {formatShareDateLabel(dateKey)}
                  </option>
                ))}
              </select>
            </label>
          )}

          <div className="mx-auto w-full overflow-hidden rounded-lg border border-border bg-muted/30 py-3">
            <div className="relative mx-auto h-[653px] w-[367px] overflow-hidden">
              <ShareCard
                model={model}
                className="absolute left-0 top-0 origin-top-left scale-[0.34]"
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
