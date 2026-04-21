import { useEffect, type ReactNode } from "react";
import { useThemeStore, type ThemeMode } from "@/entities/theme";
import { syncCapacitorStatusBarStyle } from "@/shared/lib/capacitorSystemBars";

interface ThemeProviderProps {
  children: ReactNode;
}

const DARK_SCHEME_QUERY = "(prefers-color-scheme: dark)";

interface ResolvedThemeMode {
  shouldUseDarkTheme: boolean;
  customThemeClassName?: string;
}

const resolveThemeMode = (themeMode: ThemeMode): ResolvedThemeMode => {
  const isDarkThemePreferred = window.matchMedia(DARK_SCHEME_QUERY).matches;

  switch (themeMode) {
    case "dark":
      return { shouldUseDarkTheme: true };
    case "light":
      return { shouldUseDarkTheme: false };
    case "aggressive":
      return {
        shouldUseDarkTheme: true,
        customThemeClassName: "theme-aggressive",
      };
    case "calm":
      return {
        shouldUseDarkTheme: false,
        customThemeClassName: "theme-calm",
      };
    case "system":
      return { shouldUseDarkTheme: isDarkThemePreferred };
    default:
      return { shouldUseDarkTheme: false };
  }
};

const applyThemeMode = (themeMode: ThemeMode) => {
  const rootElement = document.documentElement;
  const { shouldUseDarkTheme, customThemeClassName } = resolveThemeMode(themeMode);

  rootElement.classList.toggle("dark", shouldUseDarkTheme);
  rootElement.classList.remove("theme-aggressive", "theme-calm");

  if (customThemeClassName) {
    rootElement.classList.add(customThemeClassName);
  }

  syncCapacitorStatusBarStyle(shouldUseDarkTheme);
};

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const themeMode = useThemeStore((state) => state.themeMode);

  useEffect(() => {
    const unsub = useThemeStore.persist.onFinishHydration(() => {
      applyThemeMode(useThemeStore.getState().themeMode);
    });
    return unsub;
  }, []);

  useEffect(() => {
    applyThemeMode(themeMode);

    if (themeMode !== "system") {
      return;
    }

    const mediaQuery = window.matchMedia(DARK_SCHEME_QUERY);
    const handleThemeSchemeChange = () => {
      applyThemeMode(themeMode);
    };

    mediaQuery.addEventListener("change", handleThemeSchemeChange);

    return () => {
      mediaQuery.removeEventListener("change", handleThemeSchemeChange);
    };
  }, [themeMode]);

  return children;
};
