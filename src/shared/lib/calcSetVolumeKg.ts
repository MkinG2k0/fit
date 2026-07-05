/**
 * Объём подхода в «кг» для колец, сводок и аналитики.
 * Для упражнений без веса (weight = 0) используем множитель 1,
 * чтобы повторы учитывались в объёме (10×0 → 10, а не 0).
 */
export const calcSetVolumeKg = (weight: number, reps: number): number => {
  const safeWeight = Number.isFinite(weight) ? weight : 0;
  const safeReps = Number.isFinite(reps) ? reps : 0;
  const effectiveWeight = safeWeight > 0 ? safeWeight : 1;
  return safeReps * effectiveWeight;
};
