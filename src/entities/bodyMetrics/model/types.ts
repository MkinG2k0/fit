export const BODY_METRIC_KEYS = [
  "bicepsCm",
  "chestCm",
  "waistCm",
  "hipsCm",
  "thighCm",
  "neckCm",
  "calfCm",
  "weightKg",
] as const;

export type DefaultBodyMetricKey = (typeof BODY_METRIC_KEYS)[number];
export type BodyMetricKey = string;

export interface BodyMetricDefinition {
  key: BodyMetricKey;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
}

export const BODY_METRIC_DEFINITIONS: BodyMetricDefinition[] = [
  { key: "bicepsCm", label: "Бицепс", unit: "cm", min: 10, max: 100, step: 0.1 },
  { key: "chestCm", label: "Грудь", unit: "cm", min: 20, max: 200, step: 0.1 },
  { key: "waistCm", label: "Талия", unit: "cm", min: 20, max: 200, step: 0.1 },
  { key: "hipsCm", label: "Бедра", unit: "cm", min: 20, max: 250, step: 0.1 },
  { key: "thighCm", label: "Бедро", unit: "cm", min: 10, max: 150, step: 0.1 },
  { key: "neckCm", label: "Шея", unit: "cm", min: 10, max: 100, step: 0.1 },
  { key: "calfCm", label: "Икра", unit: "cm", min: 10, max: 100, step: 0.1 },
  { key: "weightKg", label: "Вес", unit: "kg", min: 20, max: 400, step: 0.1 },
];

export type BodyMeasurements = Partial<Record<BodyMetricKey, number>>;

export interface BodyMetricsDraft {
  recordedAt: string;
  measurements: BodyMeasurements;
}

export interface BodyMetricsEntry extends BodyMetricsDraft {
  id: string;
  createdAt: string;
}

export interface BodyMetricTrendSummary {
  key: BodyMetricKey;
  label: string;
  unit: string;
  currentValue: number | null;
  previousValue: number | null;
  delta: number | null;
  trend: "up" | "down" | "stable" | "none";
}

export interface CreateCustomBodyMetricPayload {
  label: string;
  unit: string;
}
