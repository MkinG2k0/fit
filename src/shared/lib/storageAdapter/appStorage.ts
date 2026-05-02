import { preferencesDriver } from "./preferencesDriver";

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
    try {
      return await preferencesDriver.getItem(key);
    } catch {
      return null;
    }
  },

  setString: async (key: string, value: string) => {
    await safeSet(() => preferencesDriver.setItem(key, value));
  },

  remove: async (key: string) => {
    await safeRemove(() => preferencesDriver.removeItem(key));
  },

  keys: async (): Promise<string[]> => {
    return safeDriverKeys(() => preferencesDriver.keys());
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
