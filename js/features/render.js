import { sharedState, elements } from "../shared/state.js";
import { getVisiblePrompts } from "./search.js";
import { documentRef } from "../shared/domDocument.js";

/**
 * Formats a timestamp into a human-readable date/time string
 * @param {number} ts - Timestamp in milliseconds
 * @returns {string} Formatted date/time string
 */
export function formatTime(ts) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(ts));
  } catch {
    return new Date(ts).toLocaleString();
  }
}

/**
 * Renders the current list of prompts in the UI, applying search/filter/sort
 * Updates the prompt list, count, and handles empty states
 */
export function render() {
  const visible = getVisiblePrompts();
  elements.list.innerHTML = "";

  elements.count.textContent = String(sharedState.prompts.length);
  elements.empty.hidden = sharedState.prompts.length !== 0;

  if (visible.length === 0) {
    if (sharedState.prompts.length === 0) return;
    const li = documentRef.createElement("li");
    li.className = "empty";
    li.innerHTML = `
      <div class="empty__title">No matches</div>
      <div class="empty__text">Try a different search.</div>
    `;
    elements.list.appendChild(li);
    return;
  }

  for (const p of visible) {
    const node = elements.tpl.content.firstElementChild.cloneNode(true);
    node.dataset.id = p.id;
    node.querySelector(".item__title").textContent = p.title;
    node.querySelector(".item__meta").textContent = `Updated ${formatTime(
      p.updatedAt
    )}`;
    node.querySelector(".item__content").textContent = p.content;

    const rating = Math.max(0, Math.min(5, Math.trunc(Number(p.rating ?? 0))));
    const stars = node.querySelectorAll(".item__star");
    for (const el of stars) {
      const n = Math.trunc(Number(el.dataset.rating ?? 0));
      const filled = n > 0 && n <= rating;
      const selected = n > 0 && n === rating;
      el.classList.toggle("isFilled", filled);
      el.setAttribute("aria-checked", selected ? "true" : "false");
      el.title = `Rate ${n} star${n === 1 ? "" : "s"}`;
    }
    elements.list.appendChild(node);
  }
}
