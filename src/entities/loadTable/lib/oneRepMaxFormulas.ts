import type { OneRepMaxFormulasResult } from "../model/types";

const toNullableFinite = (value: number): number | null => {
  return Number.isFinite(value) ? value : null;
};

/**
 * 1RM estimates from working weight `w` and reps `r`.
 * Brzycki requires r &lt; 37 to avoid a zero/negative denominator.
 */
export const oneRepMaxFormulas = (w: number, r: number): OneRepMaxFormulasResult => {
  if (!Number.isFinite(w) || !Number.isFinite(r) || w <= 0 || r <= 0) {
    return { brzycki: null, epley: null, lander: null, avg: null };
  }

  const brzycki = r < 37 ? toNullableFinite((w * 36) / (37 - r)) : null;
  const epley = toNullableFinite(w * (1 + r / 30));
  const lander = toNullableFinite((100 * w) / (101.3 - 2.67123 * r));

  const values = [brzycki, epley, lander].filter(
    (value): value is number => value !== null,
  );
  const avg =
    values.length === 3
      ? toNullableFinite(values.reduce((sum, value) => sum + value, 0) / values.length)
      : null;

  return { brzycki, epley, lander, avg };
};
