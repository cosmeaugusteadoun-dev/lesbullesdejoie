/**
 * Icône "œil" pour afficher/masquer un mot de passe. Marquage attendu :
 * <div class="relative">
 *   <input type="password" ... />
 *   <button data-password-toggle type="button">
 *     <span class="material-symbols-outlined">visibility</span>
 *   </button>
 * </div>
 * Le bouton doit suivre immédiatement l'input dans le HTML.
 */
export function initPasswordToggles(root = document) {
  root.querySelectorAll("[data-password-toggle]").forEach((btn) => {
    if (btn.dataset.toggleReady) return;
    btn.dataset.toggleReady = "true";

    const input = btn.previousElementSibling;
    if (!input || input.tagName !== "INPUT") return;

    btn.addEventListener("click", () => {
      const showing = input.type === "text";
      input.type = showing ? "password" : "text";
      btn.querySelector(".material-symbols-outlined").textContent = showing ? "visibility" : "visibility_off";
      btn.setAttribute("aria-label", showing ? "Afficher le mot de passe" : "Masquer le mot de passe");
      input.focus({ preventScroll: true });
    });
  });
}
