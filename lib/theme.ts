export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";
export const THEME_PREFERENCE_ATTRIBUTE = "data-theme-preference";
export const THEME_ATTRIBUTE = "data-theme";

const VALID_THEMES: ReadonlySet<string> = new Set(["light", "dark", "system"]);

export const isThemeMode = (value: string | null): value is ThemeMode => {
  return Boolean(value && VALID_THEMES.has(value));
};

export const getSystemTheme = (): ResolvedTheme => {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

export const resolveTheme = (theme: ThemeMode): ResolvedTheme => {
  if (theme === "system") {
    return getSystemTheme();
  }

  return theme;
};

export const applyThemeToDocument = (theme: ThemeMode): ResolvedTheme => {
  const resolvedTheme = resolveTheme(theme);

  if (typeof document === "undefined") {
    return resolvedTheme;
  }

  const root = document.documentElement;
  root.classList.toggle("dark", resolvedTheme === "dark");
  root.setAttribute(THEME_ATTRIBUTE, resolvedTheme);
  root.setAttribute(THEME_PREFERENCE_ATTRIBUTE, theme);

  return resolvedTheme;
};

export const getStoredTheme = (): ThemeMode | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeMode(stored) ? stored : null;
  } catch {
    return null;
  }
};

export const persistTheme = (theme: ThemeMode): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore storage write failures in restricted environments.
  }
};

const getInitialTheme = (): ThemeMode => {
  if (typeof document === "undefined") {
    return "system";
  }

  const fromAttribute = document.documentElement.getAttribute(THEME_PREFERENCE_ATTRIBUTE);

  if (isThemeMode(fromAttribute)) {
    return fromAttribute;
  }

  return getStoredTheme() ?? "system";
};

export const getInitialThemeState = (): { theme: ThemeMode; resolvedTheme: ResolvedTheme } => {
  const theme = getInitialTheme();
  const resolvedTheme = applyThemeToDocument(theme);

  return { theme, resolvedTheme };
};

export const getThemeInitScript = (): string => {
  return `(() => {
    const storageKey = "${THEME_STORAGE_KEY}";
    const preferenceAttribute = "${THEME_PREFERENCE_ATTRIBUTE}";
    const themeAttribute = "${THEME_ATTRIBUTE}";
    const root = document.documentElement;

    const isTheme = (value) => value === "light" || value === "dark" || value === "system";

    let theme = "system";

    try {
      const stored = window.localStorage.getItem(storageKey);
      if (isTheme(stored)) {
        theme = stored;
      }
    } catch {
      // Ignore storage read failures.
    }

    const resolved = theme === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : theme;

    root.classList.toggle("dark", resolved === "dark");
    root.setAttribute(themeAttribute, resolved);
    root.setAttribute(preferenceAttribute, theme);
  })();`;
};
