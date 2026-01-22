import { sharedState, elements } from "../shared/state.js";
import { setCounts } from "./search.js";
import { addPrompt, deletePrompt, setPromptRating } from "./storage.js";
import { render } from "./render.js";
import { copyToClipboard } from "./clipboard.js";
import {
  exportPrompts,
  normalizeImported,
  mergeImported,
} from "./import-export.js";
import { toggleTheme } from "./theme.js";

/**
 * Shows a temporary toast notification to the user
 * @param {string} message - Message to display in the toast
 */
export function showToast(message) {
  if (!elements.toast) return;
  elements.toast.textContent = message;
  elements.toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => {
    elements.toast.hidden = true;
  }, 2200);
}

/**
 * Sets up all event listeners for the application UI
 * Handles form submission, search, sorting, deletion, copying, import/export, and theme toggling
 */
export function wireEvents() {
  elements.title.addEventListener("input", setCounts);
  elements.content.addEventListener("input", setCounts);

  elements.clear.addEventListener("click", () => {
    elements.form.reset();
    setCounts();
    elements.title.focus();
  });

  elements.form.addEventListener("submit", (e) => {
    e.preventDefault();
    const res = addPrompt(elements.title.value, elements.content.value);
    if (!res.ok) {
      showToast(res.error);
      return;
    }
    elements.form.reset();
    setCounts();
    render();
    showToast("Saved.");
    elements.title.focus();
  });

  elements.search.addEventListener("input", render);
  const syncRatingFilterStyle = () => {
    if (!elements.filterRating) return;
    const v = String(elements.filterRating.value ?? "all");
    elements.filterRating.classList.toggle("isChosen", v !== "all");
  };

  if (elements.filterRating) {
    syncRatingFilterStyle();
    elements.filterRating.addEventListener("change", () => {
      syncRatingFilterStyle();
      render();
    });
  }
  elements.sort.addEventListener("change", render);

  elements.list.addEventListener("click", async (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const li = e.target.closest(".item");
    if (!li) return;
    const id = li.dataset.id;
    const p = sharedState.prompts.find((x) => x.id === id);
    if (!p) return;

    if (btn.classList.contains("item__star")) {
      const rating = Number(btn.dataset.rating ?? 0);
      const ok = setPromptRating(id, rating);
      if (ok) {
        render();
        const next =
          sharedState.prompts.find((x) => x.id === id)?.rating ?? 0;
        showToast(`Rated ${next}★`);
      }
      return;
    }

    if (btn.classList.contains("item__delete")) {
      const ok = confirm(`Delete "${p.title}"? This cannot be undone.`);
      if (!ok) return;
      const removed = deletePrompt(id);
      if (removed) {
        render();
        showToast("Deleted.");
      }
      return;
    }

    if (btn.classList.contains("item__copy")) {
      const ok = await copyToClipboard(p.content);
      showToast(ok ? "Copied to clipboard." : "Could not copy.");
    }
  });

  const clearPreview = (ratingEl) => {
    if (!ratingEl) return;
    for (const el of ratingEl.querySelectorAll(".item__star")) {
      el.classList.remove("isHover");
    }
  };

  const setPreview = (ratingEl, n) => {
    if (!ratingEl) return;
    const v = Math.max(0, Math.min(5, Math.trunc(Number(n))));
    for (const el of ratingEl.querySelectorAll(".item__star")) {
      const r = Math.trunc(Number(el.dataset.rating ?? 0));
      el.classList.toggle("isHover", r > 0 && r <= v);
    }
  };

  // Hover/focus preview for stars (purely visual)
  elements.list.addEventListener("mouseover", (e) => {
    const star = e.target.closest(".item__star");
    if (!star) return;
    const ratingEl = star.closest(".item__rating");
    if (!ratingEl) return;
    setPreview(ratingEl, star.dataset.rating);
  });

  elements.list.addEventListener("mouseout", (e) => {
    const ratingEl = e.target.closest(".item__rating");
    if (!ratingEl) return;
    const next = e.relatedTarget;
    if (next && ratingEl.contains(next)) return;
    clearPreview(ratingEl);
  });

  elements.list.addEventListener("focusin", (e) => {
    const star = e.target.closest(".item__star");
    if (!star) return;
    const ratingEl = star.closest(".item__rating");
    if (!ratingEl) return;
    setPreview(ratingEl, star.dataset.rating);
  });

  elements.list.addEventListener("focusout", (e) => {
    const ratingEl = e.target.closest(".item__rating");
    if (!ratingEl) return;
    const next = e.relatedTarget;
    if (next && ratingEl.contains(next)) return;
    clearPreview(ratingEl);
  });

  elements.exportBtn.addEventListener("click", () => {
    if (sharedState.prompts.length === 0) {
      showToast("Nothing to export yet.");
      return;
    }
    exportPrompts();
    showToast("Export started.");
  });

  elements.importFile.addEventListener("change", async () => {
    const file = elements.importFile.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const incoming = normalizeImported(data);
      if (incoming.length === 0) {
        showToast("Import file had no valid prompts.");
        elements.importFile.value = "";
        return;
      }
      const { added, updated } = mergeImported(incoming);
      render();
      showToast(`Imported: ${added} added, ${updated} updated.`);
    } catch {
      showToast("Import failed. Please choose a valid JSON file.");
    } finally {
      elements.importFile.value = "";
    }
  });

  elements.themeBtn.addEventListener("click", toggleTheme);
}
