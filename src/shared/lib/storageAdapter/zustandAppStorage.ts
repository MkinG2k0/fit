import type { StateStorage } from "zustand/middleware";
import { appStorage } from "./appStorage";

/** Общий бэкенд для `persist`: тот же путь, что и у журнала — Preferences в нативной сборке. */
export const zustandAppStorage: StateStorage = {
  getItem: (name) => appStorage.getString(name),
  setItem: (name, value) => appStorage.setString(name, value),
  removeItem: (name) => appStorage.remove(name),
};
