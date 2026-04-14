export type AnalyticsPeriod = "7d" | "30d" | "90d";

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

export interface DashboardAnalytics {
  summary: ExerciseAnalyticsSummary;
  trends: TrendPoint[];
  tonnageComparison: PeriodComparison;
}
