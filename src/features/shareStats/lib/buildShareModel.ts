import type { Dayjs } from "dayjs";
import "dayjs/locale/ru";
import {
  buildDashboardAnalytics,
  getPeriodDateRange,
  normalizeTrainingSessions,
  selectSessionsByPeriod,
  type AnalyticsPeriod,
} from "@/entities/analytics";
import { calculateSummaryMetrics } from "@/entities/analytics/lib/calculateSummaryMetrics";
import { parseDateKey } from "@/entities/analytics/lib/dateKey";
import type { TrainingSessionStat } from "@/entities/analytics/model/types";
import type { CalendarDay } from "@/entities/calendarDay";
import { calcSetVolumeKg } from "@/shared/lib/calcSetVolumeKg";
import {
  SHARE_PERIOD_LABELS,
  type ShareModel,
  type SharePeriodTopExercise,
  type ShareSelection,
  type ShareWorkoutExerciseLine,
} from "../model/types";

const EMPTY_MODEL: ShareModel = {
  kind: "empty",
  message: "Недостаточно данных",
};

const formatDateRangeLabel = (period: AnalyticsPeriod, baseDate?: Dayjs) => {
  const { start, end } = getPeriodDateRange(period, baseDate);
  return `${start.format("DD.MM.YYYY")} — ${end.format("DD.MM.YYYY")}`;
};

const formatWorkoutDateLabel = (dateKey: string) =>
  parseDateKey(dateKey)?.locale("ru").format("D MMMM YYYY") ?? dateKey;

const formatSetWeight = (weight: number): string =>
  weight.toLocaleString("ru-RU", { maximumFractionDigits: 1 });

const formatSetsSummary = (
  sets: Array<{ weight: number; reps: number }>,
): string => {
  if (sets.length === 0) {
    return "Нет подходов";
  }

  const loggedSets = sets.filter((set) => set.reps > 0 || set.weight > 0);
  if (loggedSets.length === 0) {
    return "Нет подходов";
  }

  const [firstSet] = loggedSets;
  const areSetsEqual = loggedSets.every(
    (set) => set.reps === firstSet.reps && set.weight === firstSet.weight,
  );

  if (areSetsEqual) {
    return `${loggedSets.length}×${firstSet.reps} @ ${formatSetWeight(firstSet.weight)} кг`;
  }

  return loggedSets
    .map((set) => `${formatSetWeight(set.weight)} кг × ${set.reps}`)
    .join(" · ");
};

const buildWorkoutLines = (day: CalendarDay): ShareWorkoutExerciseLine[] =>
  day.exercises
    .map((exercise) => {
      const tonnageKg = exercise.sets.reduce(
        (total, set) => total + calcSetVolumeKg(set.weight, set.reps),
        0,
      );
      const totalReps = exercise.sets.reduce(
        (total, set) => total + set.reps,
        0,
      );

      if (tonnageKg <= 0 && totalReps <= 0) {
        return null;
      }

      return {
        id: exercise.catalogExerciseId ?? exercise.id,
        name: exercise.name,
        setsSummary: formatSetsSummary(exercise.sets),
        tonnageKg,
      };
    })
    .filter((line): line is NonNullable<typeof line> => line !== null);

export interface SharePeriodExerciseOption {
  id: string;
  name: string;
  maxWeightFrom: number;
  maxWeightTo: number;
  delta: number;
}

const rankPeriodExercises = (
  sessions: TrainingSessionStat[],
): SharePeriodExerciseOption[] => {
  type ExerciseProgress = {
    name: string;
    firstMaxWeight: number;
    lastMaxWeight: number;
  };

  const byId = new Map<string, ExerciseProgress>();

  for (const session of sessions) {
    const dayAggregates = new Map<
      string,
      { name: string; maxWeight: number }
    >();

    for (const exercise of session.exercises) {
      const current = dayAggregates.get(exercise.id);
      if (!current) {
        dayAggregates.set(exercise.id, {
          name: exercise.name,
          maxWeight: exercise.maxWeight,
        });
        continue;
      }
      dayAggregates.set(exercise.id, {
        name: exercise.name,
        maxWeight: Math.max(current.maxWeight, exercise.maxWeight),
      });
    }

    for (const [id, dayExercise] of dayAggregates) {
      const current = byId.get(id);
      if (!current) {
        byId.set(id, {
          name: dayExercise.name,
          firstMaxWeight: dayExercise.maxWeight,
          lastMaxWeight: dayExercise.maxWeight,
        });
        continue;
      }

      byId.set(id, {
        ...current,
        lastMaxWeight: dayExercise.maxWeight,
      });
    }
  }

  return [...byId.entries()]
    .map(([id, exercise]) => ({
      id,
      name: exercise.name,
      maxWeightFrom: exercise.firstMaxWeight,
      maxWeightTo: exercise.lastMaxWeight,
      delta: exercise.lastMaxWeight - exercise.firstMaxWeight,
    }))
    .sort(
      (a, b) =>
        b.delta - a.delta ||
        b.maxWeightTo - a.maxWeightTo ||
        a.name.localeCompare(b.name, "ru"),
    );
};

