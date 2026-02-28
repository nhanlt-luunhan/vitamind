"use client";
import { createContext, useState, useEffect, useContext } from "react";

const ThemeContext = createContext();
const STORAGE_KEY = "theme";

const normalizeThemeMode = (value) => {
  if (value === "day" || value === "night" || value === "system") {
    return value;
  }
  return "system";
};

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState("system");
  const [systemPrefersDark, setSystemPrefersDark] = useState(true);

  useEffect(() => {
    const currentTheme = normalizeThemeMode(localStorage.getItem(STORAGE_KEY));
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const applySystemTheme = () => setSystemPrefersDark(mediaQuery.matches);

    setThemeMode(currentTheme);
    applySystemTheme();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", applySystemTheme);
      return () => mediaQuery.removeEventListener("change", applySystemTheme);
    }

    mediaQuery.addListener(applySystemTheme);
    return () => mediaQuery.removeListener(applySystemTheme);
  }, []);

  const resolvedTheme = themeMode === "system" ? (systemPrefersDark ? "night" : "day") : themeMode;
  const isDarkMode = resolvedTheme === "night";

  useEffect(() => {
    document.documentElement.classList.toggle("theme-night", isDarkMode);
    document.documentElement.classList.toggle("theme-day", !isDarkMode);
    localStorage.setItem(STORAGE_KEY, themeMode);
  }, [isDarkMode, themeMode]);

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        resolvedTheme,
        themeMode,
        setThemeMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
