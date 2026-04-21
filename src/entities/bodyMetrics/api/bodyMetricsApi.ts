import { zustandAppStorage } from "@/shared/lib/storageAdapter";

const BODY_METRICS_STORAGE_KEY = "body-metrics-store";

export const bodyMetricsStorageApi = zustandAppStorage;

export const getBodyMetricsStorageKey = () => BODY_METRICS_STORAGE_KEY;
