import type { PeriodComparison, TrainingSessionStat } from "../model/types";

const getTonnageTotal = (sessions: TrainingSessionStat[]) => {
  return sessions.reduce((sessionsAcc, session) => {
    const dailyTonnage = session.exercises.reduce(
      (exerciseAcc, exercise) => exerciseAcc + exercise.tonnage,
      0,
    );
    return sessionsAcc + dailyTonnage;
  }, 0);
};

export const calculatePeriodComparison = (
  currentSessions: TrainingSessionStat[],
  previousSessions: TrainingSessionStat[],
): PeriodComparison => {
  const currentValue = getTonnageTotal(currentSessions);
  const previousValue = getTonnageTotal(previousSessions);
  const delta = currentValue - previousValue;
  const deltaPercent =
    previousValue === 0 ? null : (delta / Math.abs(previousValue)) * 100;

  return {
    currentValue,
    previousValue,
    delta,
    deltaPercent,
  };
};

