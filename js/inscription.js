/**
 * Formulaire de pré-inscription : envoi à Netlify (email de notification à
 * l'école, déjà configuré côté Netlify Forms) ET, si Supabase est
 * configuré, enregistrement du dossier dans la table `inscriptions` pour
 * qu'il apparaisse dans /admin/dashboard.html. Affiche aussi le contact de
 * l'enseignant de la classe choisie une fois l'envoi confirmé.
 *
 * Dégradation : si Supabase n'est pas configuré, ou si l'insertion échoue,
 * l'envoi Netlify (et donc la notification par email à l'école) fonctionne
 * quand même — et si JavaScript est indisponible, le formulaire se soumet
 * nativement vers merci.html grâce à ses attributs data-netlify.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from "./supabase-config.js";

const CLASS_LABELS = {
  creche: "Crèche / Garderie",
  prematernelle: "Prématernelle",
  maternelle1: "Maternelle 1",
  maternelle2: "Maternelle 2",
  ci: "CI",
  cp: "CP",
  ce1: "CE1",
  ce2: "CE2",
  cm1: "CM1",
};

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

const form = document.querySelector("[data-inscription-form]");
if (form) {
  const status = form.parentElement.querySelector("[data-form-status]");
  const teacherBox = form.parentElement.querySelector("[data-teacher-contact]");
  const supabase = isSupabaseConfigured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

  form.addEventListener("submit", async (e) => {
    if (form.querySelector(":invalid")) return; // let native validation UI show
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;

    const formData = new FormData(form);
    const cycle = formData.get("cycle");

    const netlifySubmit = fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(formData).toString(),
    });

    const supabaseInsert = supabase
      ? supabase.from("inscriptions").insert({
          cycle,
          child_first_name: formData.get("enfant_prenom"),
          child_last_name: formData.get("enfant_nom"),
          child_birth_date: formData.get("date_naissance") || null,
          entry_term: formData.get("rentree"),
          parent_first_name: formData.get("parent_prenom"),
          parent_last_name: formData.get("parent_nom"),
          parent_email: formData.get("parent_email"),
          parent_phone: formData.get("parent_telephone"),
          message: formData.get("message") || null,
        })
      : Promise.resolve(null);

    const teacherLookup = supabase
      ? supabase.from("teachers").select("*").eq("class_key", cycle).limit(1).maybeSingle()
      : Promise.resolve({ data: null });

    const [netlifyResult, , teacherResult] = await Promise.allSettled([netlifySubmit, supabaseInsert, teacherLookup]);

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

    const teacher = teacherResult.status === "fulfilled" ? teacherResult.value?.data : null;
    if (teacher && (teacher.phone || teacher.email)) {
      teacherBox.innerHTML = `
        <p class="font-label-md text-label-md text-primary mb-1">Contact de l'enseignant(e) — ${CLASS_LABELS[cycle] || ""}</p>
        <p class="font-body-md text-body-md text-on-surface">${escapeHtml(teacher.teacher_name)}</p>
        <p class="font-body-md text-[14px] text-on-surface-variant mt-1">
          ${teacher.phone ? `<a class="hover:text-primary" href="tel:${escapeHtml(teacher.phone.replace(/\s+/g, ""))}">${escapeHtml(teacher.phone)}</a>` : ""}
          ${teacher.phone && teacher.email ? " · " : ""}
          ${teacher.email ? `<a class="hover:text-primary" href="mailto:${escapeHtml(teacher.email)}">${escapeHtml(teacher.email)}</a>` : ""}
        </p>
        <p class="font-body-md text-[13px] text-on-surface-variant mt-2">N'hésitez pas à le/la contacter pour toute question sur cette classe.</p>`;
      teacherBox.classList.remove("hidden");
    } else {
      teacherBox.innerHTML = `
        <p class="font-body-md text-body-md text-on-surface">Une question sur la classe choisie (${CLASS_LABELS[cycle] || ""}) en attendant notre retour ?</p>
        <p class="font-body-md text-[14px] text-on-surface-variant mt-1">Appelez le secrétariat au <a class="hover:text-primary" href="tel:0197919452">01 97 91 94 52</a>.</p>`;
      teacherBox.classList.remove("hidden");
    }

    status.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}
