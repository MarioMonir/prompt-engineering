import { elements, THEME_KEY } from "../shared/state.js";
import { documentRef } from "../shared/domDocument.js";
import { safeTrim } from "./storage.js";
import { windowRef } from "../shared/windowGlobals.js";

/**
 * Gets the system's preferred color scheme
 * @returns {string} "dark" or "light" based on system preference
 */
export function getSystemTheme() {
  return windowRef.matchMedia &&
    windowRef.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/**
 * Gets the user's saved theme preference from localStorage
 * @returns {string|null} Saved theme ("dark", "light") or null if not set
 */
export function getSavedTheme() {
  const t = safeTrim(windowRef.localStorage.getItem(THEME_KEY));
  return t === "dark" || t === "light" ? t : null;
}

/**
 * Applies the specified theme to the document and updates UI labels
 * @param {string} theme - Theme to apply ("dark" or "light")
 */
export function applyTheme(theme) {
  documentRef.documentElement.setAttribute("data-theme", theme);
  if (elements.themeLabel)
    elements.themeLabel.textContent = theme === "dark" ? "Dark" : "Light";
}

/**
 * Saves and applies the specified theme
 * @param {string} theme - Theme to save and apply ("dark" or "light")
 */
export function setTheme(theme) {
  windowRef.localStorage.setItem(THEME_KEY, theme);
  applyTheme(theme);
}

/**
 * Toggles between dark and light themes
 */
export function toggleTheme() {
  const current =
    documentRef.documentElement.getAttribute("data-theme") || getSystemTheme();
  setTheme(current === "dark" ? "light" : "dark");
}
