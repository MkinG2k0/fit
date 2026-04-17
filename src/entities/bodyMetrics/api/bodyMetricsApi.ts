import type { StateStorage } from "zustand/middleware";

const BODY_METRICS_STORAGE_KEY = "body-metrics-store";

const safeGetItem = (name: string) => {
  try {
    return localStorage.getItem(name);
  } catch {
    return null;
  }
};

const safeSetItem = (name: string, value: string) => {
  try {
    localStorage.setItem(name, value);
    return true;
  } catch {
    return false;
  }
};

const safeRemoveItem = (name: string) => {
  try {
    localStorage.removeItem(name);
    return true;
  } catch {
    return false;
  }
};

export const bodyMetricsStorageApi: StateStorage = {
  getItem: (name) => safeGetItem(name),
  setItem: (name, value) => {
    safeSetItem(name, value);
  },
  removeItem: (name) => {
    safeRemoveItem(name);
  },
};

export const getBodyMetricsStorageKey = () => BODY_METRICS_STORAGE_KEY;
