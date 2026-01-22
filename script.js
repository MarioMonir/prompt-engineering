import { sharedState } from "./js/shared/state.js";
import {
  getSystemTheme,
  getSavedTheme,
  applyTheme,
} from "./js/features/theme.js";
import { loadFromStorage } from "./js/features/storage.js";
import { setCounts } from "./js/features/search.js";
import { render } from "./js/features/render.js";
import { wireEvents } from "./js/features/events.js";

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
