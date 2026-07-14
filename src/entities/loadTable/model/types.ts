export interface LoadTableExercise {
  id: string;
  catalogExerciseId: string;
  maxKg: number;
  createdAt: string;
  /** Если true — при «Добавить подход» в дневнике подставляются вес/reps из плана. */
  isTracking: boolean;
}

export interface LoadTableExerciseDraft {
  catalogExerciseId: string;
  maxKg: number;
}

export interface LoadTableExerciseUpdate {
  maxKg?: number;
}

export interface LoadTableScheduleWeek {
  week: number;
  percent: number;
  reps: number;
}

export interface OneRepMaxFormulasResult {
  brzycki: number | null;
  epley: number | null;
  lander: number | null;
  avg: number | null;
}

export interface LoadTableWeekRow extends LoadTableScheduleWeek {
  weightKg: number;
  formulas: OneRepMaxFormulasResult;
}
