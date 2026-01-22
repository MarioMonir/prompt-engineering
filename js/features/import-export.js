import { sharedState } from "../shared/state.js";
import { saveToStorage, safeTrim, uid, now, clampRating } from "./storage.js";
import { documentRef, bodyRef } from "../shared/domDocument.js";

/**
 * Exports all prompts to a downloadable JSON file
 * Creates a blob and triggers a download with the current date in filename
 */
export function exportPrompts() {
  const payload = {
    schema: "prompt-library:v1",
    exportedAt: now(),
    prompts: sharedState.prompts,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = documentRef.createElement("a");
  a.href = url;
  a.download = `prompt-library-${new Date().toISOString().slice(0, 10)}.json`;
  bodyRef.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Normalizes and validates imported data from various formats
 * @param {*} data - Raw imported data (array or object with prompts property)
 * @returns {Array} Array of validated and normalized prompt objects
 */
export function normalizeImported(data) {
  const arr = Array.isArray(data)
    ? data
    : Array.isArray(data?.prompts)
    ? data.prompts
    : [];
  const cleaned = arr
    .filter(Boolean)
    .map((p) => ({
      id: String(p.id ?? uid()),
      title: safeTrim(p.title).slice(0, 80),
      content: safeTrim(p.content).slice(0, 8000),
      createdAt: Number(p.createdAt ?? now()),
      updatedAt: Number(p.updatedAt ?? p.createdAt ?? now()),
      rating: clampRating(p.rating ?? 0),
    }))
    .filter((p) => p.title && p.content);

  const seen = new Set();
  return cleaned.map((p) => {
    let id = p.id;
    while (seen.has(id)) id = uid();
    seen.add(id);
    return { ...p, id };
  });
}

/**
 * Merges imported prompts with existing ones, updating newer versions and adding new ones
 * @param {Array} incoming - Array of normalized prompt objects to import
 * @returns {Object} Result object with counts: {added: number, updated: number}
 */
export function mergeImported(incoming) {
  const byId = new Map(sharedState.prompts.map((p) => [p.id, p]));
  let added = 0;
  let updated = 0;

  for (const p of incoming) {
    const existing = byId.get(p.id);
    if (!existing) {
      byId.set(p.id, p);
      added += 1;
      continue;
    }
    if ((p.updatedAt ?? 0) > (existing.updatedAt ?? 0)) {
      byId.set(p.id, p);
      updated += 1;
    }
  }

  sharedState.prompts = Array.from(byId.values());
  saveToStorage(sharedState.prompts);
  return { added, updated };
}
