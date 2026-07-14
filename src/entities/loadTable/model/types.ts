export interface LoadTableExercise {
  id: string;
  catalogExerciseId: string;
  maxKg: number;
  /** Текущая неделя плана 1–16; сдвигается кнопкой в детали таблицы. */
  currentWeek: number;
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