/** Ranked exercises trained in the period (for multi-select defaults). */
export const listSharePeriodExercises = (
  days: Record<string, CalendarDay>,
  period: AnalyticsPeriod,
  baseDate?: Dayjs,
): SharePeriodExerciseOption[] => {
  const sessions = selectSessionsByPeriod(
    normalizeTrainingSessions(days, {
      period,
      exerciseId: "",
      category: "",
    }),
    period,
    baseDate,
  );
  return rankPeriodExercises(sessions);
};

const pickPeriodExercises = (
  ranked: SharePeriodExerciseOption[],
  exerciseIds: string[],
): SharePeriodTopExercise[] => {
  const selected = new Set(exerciseIds);
  return ranked
    .filter((exercise) => selected.has(exercise.id))
    .map(({ id, name, maxWeightFrom, maxWeightTo }) => ({
      id,
      name,
      maxWeightFrom,
      maxWeightTo,
    }));
};

export const buildShareModel = (
  days: Record<string, CalendarDay>,
  selection: ShareSelection,
  baseDate?: Dayjs,
): ShareModel => {
  const period = selection.scope === "workout" ? "365d" : selection.period;
  const sessions = normalizeTrainingSessions(days, {
    period,
    exerciseId: "",
    category: "",
  });

  if (selection.scope === "exercise") {
    const exerciseSessions = selectSessionsByPeriod(
      sessions,
      selection.period,
      baseDate,
    ).flatMap((session) => {
      const [firstExercise, ...duplicateExercises] = session.exercises.filter(
        (item) => item.id === selection.exerciseId,
      );
      if (!firstExercise) {
        return [];
      }

      const exercise = duplicateExercises.reduce(
        (aggregate, item) => ({
          ...aggregate,
          tonnage: aggregate.tonnage + item.tonnage,
          totalReps: aggregate.totalReps + item.totalReps,
          maxWeight: Math.max(aggregate.maxWeight, item.maxWeight),
        }),
        firstExercise,
      );

      return [{ dateKey: session.dateKey, exercise }];
    });

    if (exerciseSessions.length === 0) {
      return EMPTY_MODEL;
    }

    const firstSession = exerciseSessions[0];
    const lastSession = exerciseSessions[exerciseSessions.length - 1];
    const maxWeightValues = exerciseSessions.map(
      (session) => session.exercise.maxWeight,
    );
    const shouldUseTonnage =
      maxWeightValues.every((value) => value === 0) ||
      maxWeightValues.every((value) => value === maxWeightValues[0]);
    const sparklineMetric = shouldUseTonnage ? "tonnage" : "maxWeight";

    return {
      kind: "exercise",
      title: lastSession.exercise.name,
      category: lastSession.exercise.category,
      periodLabel: SHARE_PERIOD_LABELS[selection.period],
      dateRangeLabel: formatDateRangeLabel(selection.period, baseDate),
      maxWeightFrom:
        exerciseSessions.length > 1 ? firstSession.exercise.maxWeight : null,
      maxWeightTo: lastSession.exercise.maxWeight,
      tonnageKg: exerciseSessions.reduce(
        (total, session) => total + session.exercise.tonnage,
        0,
      ),
      sessionCount: exerciseSessions.length,
      sparklineMetric,
      sparkline: exerciseSessions.map((session) => ({
        dateKey: session.dateKey,
        value:
          sparklineMetric === "tonnage"
            ? session.exercise.tonnage
            : session.exercise.maxWeight,
      })),
    };
  }

  if (selection.scope === "workout") {
    const session = sessions.find((item) => item.dateKey === selection.dateKey);
    const day = days[selection.dateKey];

    if (!session || !day) {
      return EMPTY_MODEL;
    }

    const exercises = buildWorkoutLines(day);
    if (exercises.length === 0) {
      return EMPTY_MODEL;
    }

    return {
      kind: "workout",
      dateKey: selection.dateKey,
      dateLabel: formatWorkoutDateLabel(selection.dateKey),
      exercises,
      tonnageKg: exercises.reduce(
        (total, exercise) => total + exercise.tonnageKg,
        0,
      ),
      exerciseCount: exercises.length,
    };
  }

  const periodSessions = selectSessionsByPeriod(
    sessions,
    selection.period,
    baseDate,
  );
  if (periodSessions.length === 0) {
    return EMPTY_MODEL;
  }

  const dashboard = buildDashboardAnalytics(days, {
    period: selection.period,
    exerciseId: "",
    category: "",
  });
  const summary = baseDate
    ? calculateSummaryMetrics(periodSessions)
    : dashboard.summary;
  const rankedExercises = rankPeriodExercises(periodSessions);

  return {
    kind: "period",
    periodLabel: SHARE_PERIOD_LABELS[selection.period],
    dateRangeLabel: formatDateRangeLabel(selection.period, baseDate),
    trainingDays: summary.frequency.trainingDays,
    tonnageKg: summary.volume.totalTonnage,
    topExercises: pickPeriodExercises(rankedExercises, selection.exerciseIds),
  };
};
