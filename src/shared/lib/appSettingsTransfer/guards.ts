export const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const isZustandPersistBlob = (
  value: unknown,
): value is { state: unknown; version?: number } => {
  if (!isPlainObject(value)) {
    return false;
  }
  return "state" in value;
};
