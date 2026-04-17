import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { bodyMetricsStorageApi, getBodyMetricsStorageKey } from "../api/bodyMetricsApi";
import { BODY_METRIC_DEFINITIONS } from "../model/types";
import type {
  BodyMeasurements,
  BodyMetricDefinition,
  BodyMetricsDraft,
  BodyMetricsEntry,
  CreateCustomBodyMetricPayload,
} from "../model/types";

type BodyMetricsStatus = "idle" | "loading" | "error";

interface BodyMetricsState {
  entries: BodyMetricsEntry[];
  customMetricDefinitions: BodyMetricDefinition[];
  isHydrated: boolean;
  status: BodyMetricsStatus;
  errorMessage: string | null;
}

interface BodyMetricsActions {
  addEntry: (draft: BodyMetricsDraft) => void;
  updateEntry: (entryId: string, draft: BodyMetricsDraft) => void;
  deleteEntry: (entryId: string) => void;
  addCustomMetricDefinition: (payload: CreateCustomBodyMetricPayload) => void;
  clearError: () => void;
}

const isPositiveFiniteNumber = (value: unknown): value is number => {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
};

const hasAtLeastOneMetricValue = (measurements: BodyMeasurements) => {
  return Object.values(measurements).some((value) => isPositiveFiniteNumber(value));
};

const createEntryId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.round(Math.random() * 1_000_000)}`;
};

const createCustomMetricKey = () => {
  return `custom_${Date.now().toString(36)}_${Math.round(Math.random() * 10_000).toString(36)}`;
};

const normalizeMetricLabel = (value: string) => value.trim();
const normalizeMetricUnit = (value: string) => value.trim().toLowerCase();

const validateDraft = (draft: BodyMetricsDraft) => {
  if (draft.recordedAt.length === 0) {
    return "Укажите дату замеров";
  }

  if (!hasAtLeastOneMetricValue(draft.measurements)) {
    return "Добавьте хотя бы один параметр тела";
  }

  return null;
};

export const useBodyMetricsStore = create<BodyMetricsState & BodyMetricsActions>()(
  persist(
    (set) => ({
      entries: [],
      customMetricDefinitions: [],
      isHydrated: true,
      status: "idle",
      errorMessage: null,

      addEntry: (draft) =>
        set((state) => {
          const validationError = validateDraft(draft);
          if (validationError) {
            return {
              ...state,
              status: "error",
              errorMessage: validationError,
            };
          }

          const newEntry: BodyMetricsEntry = {
            id: createEntryId(),
            recordedAt: draft.recordedAt,
            measurements: draft.measurements,
            createdAt: new Date().toISOString(),
          };

          return {
            ...state,
            entries: [...state.entries, newEntry],
            status: "idle",
            errorMessage: null,
          };
        }),

      updateEntry: (entryId, draft) =>
        set((state) => {
          const validationError = validateDraft(draft);
          if (validationError) {
            return {
              ...state,
              status: "error",
              errorMessage: validationError,
            };
          }

          const existingEntry = state.entries.find((entry) => entry.id === entryId);
          if (!existingEntry) {
            return {
              ...state,
              status: "error",
              errorMessage: "Не удалось найти запись для редактирования",
            };
          }

          return {
            ...state,
            entries: state.entries.map((entry) =>
              entry.id === entryId
                ? {
                    ...entry,
                    recordedAt: draft.recordedAt,
                    measurements: draft.measurements,
                  }
                : entry,
            ),
            status: "idle",
            errorMessage: null,
          };
        }),

      deleteEntry: (entryId) =>
        set((state) => ({
          ...state,
          entries: state.entries.filter((entry) => entry.id !== entryId),
          status: "idle",
          errorMessage: null,
        })),

      addCustomMetricDefinition: (payload) =>
        set((state) => {
          const label = normalizeMetricLabel(payload.label);
          const unit = normalizeMetricUnit(payload.unit);

          if (label.length < 2) {
            return {
              ...state,
              status: "error",
              errorMessage: "Название параметра должно содержать минимум 2 символа",
            };
          }

          if (unit.length === 0) {
            return {
              ...state,
              status: "error",
              errorMessage: "Укажите единицу измерения параметра",
            };
          }

          const allDefinitions = [
            ...BODY_METRIC_DEFINITIONS,
            ...state.customMetricDefinitions,
          ];
          const isDuplicateLabel = allDefinitions.some(
            (definition) => definition.label.toLowerCase() === label.toLowerCase(),
          );
          if (isDuplicateLabel) {
            return {
              ...state,
              status: "error",
              errorMessage: "Параметр с таким названием уже существует",
            };
          }

          const customDefinition: BodyMetricDefinition = {
            key: createCustomMetricKey(),
            label,
            unit,
            min: 1,
            max: 500,
            step: 0.1,
          };

          return {
            ...state,
            customMetricDefinitions: [...state.customMetricDefinitions, customDefinition],
            status: "idle",
            errorMessage: null,
          };
        }),

      clearError: () =>
        set((state) => ({
          ...state,
          status: "idle",
          errorMessage: null,
        })),
    }),
    {
      name: getBodyMetricsStorageKey(),
      storage: createJSONStorage(() => bodyMetricsStorageApi),
    },
  ),
);
