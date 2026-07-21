import type { AnalyticsPeriod } from "@/entities/analytics";

export type ShareScope = "exercise" | "workout" | "period";

export type ShareSelection =
  | { scope: "exercise"; exerciseId: string; period: AnalyticsPeriod }
  | { scope: "workout"; dateKey: string }
  | { scope: "period"; period: AnalyticsPeriod; exerciseIds: string[] };

export interface ShareSparkPoint {
  dateKey: string;
  value: number;
}

export interface ShareExerciseModel {
  kind: "exercise";
  title: string;
  category: string;
  periodLabel: string;
  dateRangeLabel: string;
  maxWeightFrom: number | null;
  maxWeightTo: number;
  tonnageKg: number;
  sessionCount: number;
  sparklineMetric: "maxWeight" | "tonnage";
  sparkline: ShareSparkPoint[];
}

export interface ShareWorkoutExerciseLine {
  id?: string;
  name: string;
  setsSummary: string;
  tonnageKg: number;
}

export interface ShareWorkoutModel {
  kind: "workout";
  dateKey: string;
  dateLabel: string;
  exercises: ShareWorkoutExerciseLine[];
  tonnageKg: number;
  exerciseCount: number;
}

export interface SharePeriodTopExercise {
  id: string;
  name: string;
  /** Max weight on first training day with this exercise in the period. */
  maxWeightFrom: number;
  /** Max weight on last training day with this exercise in the period. */
  maxWeightTo: number;
}

export interface SharePeriodModel {
  kind: "period";
  periodLabel: string;
  dateRangeLabel: string;
  trainingDays: number;
  tonnageKg: number;
  topExercises: SharePeriodTopExercise[];
}

export interface ShareEmptyModel {
  kind: "empty";
  message: string;
}

export type ShareModel =
  | ShareEmptyModel
  | ShareExerciseModel
  | ShareWorkoutModel
  | SharePeriodModel;

export interface ShareExerciseOption {
  id: string;
  name: string;
  category: string;
  /** Max weight on the selected day — helps disambiguate same-name rows. */
  maxWeight?: number;
}

export const SHARE_PERIOD_LABELS: Record<AnalyticsPeriod, string> = {
  "7d": "7 дней",
  "30d": "30 дней",
  "90d": "90 дней",
  "180d": "6 месяцев",
  "365d": "1 год",
};
