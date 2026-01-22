import { documentRef } from "./domDocument.js";

export const STORAGE_KEY = "prompt-library:v1";
export const THEME_KEY = "prompt-library:theme";

export const elements = {
  form: documentRef.getElementById("promptForm"),
  title: documentRef.getElementById("title"),
  content: documentRef.getElementById("content"),
  titleCount: documentRef.getElementById("titleCount"),
  contentCount: documentRef.getElementById("contentCount"),
  clear: documentRef.getElementById("btnClear"),

  list: documentRef.getElementById("promptList"),
  empty: documentRef.getElementById("emptyState"),
  count: documentRef.getElementById("promptCount"),

  search: documentRef.getElementById("search"),
  filterRating: documentRef.getElementById("filterRating"),
  sort: documentRef.getElementById("sort"),

  tpl: documentRef.getElementById("promptItemTemplate"),
  toast: documentRef.getElementById("toast"),

  exportBtn: documentRef.getElementById("btnExport"),
  importFile: documentRef.getElementById("fileImport"),

  themeBtn: documentRef.getElementById("btnTheme"),
  themeLabel: documentRef.getElementById("themeLabel"),
};

export const sharedState = {
  prompts: [],
};
