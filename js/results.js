/**
 * Charge la page "Résultats & Distinctions" depuis Supabase : palmarès du
 * personnel (staff_distinctions) et tableaux de félicitations/encouragements/
 * projets de classe par classe (class_recognitions). Si Supabase n'est pas
 * configuré, ou si la requête échoue/est vide, un message "à venir" est
 * affiché — il n'y a pas de contenu statique de repli ici (données propres à
 * chaque année scolaire).
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from "./supabase-config.js";

if (isSupabaseConfigured) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  loadStaffDistinctions(supabase);
  loadClassRecognitions(supabase);
} else {
  showEmpty("staff-distinctions", "Le palmarès sera bientôt disponible.");
  showEmpty("class-tableaux", "Les tableaux de félicitations seront bientôt disponibles.");
  showEmpty("class-projects", "Les projets de classe seront bientôt disponibles.");
}

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
const CLASS_ORDER = Object.keys(CLASS_LABELS);

const RANK_ACCENTS = [
  { border: "border-pink", chip: "bg-pink text-on-pink", badgeBg: "bg-pink/15" },
  { border: "border-citron", chip: "bg-citron text-on-citron", badgeBg: "bg-citron/15" },
  { border: "border-sky", chip: "bg-sky text-on-sky", badgeBg: "bg-sky/15" },
  { border: "border-orange", chip: "bg-orange text-on-orange", badgeBg: "bg-orange/15" },
];

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

function showEmpty(containerId, message) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = `<p class="font-body-md text-body-md text-on-surface-variant text-center py-8 col-span-full">${escapeHtml(message)}</p>`;
}

async function loadStaffDistinctions(supabase) {
  const container = document.getElementById("staff-distinctions");
  if (!container) return;

  const { data, error } = await supabase
    .from("staff_distinctions")
    .select("*")
    .eq("published", true)
    .order("rank", { ascending: true });

  if (error || !data || !data.length) {
    showEmpty("staff-distinctions", "Le palmarès du personnel sera bientôt disponible.");
    return;
  }

  container.innerHTML = data
    .map((s, i) => {
      const accent = RANK_ACCENTS[i % RANK_ACCENTS.length];
      const avatar = s.photo_url
        ? `<img alt="${escapeHtml(s.staff_name)}" class="w-14 h-14 rounded-full object-cover shrink-0" src="${escapeHtml(s.photo_url)}" />`
        : `<div class="w-14 h-14 rounded-full ${accent.chip} flex items-center justify-center shrink-0"><span class="material-symbols-outlined">person</span></div>`;
      return `
      <div class="bg-surface rounded-2xl p-6 shadow-ambient border-t-4 ${accent.border} flex items-center gap-4" data-reveal>
        ${avatar}
        <div class="min-w-0">
          <span class="font-label-md text-[12px] ${accent.badgeBg} text-on-surface-variant px-2 py-0.5 rounded-full inline-block mb-1">Prix n°${i + 1}</span>
          <p class="font-headline-sm text-headline-sm text-on-surface truncate">${escapeHtml(s.staff_name)}</p>
          <p class="font-body-md text-[14px] text-on-surface-variant">${escapeHtml(s.role_label)}</p>
        </div>
      </div>`;
    })
    .join("");

  container.querySelectorAll("[data-reveal]").forEach((el) => {
    window.__observeReveal ? window.__observeReveal(el) : el.classList.add("is-revealed");
  });
}

function groupByClass(items) {
  const groups = {};
  items.forEach((item) => {
    if (!groups[item.class_key]) groups[item.class_key] = [];
    groups[item.class_key].push(item);
  });
  return groups;
}

const CATEGORY_META = {
  felicitation: { label: "Félicitation", chip: "bg-primary-container text-on-primary-container" },
  encouragement: { label: "Encouragement", chip: "bg-citron/15 text-citron" },
};

function renderStudentList(items) {
  return items
    .map(
      (item, i) => `
    <div class="flex items-center gap-3 bg-surface-container-low rounded-full pl-2 pr-4 py-2">
      <span class="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-md text-[12px] shrink-0">${i + 1}</span>
      <span class="font-body-md text-body-md text-on-surface">${escapeHtml(item.student_name)}</span>
    </div>`
    )
    .join("");
}

async function loadClassRecognitions(supabase) {
  const tableauxContainer = document.getElementById("class-tableaux");
  const projectsContainer = document.getElementById("class-projects");
  if (!tableauxContainer && !projectsContainer) return;

  const { data, error } = await supabase
    .from("class_recognitions")
    .select("*")
    .eq("published", true)
    .order("class_key", { ascending: true })
    .order("rank", { ascending: true });

  if (error || !data || !data.length) {
    showEmpty("class-tableaux", "Les tableaux de félicitations et encouragements seront bientôt disponibles.");
    showEmpty("class-projects", "Les projets de classe seront bientôt disponibles.");
    return;
  }

  const tableauxItems = data.filter((d) => d.category === "felicitation" || d.category === "encouragement");
  const projectItems = data.filter((d) => d.category === "projet_classe");

  if (tableauxContainer) {
    const byClass = groupByClass(tableauxItems);
    const classes = CLASS_ORDER.filter((c) => byClass[c]);
    if (!classes.length) {
      showEmpty("class-tableaux", "Les tableaux de félicitations et encouragements seront bientôt disponibles.");
    } else {
      tableauxContainer.innerHTML = classes
        .map((classKey) => {
          const items = byClass[classKey];
          const felicitations = items.filter((i) => i.category === "felicitation").sort((a, b) => a.rank - b.rank);
          const encouragements = items.filter((i) => i.category === "encouragement").sort((a, b) => a.rank - b.rank);
          return `
          <div class="bg-surface rounded-2xl p-6 md:p-8 shadow-ambient" data-reveal>
            <p class="font-label-md text-label-md text-primary mb-4">${escapeHtml(CLASS_LABELS[classKey] || classKey)}</p>
            ${
              felicitations.length
                ? `<div class="mb-5">
                    <div class="flex items-center gap-2 mb-3">
                      <span class="px-3 py-1 ${CATEGORY_META.felicitation.chip} rounded-full font-label-md text-[12px]">${CATEGORY_META.felicitation.label}</span>
                      <span class="font-body-md text-[13px] text-on-surface-variant">${felicitations.length} élève${felicitations.length > 1 ? "s" : ""}</span>
                    </div>
                    <div class="flex flex-col gap-2">${renderStudentList(felicitations)}</div>
                  </div>`
                : ""
            }
            ${
              encouragements.length
                ? `<div>
                    <div class="flex items-center gap-2 mb-3">
                      <span class="px-3 py-1 ${CATEGORY_META.encouragement.chip} rounded-full font-label-md text-[12px]">${CATEGORY_META.encouragement.label}</span>
                      <span class="font-body-md text-[13px] text-on-surface-variant">${encouragements.length} élève${encouragements.length > 1 ? "s" : ""}</span>
                    </div>
                    <div class="flex flex-col gap-2">${renderStudentList(encouragements)}</div>
                  </div>`
                : ""
            }
          </div>`;
        })
        .join("");
    }
  }

  if (projectsContainer) {
    const byClass = groupByClass(projectItems);
    const classes = CLASS_ORDER.filter((c) => byClass[c]);
    if (!classes.length) {
      showEmpty("class-projects", "Les projets de classe seront bientôt disponibles.");
    } else {
      projectsContainer.innerHTML = classes
        .map((classKey, i) => {
          const items = byClass[classKey].sort((a, b) => a.rank - b.rank);
          const accent = RANK_ACCENTS[i % RANK_ACCENTS.length];
          return `
          <div class="bg-surface rounded-2xl p-6 shadow-ambient border-l-4 ${accent.border}" data-reveal>
            <p class="font-label-md text-label-md text-on-surface mb-1">${escapeHtml(CLASS_LABELS[classKey] || classKey)}</p>
            <p class="font-body-md text-[13px] text-on-surface-variant mb-4">${items.length} élève${items.length > 1 ? "s" : ""}</p>
            <div class="flex flex-col gap-2">${renderStudentList(items)}</div>
          </div>`;
        })
        .join("");
    }
  }

  [tableauxContainer, projectsContainer].forEach((container) => {
    if (!container) return;
    container.querySelectorAll("[data-reveal]").forEach((el) => {
      window.__observeReveal ? window.__observeReveal(el) : el.classList.add("is-revealed");
    });
  });
}
