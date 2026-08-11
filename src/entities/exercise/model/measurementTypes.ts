export type MeasurementType =
  | "free_weight"
  | "stack_lbs"
  | "stack_kg"
  | "time";

export const FREE_WEIGHT_MEASUREMENT_TYPE: MeasurementType = "free_weight";

const MEASUREMENT_TYPES: ReadonlySet<string> = new Set([
  "free_weight",
  "stack_lbs",
  "stack_kg",
  "time",
]);

export const normalizeMeasurementType = (raw: unknown): MeasurementType => {
  if (typeof raw === "string" && MEASUREMENT_TYPES.has(raw)) {
    return raw as MeasurementType;
  }

  return FREE_WEIGHT_MEASUREMENT_TYPE;
};

export const isStackMeasurementType = (
  type: MeasurementType,
): type is "stack_lbs" | "stack_kg" =>
  type === "stack_lbs" || type === "stack_kg";

export const isTimeMeasurementType = (type: MeasurementType): type is "time" =>
  type === "time";

export const defaultMeasurementStep = (
  type: MeasurementType,
): number | undefined => {
  if (type === "stack_kg") {
    return 5;
  }

  if (type === "stack_lbs") {
    return 10;
  }

  return undefined;
};

export const normalizeMeasurementStep = (
  type: MeasurementType,
  raw: unknown,
): number | undefined => {
  if (!isStackMeasurementType(type)) {
    return undefined;
  }

  if (typeof raw === "number" && Number.isFinite(raw) && raw > 0) {
    return raw;
  }

  if (typeof raw === "string" && raw.trim().length > 0) {
    const parsed = Number(raw);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return defaultMeasurementStep(type);
};

/** Format total seconds as `m:ss` / `mm:ss`. Negative values clamp to 0. */
export const formatSecondsAsMmSs = (totalSeconds: number): string => {
  const safeSeconds = Number.isFinite(totalSeconds)
    ? Math.max(0, Math.floor(totalSeconds))
    : 0;
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

/**
 * Live draft mask for time input: digits + at most one `:` or space;
 * seconds part at most 2 digits. Returns null if the keystroke is invalid.
 */
export const sanitizeTimeDraft = (raw: string): string | null => {
  if (raw === "") {
    return "";
  }

  if (/[^\d:\s]/.test(raw)) {
    return null;
  }

  const match = /^(\d*)([:\s]?)(\d{0,2})$/.exec(raw);
  if (!match) {
    return null;
  }

  const [, minutesPart = "", separator = "", secondsPart = ""] = match;

  // Reject a second separator or digits after a complete mm:ss / mm ss shape
  // that doesn't match the pattern above (already handled). Also reject
  // leading separator without minutes when there are no digits at all beyond it
  // only if separator alone — allow ":" / " " mid-edit after minutes.
  if (separator && minutesPart.length === 0) {
    return null;
  }

  return `${minutesPart}${separator}${secondsPart}`;
};

/**
 * Parse `m:ss` / `mm:ss` or `m ss` / `mm ss` draft into total seconds.
 * Minutes-only digits (no separator) → whole minutes.
 * Empty string → 0. Invalid → null.
 */
export const parseMmSsToSeconds = (draft: string): number | null => {
  const trimmed = draft.trim();
  if (trimmed.length === 0) {
    return 0;
  }

  const withSeconds = /^(\d+)[:\s]+([0-5]?\d)$/.exec(trimmed);
  if (withSeconds) {
    const minutes = Number(withSeconds[1]);
    const seconds = Number(withSeconds[2]);
    if (!Number.isFinite(minutes) || !Number.isFinite(seconds)) {
      return null;
    }
    return minutes * 60 + seconds;
  }

  if (/^\d+$/.test(trimmed)) {
    const minutes = Number(trimmed);
    if (!Number.isFinite(minutes)) {
      return null;
    }
    return minutes * 60;
  }

  return null;
};
