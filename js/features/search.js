import { sharedState, elements } from "../shared/state.js";
import { safeTrim } from "./storage.js";

/**
 * Updates the character count displays for title and content inputs
 */
export function setCounts() {
  elements.titleCount.textContent = String(elements.title.value.length);
  elements.contentCount.textContent = String(elements.content.value.length);
}

/**
 * Checks if a prompt matches the search query
 * @param {Object} prompt - Prompt object with title and content
 * @param {string} q - Search query string
 * @returns {boolean} True if prompt matches the search query
 */
export function matchesSearch(prompt, q) {
  if (!q) return true;
  const hay = `${prompt.title}\n${prompt.content}`.toLowerCase();
  return hay.includes(q);
}

/**
 * Comparator function for sorting prompts
 * @param {Object} a - First prompt object
 * @param {Object} b - Second prompt object
 * @param {string} mode - Sort mode ("createdDesc", "titleAsc", "titleDesc", "updatedDesc")
 * @returns {number} Comparison result for sorting
 */
export function compare(a, b, mode) {
  switch (mode) {
    case "createdDesc":
      return b.createdAt - a.createdAt;
    case "ratingDesc": {
      const ar = Math.max(0, Math.min(5, Math.trunc(Number(a.rating ?? 0))));
      const br = Math.max(0, Math.min(5, Math.trunc(Number(b.rating ?? 0))));
      if (br !== ar) return br - ar;
      return (b.updatedAt ?? 0) - (a.updatedAt ?? 0);
    }
    case "titleAsc":
      return a.title.localeCompare(b.title);
    case "titleDesc":
      return b.title.localeCompare(a.title);
    case "updatedDesc":
    default:
      return b.updatedAt - a.updatedAt;
  }
}

/**
 * Gets the filtered and sorted list of prompts based on current search and sort settings
 * @returns {Array} Array of filtered and sorted prompt objects
 */
export function getVisiblePrompts() {
  const q = safeTrim(elements.search.value).toLowerCase();
  const mode = elements.sort.value;
  const filterMode = String(elements.filterRating?.value ?? "all");
  return sharedState.prompts
    .filter((p) => matchesSearch(p, q))
    .filter((p) => {
      const r = Math.max(0, Math.min(5, Math.trunc(Number(p.rating ?? 0))));
      if (filterMode === "all") return true;
      const target = Math.max(1, Math.min(5, Math.trunc(Number(filterMode))));
      return r === target;
    })
    .slice()
    .sort((a, b) => compare(a, b, mode));
}
