import { sharedState } from "./js/state.js";
import { getSystemTheme, getSavedTheme, applyTheme } from "./js/theme.js";
import { loadFromStorage } from "./js/storage.js";
import { setCounts } from "./js/search.js";
import { render } from "./js/render.js";
import { wireEvents } from "./js/events.js";

// Initialize the application
function init() {
  const saved = getSavedTheme();
  applyTheme(saved ?? getSystemTheme());

  if (!saved && window.matchMedia) {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (getSavedTheme()) return;
      applyTheme(getSystemTheme());
    };
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", onChange);
    } else if (typeof mq.addListener === "function") {
      mq.addListener(onChange);
    }
  }

  sharedState.prompts = loadFromStorage();
  setCounts();
  wireEvents();
  render();
}

init();
