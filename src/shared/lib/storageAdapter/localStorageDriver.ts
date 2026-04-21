import type { StorageDriver } from "./types";

const isBrowser = () => typeof window !== "undefined" && !!window.localStorage;

const getLocalStorageKeys = (): string[] => {
  if (!isBrowser()) {
    return [];
  }

  return Object.keys(window.localStorage);
};

export const localStorageDriver: StorageDriver = {
  getItem: async (key) => {
    if (!isBrowser()) {
      return null;
    }

    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  setItem: async (key, value) => {
    if (!isBrowser()) {
      return;
    }

    try {
      window.localStorage.setItem(key, value);
    } catch {
      return;
    }
  },

  removeItem: async (key) => {
    if (!isBrowser()) {
      return;
    }

    try {
      window.localStorage.removeItem(key);
    } catch {
      return;
    }
  },

  keys: async () => getLocalStorageKeys(),
};
