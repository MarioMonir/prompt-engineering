import { elements } from "./state.js";
import { safeTrim } from "./storage.js";
import { THEME_KEY } from "./state.js";

/**
 * Gets the system's preferred color scheme
 * @returns {string} "dark" or "light" based on system preference
 */
export function getSystemTheme() {
  return window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/**
 * Gets the user's saved theme preference from localStorage
 * @returns {string|null} Saved theme ("dark", "light") or null if not set
 */
export function getSavedTheme() {
  const t = safeTrim(localStorage.getItem(THEME_KEY));
  return t === "dark" || t === "light" ? t : null;
}

/**
 * Applies the specified theme to the document and updates UI labels
 * @param {string} theme - Theme to apply ("dark" or "light")
 */
export function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  if (elements.themeLabel)
    elements.themeLabel.textContent = theme === "dark" ? "Dark" : "Light";
}

/**
 * Saves and applies the specified theme
 * @param {string} theme - Theme to save and apply ("dark" or "light")
 */
export function setTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
  applyTheme(theme);
}

/**
 * Toggles between dark and light themes
 */
export function toggleTheme() {
  const current =
    document.documentElement.getAttribute("data-theme") || getSystemTheme();
  setTheme(current === "dark" ? "light" : "dark");
}
