import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { zustandAppStorage } from "@/shared/lib/storageAdapter";
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
      storage: createJSONStorage(() => zustandAppStorage),
    },
  ),
);
