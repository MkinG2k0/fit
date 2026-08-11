import { Trash2 } from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as motion from "motion/react-client";
import {
  type ChangeEvent,
  useCallback,
  useRef,
} from "react";
// AI features disabled
// import {
//   AI_FILL_HISTORY_MONTHS,
//   buildAiFillUserPrompt,
//   buildWorkoutLogText,
//   filterExerciseHistoryForAiFill,
//   formatCurrentSessionSets,
//   getAiFillSystemPrompt,
//   parseAiFillSets,
// } from "@/features/aiRecommendations";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import { useCalendarStore } from "@/entities/calendarDay";
import {
  FREE_WEIGHT_MEASUREMENT_TYPE,
  findCatalogExerciseById,
  isTimeMeasurementType,
  resolveWorkoutExerciseDisplayName,
  useCatalogNameById,
  useExerciseStore,
  type Exercise,
  type ExerciseSet,
} from "@/entities/exercise";
import { getPlanSetsForWeek, useLoadTableStore } from "@/entities/loadTable";
import { useUserStore } from "@/entities/user";
import {
  DEFAULT_REST_DURATION_SEC,
  ensureNotificationPermission,
  useRestTimerStore,
} from "@/features/timer";
import { StatisticCard } from "@/widgets/statisticCard";
// AI features disabled
// import {
//   AiGatewayError,
//   createChatCompletion,
// } from "@/shared/api";
// import { readAllTrainingDaysFromStorage } from "@/shared/lib/analyticsStorage";
import { cn } from "@/shared/lib/classMerge";
import { CustomButton } from "@/shared/ui";
import { getSetPrefillFromLastSession } from "@/shared/lib/findLastExerciseSession";
import { useLastExerciseSession } from "../lib/useLastExerciseSession";
import { useWorkoutCaloriesUiEnabled } from "../lib/useWorkoutCaloriesUiEnabled";
import {
  DEFAULT_SET_DURATION_SEC,
  getSetRowCalorieDisplay,
  getSetTimeRange,
} from "../calories";
import { ExerciseSetRow } from "./ExerciseSetRow";

interface ExerciseBodyProps {
  exercise: Exercise;
  onDeleteRequested: () => void;
}

const startRestBetweenSetsIfEnabled = () => {
  const { restBetweenSetsEnabled, restBetweenSetsSec } =
    useUserStore.getState();
  if (!restBetweenSetsEnabled) {
    return;
  }
  ensureNotificationPermission();
  useRestTimerStore
    .getState()
    .start(restBetweenSetsSec ?? DEFAULT_REST_DURATION_SEC);
};

