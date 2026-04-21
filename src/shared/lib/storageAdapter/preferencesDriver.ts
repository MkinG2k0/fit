import { Preferences } from "@capacitor/preferences";
import type { StorageDriver } from "./types";

export const preferencesDriver: StorageDriver = {
  getItem: async (key) => {
    const { value } = await Preferences.get({ key });
    return value;
  },

  setItem: async (key, value) => {
    await Preferences.set({ key, value });
  },

  removeItem: async (key) => {
    await Preferences.remove({ key });
  },

  keys: async () => {
    const { keys } = await Preferences.keys();
    return keys;
  },
};
