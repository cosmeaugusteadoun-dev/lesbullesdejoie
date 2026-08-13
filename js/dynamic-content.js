/**
 * Loads testimonials (index.html) and blog articles (blog.html) from
 * Supabase when configured, replacing the static seed content baked into
 * the HTML. If Supabase isn't configured yet, or the request fails, the
 * static markup already in the page is left untouched — the site never
 * depends on this succeeding.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from "./supabase-config.js";

if (isSupabaseConfigured) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  loadTestimonials(supabase);
  loadBlogPosts(supabase);
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

// Literal Tailwind class strings — a JIT-scannable lookup, never built by
// interpolation, so the compiled CSS keeps these classes.
const AVATAR_CLASSES = {
  primary: "bg-primary-container text-on-primary-container",
  secondary: "bg-secondary-container text-on-secondary-container",
  tertiary: "bg-tertiary-container text-on-tertiary-container",
};
const QUOTE_ICON_CLASSES = {
  primary: "text-primary-container/40",
  secondary: "text-secondary-container/40",
  tertiary: "text-tertiary-container/40",
};

async function loadTestimonials(supabase) {
  const track = document.getElementById("testimonials-track");
  if (!track) return;

  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error || !data || !data.length) return;

  const cardHtml = (t, hidden) => `
    <div class="marquee-card bg-surface p-8 rounded-3xl shadow-ambient relative"${hidden ? ' aria-hidden="true"' : ""}>
      <span class="material-symbols-outlined text-5xl ${QUOTE_ICON_CLASSES[t.color] || QUOTE_ICON_CLASSES.primary} absolute top-6 right-6">format_quote</span>
      <p class="font-body-md text-body-md text-on-surface-variant italic mb-8 relative z-10">"${escapeHtml(t.quote)}"</p>
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-full ${AVATAR_CLASSES[t.color] || AVATAR_CLASSES.primary} flex items-center justify-center font-bold text-lg">${escapeHtml(t.initial)}</div>
        <div>
          <h4 class="font-label-md text-label-md text-on-surface">${escapeHtml(t.author_name)}</h4>
          <p class="font-body-md text-[14px] text-on-surface-variant">${escapeHtml(t.author_role)}</p>
        </div>
      </div>
    </div>`;

  // Duplicate the sequence once so the CSS marquee (translateX -50%) loops seamlessly.
  track.innerHTML = data.map((t) => cardHtml(t, false)).join("") + data.map((t) => cardHtml(t, true)).join("");
}

const CATEGORY_SLUGS = {
  Pédagogie: "pedagogie",
  "Vie Scolaire": "vie-scolaire",
  Nutrition: "nutrition",
  Événements: "evenements",
};
const CATEGORY_BADGE_CLASSES = {
  Pédagogie: "bg-secondary-container text-on-secondary-container",
  "Vie Scolaire": "bg-tertiary-container text-on-tertiary-container",
  Nutrition: "bg-primary-container text-on-primary-container",
  Événements: "bg-secondary-container text-on-secondary-container",
};
const CARD_GRADIENTS = [
  "from-primary-container to-secondary-container",
  "from-tertiary-container to-primary-container",
  "from-secondary-container to-tertiary-container",
];

function formatDateFr(isoDate) {
  try {
    return new Date(isoDate + "T00:00:00").toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return isoDate;
  }
}

async function loadBlogPosts(supabase) {
  const grid = document.getElementById("blog-grid");
  if (!grid) return;

  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("published", true)
    .order("published_date", { ascending: false });

  if (error || !data || !data.length) return;

  grid.innerHTML = data
    .map((post, i) => {
      const slug = CATEGORY_SLUGS[post.category] || "pedagogie";
      const badge = CATEGORY_BADGE_CLASSES[post.category] || CATEGORY_BADGE_CLASSES["Pédagogie"];
      const gradient = CARD_GRADIENTS[i % CARD_GRADIENTS.length];
      return `
      <article class="card-hover bg-surface-container-lowest rounded-2xl overflow-hidden shadow-ambient group border border-outline-variant/30 flex flex-col h-full" data-category="${slug}">
        <div class="aspect-[4/3] bg-surface-variant relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-tr ${gradient} opacity-80 group-hover:scale-105 transition-transform duration-500"></div>
          <span class="material-symbols-outlined absolute inset-0 m-auto w-12 h-12 text-on-primary-container opacity-60 flex items-center justify-center text-4xl">${escapeHtml(post.icon || "auto_stories")}</span>
        </div>
        <div class="p-6 flex flex-col flex-grow">
          <div class="flex items-center gap-3 mb-4">
            <span class="px-3 py-1 ${badge} rounded-full font-label-md text-[12px]">${escapeHtml(post.category)}</span>
            <span class="text-on-surface-variant text-[14px] font-body-md">${formatDateFr(post.published_date)}</span>
          </div>
          <h2 class="font-headline-sm text-headline-sm text-on-surface mb-3 group-hover:text-primary transition-colors">${escapeHtml(post.title)}</h2>
          <p class="font-body-md text-body-md text-on-surface-variant mb-6 line-clamp-3">${escapeHtml(post.excerpt)}</p>
          <div class="mt-auto"><span class="text-primary font-label-md text-label-md inline-flex items-center group-hover:gap-2 transition-all">Lire la suite <span class="material-symbols-outlined text-[18px]">arrow_right_alt</span></span></div>
        </div>
      </article>`;
    })
    .join("");
}
