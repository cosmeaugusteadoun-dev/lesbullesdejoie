/**
 * Page Tarifs : formulaire d'accès (nom + téléphone) envoyé à Netlify (email
 * de notification) ET, si Supabase est configuré, enregistré dans la table
 * `pricing_requests` pour apparaître dans /admin/dashboard.html. Une fois
 * l'envoi confirmé, l'étape 2 (détail des tarifs) est révélée sans quitter
 * la page.
 *
 * Dégradation : si JavaScript est indisponible, le formulaire se soumet
 * nativement vers merci.html grâce à ses attributs data-netlify (le détail
 * des tarifs ne s'affiche alors pas en ligne, mais la demande est bien reçue).
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from "./supabase-config.js";

const form = document.querySelector("[data-tarifs-form]");
if (form) {
  const status = form.closest("section").querySelector("[data-form-status]");
  const step1 = document.querySelector('[data-step="1"]');
  const step2 = document.querySelector('[data-step="2"]');
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
      ? supabase.from("pricing_requests").insert({
          full_name: formData.get("nom_prenoms"),
          phone: formData.get("telephone"),
        })
      : Promise.resolve(null);

    const [netlifyResult] = await Promise.allSettled([netlifySubmit, supabaseInsert]);

    submitBtn.disabled = false;

    if (netlifyResult.status !== "fulfilled") {
      status.classList.add("is-visible");
      return;
    }

    if (step1 && step2) {
      step1.classList.add("hidden");
      step2.classList.remove("hidden");
      step2.querySelectorAll("[data-reveal]").forEach((el) => {
        window.__observeReveal ? window.__observeReveal(el) : el.classList.add("is-revealed");
      });
      step2.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}
