/** Excel-style half-kilogram rounding (e.g. 37.5, 39.0). */
export const roundToHalfKg = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.round(value * 2) / 2;
};