export const ExerciseBody = ({
  exercise,
  onDeleteRequested,
}: ExerciseBodyProps) => {
  const lastSession = useLastExerciseSession(
    exercise.name,
    exercise.catalogExerciseId,
  );
  const catalogExercises = useExerciseStore((store) => store.exercises);
  const nameById = useCatalogNameById();
  const displayName = resolveWorkoutExerciseDisplayName(exercise, nameById);
  const catalogEntry = findCatalogExerciseById(
    catalogExercises,
    exercise.catalogExerciseId ?? "",
  );
  const measurementType =
    catalogEntry?.measurementType ?? FREE_WEIGHT_MEASUREMENT_TYPE;
  const measurementStep = catalogEntry?.measurementStep;
  const isTimeExercise = isTimeMeasurementType(measurementType);
  const selectedDate = useCalendarStore((store) => store.selectedDate);
  const isSelectedDateToday = selectedDate.isSame(new Date(), "day");
  const loadTableEntry = useLoadTableStore((state) => {
    const catalogExerciseId = exercise.catalogExerciseId?.trim();
    if (!catalogExerciseId) {
      return undefined;
    }
    return state.exercises.find(
      (item) => item.catalogExerciseId === catalogExerciseId,
    );
  });
  const loadTablePlanSummary = (() => {
    if (!isSelectedDateToday || !loadTableEntry) {
      return null;
    }
    const planSets = getPlanSetsForWeek(
      loadTableEntry.maxKg,
      loadTableEntry.currentWeek,
    );
    if (planSets.length === 0) {
      return null;
    }
    return {
      week: loadTableEntry.currentWeek,
      setsSummary: planSets
        .map((set) => `${set.reps}×${set.weight}`)
        .join(" · "),
    };
  })();
  const showCaloriesUi = useWorkoutCaloriesUiEnabled();
  const showLastSessionResult = useUserStore(
    (s) => s.exerciseCardShowLastSessionResult ?? true,
  );
  const lastSessionFillEnabled = useUserStore(
    (s) => s.lastSessionFillButtonEnabled ?? false,
  );
  // AI features disabled
  // const aiFillEnabled = useUserStore((s) => s.aiFillEnabled ?? false);

  const onChangeHandler = useCalendarStore((store) => store.setExerciseValues);
  const addSetToExercise = useCalendarStore((store) => store.addSetToExercise);
  const addSetGuardRef = useRef(false);
  // AI features disabled
  // const aiFillGuardRef = useRef(false);
  // const [aiFillLoading, setAiFillLoading] = useState(false);
  // const [aiFillError, setAiFillError] = useState<string | null>(null);
  // const [aiFillEmptyMessage, setAiFillEmptyMessage] = useState<string | null>(
  //   null,
  // );

  const inputHandler = useCallback(
    (
      event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
      set: ExerciseSet,
    ) => {
      const name = event.target.name;
      if (name !== "reps" && name !== "weight") {
        return;
      }
      onChangeHandler(event.target.value, name, set.id, exercise);
    },
    [exercise, onChangeHandler],
  );

  const handleAddSet = useCallback(async () => {
    if (addSetGuardRef.current) {
      return;
    }
    addSetGuardRef.current = true;
    try {
      const lastSet = exercise.sets.at(-1);
      const catalogExerciseId = exercise.catalogExerciseId?.trim();
      const loadTableEntryForAdd = catalogExerciseId
        ? useLoadTableStore
            .getState()
            .exercises.find((item) => item.catalogExerciseId === catalogExerciseId)
        : undefined;

      const lastSets =
        lastSessionFillEnabled && !loadTableEntryForAdd
          ? lastSession?.sets
          : undefined;
      const firstSet = exercise.sets[0];
      const onlyEmptyPlaceholder =
        exercise.sets.length === 1 &&
        firstSet != null &&
        firstSet.reps === 0 &&
        firstSet.weight === 0;

      // Пустой стартовый подход: заполняем из прошлой сессии вместо добавления нового.
      if (onlyEmptyPlaceholder && firstSet && lastSets?.length) {
        const prefill = getSetPrefillFromLastSession(lastSets, 0);
        onChangeHandler(String(prefill.reps), "reps", firstSet.id, exercise);
        onChangeHandler(String(prefill.weight), "weight", firstSet.id, exercise);
        startRestBetweenSetsIfEnabled();
        return;
      }

      const previousEnd =
        lastSet?.endTime !== undefined && lastSet.endTime !== ""
          ? new Date(lastSet.endTime)
          : null;

      const endNow = new Date();
      const defaultSec =
        useUserStore.getState().defaultSetDurationSec ??
        DEFAULT_SET_DURATION_SEC;
      const { startTime, endTime } = getSetTimeRange(
        previousEnd,
        defaultSec,
        endNow,
      );

      let weight = lastSet?.weight ?? 0;
      let reps = lastSet?.reps ?? 0;

      if (loadTableEntryForAdd) {
        const planSets = getPlanSetsForWeek(
          loadTableEntryForAdd.maxKg,
          loadTableEntryForAdd.currentWeek,
        );
        const planSet = planSets[exercise.sets.length] ?? planSets[0];
        if (planSet) {
          weight = planSet.weight;
          reps = planSet.reps;
        }
      } else if (lastSets?.length) {
        const nextSetIndex = exercise.sets.length;
        if (nextSetIndex < lastSets.length) {
          const prefill = getSetPrefillFromLastSession(lastSets, nextSetIndex);
          weight = prefill.weight;
          reps = prefill.reps;
        }
        // За пределами прошлой сессии оставляем weight/reps из текущего lastSet.
      }

      addSetToExercise(exercise, {
        weight,
        reps,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });
      startRestBetweenSetsIfEnabled();
    } finally {
      addSetGuardRef.current = false;
    }
  }, [
    addSetToExercise,
    exercise,
    lastSession?.sets,
    lastSessionFillEnabled,
    onChangeHandler,
  ]);

  // AI features disabled
  // const handleAiFill = useCallback(async () => {
  //   if (aiFillGuardRef.current || aiFillLoading) {
  //     return;
  //   }
  //   aiFillGuardRef.current = true;
  //   setAiFillLoading(true);
  //   setAiFillError(null);
  //   setAiFillEmptyMessage(null);
  //
  //   try {
  //     const alreadyDoneTodayText = formatCurrentSessionSets(exercise.sets);
  //     const allDays = await readAllTrainingDaysFromStorage();
  //     const filtered = filterExerciseHistoryForAiFill(
  //       allDays,
  //       {
  //         name: exercise.name,
  //         catalogExerciseId: exercise.catalogExerciseId,
  //       },
  //       AI_FILL_HISTORY_MONTHS,
  //     );
  //     const workoutLogText = buildWorkoutLogText(filtered);
  //
  //     if (!workoutLogText.trim() && !alreadyDoneTodayText) {
  //       setAiFillEmptyMessage(
  //         `Нет истории этого упражнения за последние ${AI_FILL_HISTORY_MONTHS} месяцев.`,
  //       );
  //       return;
  //     }
  //
  //     const response = await createChatCompletion([
  //       { role: "system", content: getAiFillSystemPrompt() },
  //       {
  //         role: "user",
  //         content: buildAiFillUserPrompt(
  //           exercise.name,
  //           workoutLogText,
  //           alreadyDoneTodayText,
  //         ),
  //       },
  //     ]);
  //
  //     const content = response.choices?.[0]?.message?.content;
  //     if (typeof content !== "string" || !content.trim()) {
  //       setAiFillError("Пустой ответ ИИ. Попробуйте ещё раз.");
  //       return;
  //     }
  //
  //     const recommendedSets = parseAiFillSets(content);
  //
  //     if (recommendedSets.length === 0) {
  //       setAiFillEmptyMessage(
  //         "ИИ не предложил новых подходов — по уже сделанному объёма достаточно.",
  //       );
  //       return;
  //     }
  //
  //     const defaultSec =
  //       useUserStore.getState().defaultSetDurationSec ??
  //       DEFAULT_SET_DURATION_SEC;
  //
  //     let previousEnd: Date | null = (() => {
  //       const lastSet = exercise.sets.at(-1);
  //       if (lastSet?.endTime !== undefined && lastSet.endTime !== "") {
  //         return new Date(lastSet.endTime);
  //       }
  //       return null;
  //     })();
  //
  //     for (const recommended of recommendedSets) {
  //       const endNow = previousEnd
  //         ? new Date(previousEnd.getTime() + defaultSec * 1000)
  //         : new Date();
  //       const { startTime, endTime } = getSetTimeRange(
  //         previousEnd,
  //         defaultSec,
  //         endNow,
  //       );
  //
  //       addSetToExercise(exercise, {
  //         weight: recommended.weight,
  //         reps: recommended.reps,
  //         startTime: startTime.toISOString(),
  //         endTime: endTime.toISOString(),
  //       });
  //
  //       previousEnd = endTime;
  //     }
  //
  //     if (recommendedSets.length > 0) {
  //       startRestBetweenSetsIfEnabled();
  //     }
  //   } catch (error) {
  //     if (error instanceof AiGatewayError) {
  //       setAiFillError(error.message);
  //     } else if (error instanceof Error && error.message.trim()) {
  //       setAiFillError(error.message);
  //     } else {
  //       setAiFillError("Не удалось заполнить подходы. Попробуйте ещё раз.");
  //     }
  //   } finally {
  //     setAiFillLoading(false);
  //     aiFillGuardRef.current = false;
  //   }
  // }, [addSetToExercise, aiFillLoading, exercise]);

  return (
    <div
      className="flex flex-col w-full gap-2 p-4 pt-0 max-w-[800px]"
      onClick={(event) => event.stopPropagation()}
    >
      {showLastSessionResult && lastSession !== null ? (
        <p
          className="w-full px-4 text-center text-xs leading-snug text-muted-foreground"
          role="note"
        >
          Прошлый раз, {lastSession.dateLabel}: {lastSession.setsSummary}
        </p>
      ) : null}

      {loadTablePlanSummary ? (
        <p
          className="w-full px-4 text-center text-xs leading-snug text-muted-foreground"
          role="note"
        >
          По таблице, неделя {loadTablePlanSummary.week}:{" "}
          {loadTablePlanSummary.setsSummary}
        </p>
      ) : null}

      {exercise.sets.length > 0 && (
        <div
          className={cn(
            "grid w-full items-center gap-2",
            isTimeExercise
              ? showCaloriesUi
                ? "grid-cols-[2.25rem_minmax(0,1fr)_3rem_2.25rem]"
                : "grid-cols-[2.25rem_minmax(0,1fr)_2.25rem]"
              : showCaloriesUi
                ? "grid-cols-[2.25rem_minmax(0,1fr)_minmax(0,1fr)_3rem_2.25rem]"
                : "grid-cols-[2.25rem_minmax(0,1fr)_minmax(0,1fr)_2.25rem]",
          )}
        >
          <span className="w-1" />
          {isTimeExercise ? (
            <span className="min-w-0 text-center text-xs font-semibold leading-tight text-muted-foreground">
              Время
            </span>
          ) : (
            <>
              <span className="min-w-0 text-center text-xs font-semibold leading-tight text-muted-foreground">
                {measurementType === "stack_lbs" ? "lbs" : "Кг"}
              </span>
              <span className="min-w-0 text-center text-xs font-semibold leading-tight text-muted-foreground">
                Повторений
              </span>
            </>
          )}
          {showCaloriesUi ? (
            <span className="min-w-0 text-center text-xs font-semibold leading-tight text-muted-foreground">
              Ккал
            </span>
          ) : null}
          <span className="w-1" />
        </div>
      )}

      <AnimatePresence>
        {exercise.sets.map((set, idx) => {
          const calorieDisplay = getSetRowCalorieDisplay(set);
          return (
            <motion.div
              key={set.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              style={{ overflow: "hidden" }}
            >
              <ExerciseSetRow
                exercise={exercise}
                set={set}
                index={idx}
                measurementType={measurementType}
                measurementStep={measurementStep}
                showKcalColumn={showCaloriesUi}
                calorieDisplay={calorieDisplay}
                onInputChange={inputHandler}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <StatisticCard
          exerciseName={displayName}
          catalogExerciseId={exercise.catalogExerciseId}
        />
        {/* AI features disabled
        {aiFillEnabled ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={aiFillLoading ? "Загрузка…" : "ИИ-заполнение"}
            disabled={aiFillLoading}
            onClick={() => {
              void handleAiFill();
            }}
          >
            {aiFillLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Sparkles />
            )}
          </Button>
        ) : null}
        */}
        <CustomButton classes={"flex-1"} buttonHandler={handleAddSet}>
          Добавить подход
        </CustomButton>
        <Button
          variant="outline"
          className="text-destructive"
          size="icon"
          onClick={onDeleteRequested}
        >
          <Trash2 />
        </Button>
      </div>
      {/* AI features disabled
      {aiFillEnabled && aiFillEmptyMessage ? (
        <p className="w-full text-xs text-muted-foreground" role="status">
          {aiFillEmptyMessage}
        </p>
      ) : null}
      {aiFillEnabled && aiFillError ? (
        <p className="w-full text-xs text-destructive" role="alert">
          {aiFillError}
        </p>
      ) : null}
      */}
    </div>
  );
};
