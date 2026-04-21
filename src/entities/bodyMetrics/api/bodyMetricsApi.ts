import type { StateStorage } from "zustand/middleware";
import { appStorage } from "@/shared/lib/storageAdapter";

const BODY_METRICS_STORAGE_KEY = "body-metrics-store";

export const bodyMetricsStorageApi: StateStorage = {
  getItem: async (name) => appStorage.getString(name),
  setItem: async (name, value) => {
    await appStorage.setString(name, value);
  },
  removeItem: async (name) => {
    await appStorage.remove(name);
  },
};

export const getBodyMetricsStorageKey = () => BODY_METRICS_STORAGE_KEY;
