/**
 * Formulaire de contact : envoi à Netlify (email de notification à l'école,
 * déjà configuré côté Netlify Forms) ET, si Supabase est configuré,
 * enregistrement du message dans la table `contact_messages` pour qu'il
 * apparaisse dans /admin/dashboard.html.
 *
 * Dégradation : si Supabase n'est pas configuré, ou si l'insertion échoue,
 * l'envoi Netlify (et donc la notification par email à l'école) fonctionne
 * quand même — et si JavaScript est indisponible, le formulaire se soumet
 * nativement vers merci.html grâce à ses attributs data-netlify.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from "./supabase-config.js";

const form = document.querySelector("[data-contact-form]");
if (form) {
  const status = form.parentElement.querySelector("[data-form-status]");
  const supabase = isSupabaseConfigured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

  form.addEventListener("submit", async (e) => {
    if (form.querySelector(":invalid")) return; // let native validation UI show
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;

    const formData = new FormData(form);

    const netlifySubmit = fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(formData).toString(),
    });

    const supabaseInsert = supabase
      ? supabase.from("contact_messages").insert({
          first_name: formData.get("prenom"),
          last_name: formData.get("nom"),
          phone: formData.get("telephone"),
          email: formData.get("email") || null,
          message: formData.get("message"),
        })
      : Promise.resolve(null);

    const [netlifyResult] = await Promise.allSettled([netlifySubmit, supabaseInsert]);

    submitBtn.disabled = false;

    if (netlifyResult.status !== "fulfilled") {
      status.classList.add("is-visible");
      status.querySelector("span:last-child").textContent =
        "Une erreur est survenue lors de l'envoi. Merci de réessayer ou de nous appeler directement.";
      return;
    }

    form.reset();
    form.hidden = true;
    status.classList.add("is-visible");
    status.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}
