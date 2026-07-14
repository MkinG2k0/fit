export interface LoadTableExercise {
  id: string;
  catalogExerciseId: string;
  maxKg: number;
  maxReps: number;
  createdAt: string;
}

export interface LoadTableExerciseDraft {
  catalogExerciseId: string;
  maxKg: number;
  maxReps: number;
}

export interface LoadTableExerciseUpdate {
  maxKg?: number;
  maxReps?: number;
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
