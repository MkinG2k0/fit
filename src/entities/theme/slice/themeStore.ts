import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ThemeMode } from "../model/types";

interface ThemeState {
  themeMode: ThemeMode;
}

interface ThemeActions {
  setThemeMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState & ThemeActions>()(
  persist(
    (set) => ({
      themeMode: "aggressive",
      setThemeMode: (mode) => set({ themeMode: mode }),
    }),
    {
      name: "theme-preferences",
    },
  ),
);
