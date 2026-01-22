import { STORAGE_KEY, sharedState } from "../shared/state.js";
import { windowRef } from "../shared/windowGlobals.js";

/**
 * Returns the current timestamp in milliseconds since Unix epoch
 * @returns {number} Current timestamp
 */
export function now() {
  return Date.now();
}

/**
 * Normalizes a rating value into an integer between 0 and 5
 * @param {*} n - Rating value (any type)
 * @returns {number} Integer rating in range 0..5
 */
export function clampRating(n) {
  const v = Math.trunc(Number(n));
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(5, v));
}

/**
 * Generates a unique ID for prompts using timestamp and random string
 * @returns {string} Unique identifier starting with 'p_'
 */
export function uid() {
  return `p_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

/**
 * Safely trims whitespace from a value, handling null/undefined
 * @param {*} s - Value to trim
 * @returns {string} Trimmed string, empty string if null/undefined
 */
export function safeTrim(s) {
  return (s ?? "").toString().trim();
}

/**
 * Loads prompts from localStorage and validates/normalizes the data
 * @returns {Array} Array of validated prompt objects
 */
export function loadFromStorage() {
  try {
    const raw = windowRef.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(Boolean)
      .map((p) => ({
        id: String(p.id ?? uid()),
        title: String(p.title ?? "").slice(0, 80),
        content: String(p.content ?? "").slice(0, 8000),
        createdAt: Number(p.createdAt ?? now()),
        updatedAt: Number(p.updatedAt ?? p.createdAt ?? now()),
        rating: clampRating(p.rating ?? 0),
      }))
      .filter((p) => p.title && p.content);
  } catch {
    return [];
  }
}

/**
 * Saves the prompts array to localStorage
 * @param {Array} list - Array of prompt objects to save
 */
export function saveToStorage(list) {
  windowRef.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

/**
 * Creates and adds a new prompt to the collection
 * @param {string} title - Prompt title
 * @param {string} content - Prompt content
 * @returns {Object} Result object with {ok: boolean, error?: string, prompt?: Object}
 */
export function addPrompt(title, content) {
  const t = safeTrim(title);
  const c = safeTrim(content);
  if (!t || !c)
    return { ok: false, error: "Please enter both a title and content." };

  const p = {
    id: uid(),
    title: t.slice(0, 80),
    content: c.slice(0, 8000),
    createdAt: now(),
    updatedAt: now(),
    rating: 0,
  };
  const newPrompts = [p, ...sharedState.prompts];
  sharedState.prompts = newPrompts;
  saveToStorage(newPrompts);
  return { ok: true, prompt: p };
}

/**
 * Sets a prompt rating (0..5). If the same rating is clicked again, clears to 0.
 * @param {string} id - Prompt ID
 * @param {number} rating - New rating (0..5)
 * @returns {boolean} True if prompt was found (and rating applied), else false
 */
export function setPromptRating(id, rating) {
  const next = clampRating(rating);
  const idx = sharedState.prompts.findIndex((p) => p.id === id);
  if (idx === -1) return false;

  const current = clampRating(sharedState.prompts[idx].rating ?? 0);
  const value = next;
  if (value === current) return true;

  const updated = {
    ...sharedState.prompts[idx],
    rating: value,
    updatedAt: now(),
  };

  const newPrompts = sharedState.prompts.slice();
  newPrompts[idx] = updated;
  sharedState.prompts = newPrompts;
  saveToStorage(newPrompts);
  return true;
}

/**
 * Removes a prompt from the collection by ID
 * @param {string} id - Prompt ID to delete
 * @returns {boolean} True if prompt was found and deleted, false otherwise
 */
export function deletePrompt(id) {
  const before = sharedState.prompts.length;
  const newPrompts = sharedState.prompts.filter((p) => p.id !== id);
  if (newPrompts.length === before) return false;
  sharedState.prompts = newPrompts;
  saveToStorage(newPrompts);
  return true;
}
