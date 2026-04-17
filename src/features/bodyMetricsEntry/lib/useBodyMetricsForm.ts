import { useState } from "react";
import {
  type BodyMetricDefinition,
  type BodyMetricKey,
  type BodyMetricsDraft,
  type BodyMetricsEntry,
} from "@/entities/bodyMetrics";

type BodyMetricsFieldState = Record<string, string>;

const EMPTY_FIELDS: BodyMetricsFieldState = {
  bicepsCm: "",
  chestCm: "",
  waistCm: "",
  hipsCm: "",
  thighCm: "",
  neckCm: "",
  calfCm: "",
  weightKg: "",
};

const buildFieldStateFromEntry = (
  metricDefinitions: BodyMetricDefinition[],
  initialEntry?: BodyMetricsEntry | null,
): BodyMetricsFieldState => {
  const initialState: BodyMetricsFieldState = { ...EMPTY_FIELDS };
  metricDefinitions.forEach((definition) => {
    initialState[definition.key] = "";
  });

  if (!initialEntry) {
    return initialState;
  }

  Object.entries(initialEntry.measurements).forEach(([key, value]) => {
    initialState[key] = typeof value === "number" ? String(value) : "";
  });

  return initialState;
};

const resolveDefaultDate = (initialEntry?: BodyMetricsEntry | null) => {
  if (initialEntry) {
    return initialEntry.recordedAt;
  }
  return new Date().toISOString().slice(0, 10);
};

const resolveDefaultMetricKey = (
  metricDefinitions: BodyMetricDefinition[],
  initialEntry?: BodyMetricsEntry | null,
): BodyMetricKey => {
  const fallbackKey = metricDefinitions[0]?.key ?? "waistCm";

  if (!initialEntry) {
    return fallbackKey;
  }

  const metricKeys = metricDefinitions.map((definition) => definition.key);
  const firstFilledMetric = metricKeys.find((key) => {
    return typeof initialEntry.measurements[key] === "number";
  });

  return firstFilledMetric ?? fallbackKey;
};

const toNumber = (value: string) => {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
};

const getDefinitionByKey = (
  metricDefinitions: BodyMetricDefinition[],
  key: BodyMetricKey,
) => {
  return metricDefinitions.find((definition) => definition.key === key);
};

interface UseBodyMetricsFormOptions {
  metricDefinitions: BodyMetricDefinition[];
  initialEntry?: BodyMetricsEntry | null;
}

export const useBodyMetricsForm = ({
  metricDefinitions,
  initialEntry,
}: UseBodyMetricsFormOptions) => {
  const [recordedAt, setRecordedAt] = useState<string>(() =>
    resolveDefaultDate(initialEntry),
  );
  const [fields, setFields] = useState<BodyMetricsFieldState>(() =>
    buildFieldStateFromEntry(metricDefinitions, initialEntry),
  );
  const [selectedMetricKey, setSelectedMetricKey] = useState<BodyMetricKey>(() =>
    resolveDefaultMetricKey(metricDefinitions, initialEntry),
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isEditing = Boolean(initialEntry);

  const fieldDefinitions = metricDefinitions;

  const handleRecordedAtChange = (value: string) => {
    setRecordedAt(value);
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const handleFieldChange = (key: string, value: string) => {
    setFields((prevState) => ({
      ...prevState,
      [key]: value,
    }));
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const handleSelectedMetricChange = (key: BodyMetricKey) => {
    setSelectedMetricKey(key);
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const validateAndBuildDraft = (): BodyMetricsDraft | null => {
    if (recordedAt.length === 0) {
      setErrorMessage("Дата замеров обязательна");
      return null;
    }

    const measurements: BodyMetricsDraft["measurements"] = {};

    for (const [key, value] of Object.entries(fields)) {
      const rawValue = value.trim();
      if (rawValue.length === 0) {
        continue;
      }

      const definition = getDefinitionByKey(metricDefinitions, key);
      if (!definition) {
        continue;
      }

      const parsedValue = toNumber(rawValue);
      if (parsedValue === null || parsedValue <= 0) {
        setErrorMessage(`${definition.label}: введите корректное число больше 0`);
        return null;
      }

      if (parsedValue < definition.min || parsedValue > definition.max) {
        setErrorMessage(
          `${definition.label}: значение должно быть от ${definition.min} до ${definition.max} ${definition.unit}`,
        );
        return null;
      }

      measurements[key] = Number(parsedValue.toFixed(1));
    }

    if (Object.keys(measurements).length === 0) {
      setErrorMessage("Заполните хотя бы один параметр тела");
      return null;
    }

    return {
      recordedAt,
      measurements,
    };
  };

  return {
    recordedAt,
    fields,
    selectedMetricKey,
    isEditing,
    fieldDefinitions,
    errorMessage,
    setErrorMessage,
    handleRecordedAtChange,
    handleFieldChange,
    handleSelectedMetricChange,
    validateAndBuildDraft,
  };
};
