import { documentRef, bodyRef } from "../shared/domDocument.js";
import { navigatorRef } from "../shared/navigatorGlobals.js";

/**
 * Copies text to the system clipboard using modern API with fallback
 * @param {string} text - Text to copy to clipboard
 * @returns {Promise<boolean>} True if copy was successful, false otherwise
 */
export async function copyToClipboard(text) {
  try {
    await navigatorRef.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = documentRef.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      bodyRef.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = documentRef.execCommand("copy");
      bodyRef.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}
