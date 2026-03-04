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

// Doc trang thai ban dau dong bo voi script khoi tao trong layout.tsx
// Cach nay giup tranh nhay giao dien khi hydrate
const getInitialThemeMode = () => {
  if (typeof window === "undefined") return "system";
  return normalizeThemeMode(localStorage.getItem(STORAGE_KEY));
};

const getInitialSystemDark = () => {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

export const ThemeProvider = ({ children }) => {
  // Khoi tao tu DOM/localStorage ngay lan render dau, dong bo voi script inline
  const [themeMode, setThemeMode] = useState(getInitialThemeMode);
  const [systemPrefersDark, setSystemPrefersDark] = useState(getInitialSystemDark);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const applySystemTheme = () => setSystemPrefersDark(mediaQuery.matches);

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
    document.documentElement.setAttribute("data-theme", resolvedTheme);
    localStorage.setItem(STORAGE_KEY, themeMode);
  }, [isDarkMode, resolvedTheme, themeMode]);

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
