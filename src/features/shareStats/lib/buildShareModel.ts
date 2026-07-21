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

const formatSetsSummary = (
  sets: Array<{ weight: number; reps: number }>,
): string => {
  if (sets.length === 0) {
    return "0 подх.";
  }

  const [firstSet] = sets;
  const areSetsEqual = sets.every(
    (set) => set.reps === firstSet.reps && set.weight === firstSet.weight,
  );

  if (areSetsEqual) {
    return `${sets.length}x${firstSet.reps} @ ${firstSet.weight}кг`;
  }

  return `${sets.length} подх.`;
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
        name: exercise.name,
        setsSummary: formatSetsSummary(exercise.sets),
        tonnageKg,
      };
    })
    .filter((line): line is ShareWorkoutExerciseLine => line !== null);

const buildTopExercises = (
  sessions: TrainingSessionStat[],
): SharePeriodTopExercise[] => {
  const totalsById = new Map<string, SharePeriodTopExercise>();

  for (const session of sessions) {
    for (const exercise of session.exercises) {
      const current = totalsById.get(exercise.id);
      totalsById.set(exercise.id, {
        name: exercise.name,
        tonnageKg: (current?.tonnageKg ?? 0) + exercise.tonnage,
      });
    }
  }

  return [...totalsById.values()]
    .sort(
      (a, b) => b.tonnageKg - a.tonnageKg || a.name.localeCompare(b.name, "ru"),
    )
    .slice(0, 3);
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
      sparkline: exerciseSessions.map((session) => ({
        dateKey: session.dateKey,
        value: session.exercise.maxWeight,
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
  const streakDays = summary.frequency.currentStreakDays;

  return {
    kind: "period",
    periodLabel: SHARE_PERIOD_LABELS[selection.period],
    dateRangeLabel: formatDateRangeLabel(selection.period, baseDate),
    trainingDays: summary.frequency.trainingDays,
    tonnageKg: summary.volume.totalTonnage,
    streakDays: streakDays > 0 ? streakDays : null,
    topExercises: buildTopExercises(periodSessions),
  };
};
