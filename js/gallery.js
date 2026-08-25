/**
 * Charge la galerie (photos & vidéos) depuis Supabase — la grille complète
 * de galerie.html, et l'aperçu "Instants de Joie" de vie-scolaire.html (les
 * 4 médias les plus récents). Si Supabase n'est pas configuré, ou si la
 * requête échoue/est vide, la grille statique déjà présente dans la page
 * reste affichée telle quelle.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from "./supabase-config.js";

if (isSupabaseConfigured) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  loadGallery(supabase);
  loadJoyPreview(supabase);
  loadCycleVideos(supabase);
}

const CYCLE_LABELS = {
  creche: "Crèche",
  maternelle: "Maternelle",
  primaire: "Primaire",
  "vie-scolaire": "Vie Scolaire",
};
const CYCLE_ORDER = ["creche", "maternelle", "primaire", "vie-scolaire"];

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

// Taille de tuile variable pour garder un rendu "mosaïque" vivant, comme la
// grille statique d'origine (une grande, quelques larges, le reste carré).
const TILE_SPANS = ["col-span-2 row-span-2", "", "", "col-span-2", "", "", "", "col-span-2", "", ""];

function renderTile(item, span, withCategory) {
  const caption = item.caption || "";
  const heightClass = span.includes("row-span-2") ? "min-h-[300px]" : "h-48";
  const categoryAttr = withCategory ? ` data-category="${escapeHtml(item.category)}"` : "";

  if (item.media_type === "video") {
    return `
    <div class="gallery-item ${span} rounded-xl shadow-sm relative"${categoryAttr} data-lightbox-src="${escapeHtml(item.file_path)}" data-lightbox-alt="${escapeHtml(caption)}" data-lightbox-type="video" data-reveal>
      <video class="w-full h-full ${heightClass} object-cover rounded-xl" muted playsinline preload="metadata" src="${escapeHtml(item.file_path)}#t=0.5"></video>
      <span class="material-symbols-outlined absolute inset-0 m-auto text-5xl text-white drop-shadow-lg pointer-events-none flex items-center justify-center">play_circle</span>
    </div>`;
  }

  return `
  <div class="gallery-item ${span} rounded-xl shadow-sm"${categoryAttr} data-lightbox-src="${escapeHtml(item.file_path)}" data-lightbox-alt="${escapeHtml(caption)}" data-reveal>
    <img alt="${escapeHtml(caption)}" class="w-full h-full ${heightClass} object-cover rounded-xl" src="${escapeHtml(item.file_path)}" />
  </div>`;
}

function activateReveal(container) {
  container.querySelectorAll("[data-reveal]").forEach((el) => {
    window.__observeReveal ? window.__observeReveal(el) : el.classList.add("is-revealed");
  });
}

async function loadGallery(supabase) {
  const grid = document.getElementById("gallery-grid");
  if (!grid) return;

  const { data, error } = await supabase
    .from("gallery_items")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  // Que ce soit un succès, une erreur ou une réponse vide, la grille (statique
  // de secours, ou fraîchement remplie ci-dessous) doit redevenir visible —
  // sinon elle resterait cachée derrière le chargement indéfiniment.
  if (error || !data || !data.length) {
    grid.classList.add("is-loaded");
    return;
  }

  grid.innerHTML = data.map((item, i) => renderTile(item, TILE_SPANS[i % TILE_SPANS.length], true)).join("");
  grid.classList.add("is-loaded");
  activateReveal(grid);
}

// "Instants de Joie" sur vie-scolaire.html : un aperçu des 4 médias les plus
// récents de la même galerie, dans la même mosaïque — gérée uniquement
// depuis l'onglet Galerie de l'admin, pas séparément.
async function loadJoyPreview(supabase) {
  const grid = document.getElementById("joy-preview-grid");
  if (!grid) return;

  const { data, error } = await supabase
    .from("gallery_items")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(4);

  if (error || !data || !data.length) {
    grid.classList.add("is-loaded");
    return;
  }

  grid.innerHTML = data.map((item, i) => renderTile(item, TILE_SPANS[i % TILE_SPANS.length], false)).join("");
  grid.classList.add("is-loaded");
  activateReveal(grid);
}

// "Vidéos par cycle" sur pedagogie.html : la vidéo la plus récente de chaque
// catégorie de la Galerie (même source que galerie.html et l'admin).
async function loadCycleVideos(supabase) {
  const grid = document.getElementById("cycle-videos-grid");
  if (!grid) return;

  const { data, error } = await supabase
    .from("gallery_items")
    .select("*")
    .eq("media_type", "video")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error || !data || !data.length) {
    grid.closest("[data-cycle-videos-section]")?.classList.add("hidden");
    return;
  }

  const latestByCycle = {};
  data.forEach((item) => {
    if (!latestByCycle[item.category]) latestByCycle[item.category] = item;
  });

  const cycles = CYCLE_ORDER.filter((c) => latestByCycle[c]);
  if (!cycles.length) {
    grid.closest("[data-cycle-videos-section]")?.classList.add("hidden");
    return;
  }

  grid.innerHTML = cycles
    .map((cycle) => {
      const item = latestByCycle[cycle];
      const title = item.caption || CYCLE_LABELS[cycle];
      return `
      <div class="bg-surface rounded-2xl p-5 shadow-ambient" data-lightbox-src="${escapeHtml(item.file_path)}" data-lightbox-alt="${escapeHtml(title)}" data-lightbox-type="video" data-reveal>
        <div class="inline-flex items-center gap-2 px-3 py-1 bg-primary-container text-on-primary-container rounded-full font-label-md text-[12px] mb-3">
          <span class="material-symbols-outlined text-[16px]">school</span>${escapeHtml(CYCLE_LABELS[cycle])}
        </div>
        <p class="font-label-md text-label-md text-on-surface mb-4">${escapeHtml(title)}</p>
        <div class="relative rounded-xl overflow-hidden aspect-video bg-surface-variant">
          <video class="w-full h-full object-cover" muted playsinline preload="metadata" src="${escapeHtml(item.file_path)}#t=0.5"></video>
          <span class="material-symbols-outlined absolute inset-0 m-auto text-4xl text-white drop-shadow-lg pointer-events-none flex items-center justify-center">play_circle</span>
        </div>
        <div class="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-pink to-orange text-white font-label-md text-label-md w-full justify-center cursor-pointer">
          <span class="material-symbols-outlined text-[18px]">play_arrow</span>Lire la vidéo
        </div>
      </div>`;
    })
    .join("");

  activateReveal(grid);
}
