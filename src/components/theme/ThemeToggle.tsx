"use client";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, toggle, isReady } = useTheme();
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label="Toggle colour theme"
      disabled={!isReady}
    >
      <span className="theme-toggle__icon" aria-hidden>{theme === "dark" ? "??" : "??"}</span>
      <span className="theme-toggle__label">{theme === "dark" ? "Dark" : "Light"}</span>
    </button>
  );
}
