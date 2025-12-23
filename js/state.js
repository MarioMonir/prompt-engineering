// Shared references for the DOM and persisted state
export const STORAGE_KEY = "prompt-library:v1";
export const THEME_KEY = "prompt-library:theme";

export const elements = {
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

export const sharedState = {
  prompts: [],
};
