import { useEffect, type ReactNode } from "react";
import { useThemeStore, type ThemeMode } from "@/entities/theme";

interface ThemeProviderProps {
  children: ReactNode;
}

const DARK_THEME_CLASSNAME = "dark";
const AGGRESSIVE_THEME_CLASSNAME = "theme-aggressive";
const CALM_THEME_CLASSNAME = "theme-calm";
const DARK_SCHEME_QUERY = "(prefers-color-scheme: dark)";
const CUSTOM_THEME_CLASSNAMES = [
  AGGRESSIVE_THEME_CLASSNAME,
  CALM_THEME_CLASSNAME,
] as const;

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
        customThemeClassName: AGGRESSIVE_THEME_CLASSNAME,
      };
    case "calm":
      return {
        shouldUseDarkTheme: false,
        customThemeClassName: CALM_THEME_CLASSNAME,
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

  rootElement.classList.toggle(DARK_THEME_CLASSNAME, shouldUseDarkTheme);
  rootElement.classList.remove(...CUSTOM_THEME_CLASSNAMES);

  if (customThemeClassName) {
    rootElement.classList.add(customThemeClassName);
  }
};

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const themeMode = useThemeStore((state) => state.themeMode);

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
