import { BODY_METRIC_DEFINITIONS } from "./types";
import type {
  BodyMeasurements,
  BodyMetricKey,
  BodyMetricTrendSummary,
  BodyMetricsEntry,
} from "./types";

const toTimestamp = (value: string) => {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getMetricValue = (measurements: BodyMeasurements, key: BodyMetricKey) => {
  const value = measurements[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
};

const getMetricHistoryValues = (entries: BodyMetricsEntry[], key: BodyMetricKey) => {
  return entries
    .map((entry) => getMetricValue(entry.measurements, key))
    .filter((value): value is number => value !== null);
};

const resolveTrend = (delta: number | null): BodyMetricTrendSummary["trend"] => {
  if (delta === null) {
    return "none";
  }
  if (delta > 0) {
    return "up";
  }
  if (delta < 0) {
    return "down";
  }
  return "stable";
};

export const selectSortedBodyMetricsEntries = (entries: BodyMetricsEntry[]) => {
  return [...entries].sort((leftEntry, rightEntry) => {
    const recordedDateDiff =
      toTimestamp(rightEntry.recordedAt) - toTimestamp(leftEntry.recordedAt);
    if (recordedDateDiff !== 0) {
      return recordedDateDiff;
    }
    return toTimestamp(rightEntry.createdAt) - toTimestamp(leftEntry.createdAt);
  });
};

export const selectBodyMetricsTrendSummary = (
  entries: BodyMetricsEntry[],
  metricDefinitions = BODY_METRIC_DEFINITIONS,
) => {
  const sortedEntries = selectSortedBodyMetricsEntries(entries);

  return metricDefinitions.map<BodyMetricTrendSummary>((definition) => {
    const metricHistoryValues = getMetricHistoryValues(sortedEntries, definition.key);
    const currentValue = metricHistoryValues[0] ?? null;
    const previousValue = metricHistoryValues[1] ?? null;
    const delta =
      currentValue === null || previousValue === null
        ? null
        : Number((currentValue - previousValue).toFixed(1));

    return {
      key: definition.key,
      label: definition.label,
      unit: definition.unit,
      currentValue,
      previousValue,
      delta,
      trend: resolveTrend(delta),
    };
  });
};
