/* Prompt Library — LocalStorage-backed CRUD (single-file version) */

const STORAGE_KEY = "prompt-library:v1";
const THEME_KEY = "prompt-library:theme"; // "light" | "dark"

/** @typedef {{ id: string, title: string, content: string, createdAt: number, updatedAt: number }} Prompt */

const els = {
  form: document.getElementById("promptForm"),
  title: document.getElementById("title"),
  content: document.getElementById("content"),
  titleCount: document.getElementById("titleCount"),
  contentCount: document.getElementById("contentCount"),
  clear: document.getElementById("btnClear"),

  list: document.getElementById("promptList"),
  empty: document.getElementById("emptyState"),
  count: document.getElementById("promptCount"),

  search: document.getElementById("search"),
  sort: document.getElementById("sort"),

  tpl: document.getElementById("promptItemTemplate"),
  toast: document.getElementById("toast"),

  exportBtn: document.getElementById("btnExport"),
  importFile: document.getElementById("fileImport"),

  themeBtn: document.getElementById("btnTheme"),
  themeLabel: document.getElementById("themeLabel"),
};

/** @type {Prompt[]} */
let prompts = [];

function now() {
  return Date.now();
}

function uid() {
  return `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

function safeTrim(s) {
  return (s ?? "").toString().trim();
}

function formatTime(ts) {
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

function showToast(message) {
  if (!els.toast) return;
  els.toast.textContent = message;
  els.toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => {
    els.toast.hidden = true;
  }, 2200);
}

// Theme
function getSystemTheme() {
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getSavedTheme() {
  const t = safeTrim(localStorage.getItem(THEME_KEY));
  return t === "dark" || t === "light" ? t : null;
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  if (els.themeLabel) els.themeLabel.textContent = theme === "dark" ? "Dark" : "Light";
}

function setTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
  applyTheme(theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || getSystemTheme();
  setTheme(current === "dark" ? "light" : "dark");
}

// Storage
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
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
      }))
      .filter((p) => p.title && p.content);
  } catch {
    return [];
  }
}

function saveToStorage(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function setCounts() {
  els.titleCount.textContent = String(els.title.value.length);
  els.contentCount.textContent = String(els.content.value.length);
}

function matchesSearch(prompt, q) {
  if (!q) return true;
  const hay = `${prompt.title}\n${prompt.content}`.toLowerCase();
  return hay.includes(q);
}

function compare(a, b, mode) {
  switch (mode) {
    case "createdDesc":
      return b.createdAt - a.createdAt;
    case "titleAsc":
      return a.title.localeCompare(b.title);
    case "titleDesc":
      return b.title.localeCompare(a.title);
    case "updatedDesc":
    default:
      return b.updatedAt - a.updatedAt;
  }
}

function getVisiblePrompts() {
  const q = safeTrim(els.search.value).toLowerCase();
  const mode = els.sort.value;
  return prompts.filter((p) => matchesSearch(p, q)).slice().sort((a, b) => compare(a, b, mode));
}

function render() {
  const visible = getVisiblePrompts();
  els.list.innerHTML = "";

  els.count.textContent = String(prompts.length);
  els.empty.hidden = prompts.length !== 0;

  if (visible.length === 0) {
    if (prompts.length === 0) return;
    const li = document.createElement("li");
    li.className = "empty";
    li.innerHTML = `
      <div class="empty__title">No matches</div>
      <div class="empty__text">Try a different search.</div>
    `;
    els.list.appendChild(li);
    return;
  }

  for (const p of visible) {
    const node = els.tpl.content.firstElementChild.cloneNode(true);
    node.dataset.id = p.id;
    node.querySelector(".item__title").textContent = p.title;
    node.querySelector(".item__meta").textContent = `Updated ${formatTime(p.updatedAt)}`;
    node.querySelector(".item__content").textContent = p.content;
    els.list.appendChild(node);
  }
}

function addPrompt(title, content) {
  const t = safeTrim(title);
  const c = safeTrim(content);
  if (!t || !c) return { ok: false, error: "Please enter both a title and content." };

  /** @type {Prompt} */
  const p = { id: uid(), title: t.slice(0, 80), content: c.slice(0, 8000), createdAt: now(), updatedAt: now() };
  prompts = [p, ...prompts];
  saveToStorage(prompts);
  return { ok: true, prompt: p };
}

function deletePrompt(id) {
  const before = prompts.length;
  prompts = prompts.filter((p) => p.id !== id);
  if (prompts.length === before) return false;
  saveToStorage(prompts);
  return true;
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

// Export / Import
function exportPrompts() {
  const payload = {
    schema: "prompt-library:v1",
    exportedAt: now(),
    prompts,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `prompt-library-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function normalizeImported(data) {
  const arr = Array.isArray(data) ? data : Array.isArray(data?.prompts) ? data.prompts : [];
  const cleaned = arr
    .filter(Boolean)
    .map((p) => ({
      id: String(p.id ?? uid()),
      title: safeTrim(p.title).slice(0, 80),
      content: safeTrim(p.content).slice(0, 8000),
      createdAt: Number(p.createdAt ?? now()),
      updatedAt: Number(p.updatedAt ?? p.createdAt ?? now()),
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

function mergeImported(incoming) {
  const byId = new Map(prompts.map((p) => [p.id, p]));
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

  prompts = Array.from(byId.values());
  saveToStorage(prompts);
  return { added, updated };
}

function wireEvents() {
  els.title.addEventListener("input", setCounts);
  els.content.addEventListener("input", setCounts);

  els.clear.addEventListener("click", () => {
    els.form.reset();
    setCounts();
    els.title.focus();
  });

  els.form.addEventListener("submit", (e) => {
    e.preventDefault();
    const res = addPrompt(els.title.value, els.content.value);
    if (!res.ok) {
      showToast(res.error);
      return;
    }
    els.form.reset();
    setCounts();
    render();
    showToast("Saved.");
    els.title.focus();
  });

  els.search.addEventListener("input", render);
  els.sort.addEventListener("change", render);

  els.list.addEventListener("click", async (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const li = e.target.closest(".item");
    if (!li) return;
    const id = li.dataset.id;
    const p = prompts.find((x) => x.id === id);
    if (!p) return;

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

  els.exportBtn.addEventListener("click", () => {
    if (prompts.length === 0) {
      showToast("Nothing to export yet.");
      return;
    }
    exportPrompts();
    showToast("Export started.");
  });

  els.importFile.addEventListener("change", async () => {
    const file = els.importFile.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const incoming = normalizeImported(data);
      if (incoming.length === 0) {
        showToast("Import file had no valid prompts.");
        els.importFile.value = "";
        return;
      }
      const { added, updated } = mergeImported(incoming);
      render();
      showToast(`Imported: ${added} added, ${updated} updated.`);
    } catch {
      showToast("Import failed. Please choose a valid JSON file.");
    } finally {
      els.importFile.value = "";
    }
  });

  els.themeBtn.addEventListener("click", toggleTheme);
}

function init() {
  const saved = getSavedTheme();
  applyTheme(saved ?? getSystemTheme());

  // Follow system changes if the user hasn't chosen a theme.
  if (!saved && window.matchMedia) {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (getSavedTheme()) return;
      applyTheme(getSystemTheme());
    };
    if (typeof mq.addEventListener === "function") mq.addEventListener("change", onChange);
    else if (typeof mq.addListener === "function") mq.addListener(onChange);
  }

  prompts = loadFromStorage();
  setCounts();
  wireEvents();
  render();
}

init();


