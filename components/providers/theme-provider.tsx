"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  applyThemeToDocument,
  getInitialThemeState,
  getSystemTheme,
  persistTheme,
  ResolvedTheme,
  ThemeMode,
} from "@/lib/theme";

type ThemeContextValue = {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  isDarkMode: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const initialThemeState = useMemo(() => getInitialThemeState(), []);
  const [theme, setThemeState] = useState<ThemeMode>(initialThemeState.theme);
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(
    initialThemeState.theme === "system" ? initialThemeState.resolvedTheme : getSystemTheme(),
  );

  const resolvedTheme = useMemo<ResolvedTheme>(() => {
    return theme === "system" ? systemTheme : theme;
  }, [systemTheme, theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      setSystemTheme(mediaQuery.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    applyThemeToDocument(theme);
    persistTheme(theme);
  }, [resolvedTheme, theme]);

  const value = useMemo<ThemeContextValue>(() => {
    return {
      theme,
      resolvedTheme,
      isDarkMode: resolvedTheme === "dark",
      setTheme: (nextTheme) => {
        setThemeState((current) => {
          if (current === nextTheme) {
            return current;
          }

          return nextTheme;
        });
      },
      toggleTheme: () => {
        setThemeState(resolvedTheme === "dark" ? "light" : "dark");
      },
    };
  }, [resolvedTheme, theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
};
