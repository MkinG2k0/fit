import { localStorageDriver } from "./localStorageDriver";
import { preferencesDriver } from "./preferencesDriver";
import type { StorageBackendMode } from "./types";

const DEFAULT_STORAGE_MODE: StorageBackendMode = "dual";

const resolveStorageMode = (): StorageBackendMode => {
  const rawMode = import.meta.env.VITE_STORAGE_BACKEND_MODE;
  if (
    rawMode === "preferences" ||
    rawMode === "local" ||
    rawMode === "dual"
  ) {
    return rawMode;
  }
  return DEFAULT_STORAGE_MODE;
};

const getStorageMode = (): StorageBackendMode => resolveStorageMode();

const uniqueKeys = (keys: string[]) => [...new Set(keys)];

const safeDriverKeys = async (
  getter: () => Promise<string[]>,
): Promise<string[]> => {
  try {
    return await getter();
  } catch {
    return [];
  }
};

const safeSet = async (writer: () => Promise<void>) => {
  try {
    await writer();
  } catch {
    return;
  }
};

const safeRemove = async (remover: () => Promise<void>) => {
  try {
    await remover();
  } catch {
    return;
  }
};

export const appStorage = {
  getString: async (key: string): Promise<string | null> => {
    const mode = getStorageMode();

    if (mode === "local") {
      return localStorageDriver.getItem(key);
    }

    if (mode === "preferences") {
      try {
        return await preferencesDriver.getItem(key);
      } catch {
        return null;
      }
    }

    try {
      const fromPreferences = await preferencesDriver.getItem(key);
      if (fromPreferences !== null) {
        return fromPreferences;
      }
    } catch {
      // noop
    }

    const fromLocalStorage = await localStorageDriver.getItem(key);
    if (fromLocalStorage !== null) {
      await safeSet(() =>
        preferencesDriver.setItem(key, fromLocalStorage),
      );
    }

    return fromLocalStorage;
  },

  setString: async (key: string, value: string) => {
    const mode = getStorageMode();

    if (mode === "local") {
      await safeSet(() => localStorageDriver.setItem(key, value));
      return;
    }

    await safeSet(() => preferencesDriver.setItem(key, value));

    if (mode === "dual") {
      await safeSet(() => localStorageDriver.setItem(key, value));
    }
  },

  remove: async (key: string) => {
    const mode = getStorageMode();

    if (mode === "local") {
      await safeRemove(() => localStorageDriver.removeItem(key));
      return;
    }

    await safeRemove(() => preferencesDriver.removeItem(key));

    if (mode === "dual") {
      await safeRemove(() => localStorageDriver.removeItem(key));
    }
  },

  keys: async (): Promise<string[]> => {
    const mode = getStorageMode();

    if (mode === "local") {
      return safeDriverKeys(() => localStorageDriver.keys());
    }

    if (mode === "preferences") {
      return safeDriverKeys(() => preferencesDriver.keys());
    }

    const [preferenceKeys, localKeys] = await Promise.all([
      safeDriverKeys(() => preferencesDriver.keys()),
      safeDriverKeys(() => localStorageDriver.keys()),
    ]);

    return uniqueKeys([...preferenceKeys, ...localKeys]);
  },

  getJson: async <T>(key: string): Promise<T | null> => {
    const value = await appStorage.getString(key);
    if (!value) {
      return null;
    }
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  },

  setJson: async (key: string, value: unknown) => {
    await appStorage.setString(key, JSON.stringify(value));
  },
};
