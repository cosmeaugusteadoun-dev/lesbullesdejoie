/**
 * Charge la galerie (photos & vidéos) depuis Supabase. Si Supabase n'est
 * pas configuré, ou si la requête échoue/est vide, la grille statique déjà
 * présente dans galerie.html reste affichée telle quelle.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from "./supabase-config.js";

if (isSupabaseConfigured) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  loadGallery(supabase);
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

// Taille de tuile variable pour garder un rendu "mosaïque" vivant, comme la
// grille statique d'origine (une grande, quelques larges, le reste carré).
const TILE_SPANS = ["col-span-2 row-span-2", "", "", "col-span-2", "", "", "", "col-span-2", "", ""];

async function loadGallery(supabase) {
  const grid = document.getElementById("gallery-grid");
  if (!grid) return;

  const { data, error } = await supabase
    .from("gallery_items")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error || !data || !data.length) return;

  grid.innerHTML = data
    .map((item, i) => {
      const span = TILE_SPANS[i % TILE_SPANS.length];
      const caption = item.caption || "";
      const heightClass = span.includes("row-span-2") ? "min-h-[300px]" : "h-48";

      if (item.media_type === "video") {
        return `
        <div class="gallery-item ${span} rounded-xl shadow-sm relative" data-category="${item.category}" data-lightbox-src="${escapeHtml(item.file_path)}" data-lightbox-alt="${escapeHtml(caption)}" data-lightbox-type="video" data-reveal>
          <video class="w-full h-full ${heightClass} object-cover rounded-xl" muted playsinline preload="metadata" src="${escapeHtml(item.file_path)}#t=0.5"></video>
          <span class="material-symbols-outlined absolute inset-0 m-auto text-5xl text-white drop-shadow-lg pointer-events-none flex items-center justify-center">play_circle</span>
        </div>`;
      }

      return `
      <div class="gallery-item ${span} rounded-xl shadow-sm" data-category="${item.category}" data-lightbox-src="${escapeHtml(item.file_path)}" data-lightbox-alt="${escapeHtml(caption)}" data-reveal>
        <img alt="${escapeHtml(caption)}" class="w-full h-full ${heightClass} object-cover rounded-xl" src="${escapeHtml(item.file_path)}" />
      </div>`;
    })
    .join("");

  grid.querySelectorAll("[data-reveal]").forEach((el) => {
    window.__observeReveal ? window.__observeReveal(el) : el.classList.add("is-revealed");
  });
}
