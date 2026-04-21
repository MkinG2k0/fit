export type AnalyticsPeriod = "7d" | "30d" | "90d" | "365d";

export interface DateRange {
  startDateKey: string;
  endDateKey: string;
}

export interface AnalyticsFilters {
  period: AnalyticsPeriod;
  exerciseName: string;
  category: string;
}

export interface ExerciseSessionStat {
  id: string;
  name: string;
  category: string;
  tonnage: number;
  totalReps: number;
  maxWeight: number;
}

export interface TrainingSessionStat {
  dateKey: string;
  exercises: ExerciseSessionStat[];
}

export interface TrendPoint {
  date: string;
  tonnage: number;
  totalReps: number;
  maxWeight: number;
  sessions: number;
}

export interface ActivityHeatmapCell {
  id: string;
  dateKey: string;
  weekIndex: number;
  dayIndex: number;
  sessions: number;
  intensity: 0 | 1 | 2 | 3 | 4;
}

export interface ActivityHeatmap {
  weeks: number;
  cells: ActivityHeatmapCell[];
}

export interface VolumeMetrics {
  totalTonnage: number;
  averageTonnagePerTrainingDay: number;
  bestDayTonnage: number;
}

export interface WeightMetrics {
  maxWeight: number;
  averageWorkingWeight: number;
}

export interface RepMetrics {
  totalReps: number;
  averageRepsPerSet: number;
  bestSetReps: number;
}

export interface FrequencyMetrics {
  trainingDays: number;
  totalSessions: number;
  averageSessionsPerWeek: number;
  currentStreakDays: number;
}

export interface PeriodComparison {
  currentValue: number;
  previousValue: number;
  delta: number;
  deltaPercent: number | null;
}

export interface ExerciseAnalyticsSummary {
  volume: VolumeMetrics;
  weight: WeightMetrics;
  reps: RepMetrics;
  frequency: FrequencyMetrics;
}

export interface MuscleBalanceItem {
  muscle: string;
  tonnage: number;
  percent: number;
}

export interface MuscleBalance {
  items: MuscleBalanceItem[];
}

export interface ExerciseTrendRow {
  id: string;
  name: string;
  sessions: number;
  tonnage: number;
  trend: {
    dateKey: string;
    tonnage: number;
  }[];
}

export interface DashboardAnalytics {
  summary: ExerciseAnalyticsSummary;
  trends: TrendPoint[];
  tonnageComparison: PeriodComparison;
  activityHeatmap: ActivityHeatmap;
  muscleBalance: MuscleBalance;
  exerciseRows: ExerciseTrendRow[];
}
