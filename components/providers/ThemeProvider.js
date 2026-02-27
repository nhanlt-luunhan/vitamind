"use client";
import { createContext, useState, useEffect, useContext } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode

  // Load the theme from localStorage when the component mounts
  useEffect(() => {
    const currentTheme = localStorage.getItem("theme");
    setIsDarkMode(currentTheme ? currentTheme === "night" : true);
  }, []);

  // Apply the theme class to the document element based on isDarkMode state
  useEffect(() => {
    document.documentElement.classList.toggle("theme-night", isDarkMode);
    document.documentElement.classList.toggle("theme-day", !isDarkMode);
    localStorage.setItem("theme", isDarkMode ? "night" : "day");
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, setIsDarkMode }}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
