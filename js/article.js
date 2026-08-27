/**
 * Page article (article.html?id=<uuid>). Les articles sont entièrement
 * gérés depuis l'espace admin (table Supabase blog_posts) — il n'y a
 * aucun article codé en dur dans le site.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from "./supabase-config.js";

const CATEGORY_BADGE_CLASSES = {
  Pédagogie: "bg-secondary-container text-on-secondary-container",
  "Vie Scolaire": "bg-tertiary-container text-on-tertiary-container",
  Nutrition: "bg-primary-container text-on-primary-container",
  Événements: "bg-secondary-container text-on-secondary-container",
};

const CATEGORY_GRADIENTS = {
  Pédagogie: ["from-primary-container", "to-secondary-container"],
  "Vie Scolaire": ["from-tertiary-container", "to-primary-container"],
  Nutrition: ["from-secondary-container", "to-tertiary-container"],
  Événements: ["from-primary-container", "to-tertiary-container"],
};

function formatDateFr(isoDate) {
  try {
    return new Date(isoDate + "T00:00:00").toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
  } catch {
    return isoDate;
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

function render(article) {
  document.title = `${article.title} — Les Bulles de Joie`;
  const badge = CATEGORY_BADGE_CLASSES[article.category] || CATEGORY_BADGE_CLASSES["Pédagogie"];
  const [from, to] = CATEGORY_GRADIENTS[article.category] || CATEGORY_GRADIENTS["Pédagogie"];

  document.querySelector("[data-article-meta]").innerHTML = `
    <span class="px-3 py-1 ${badge} rounded-full font-label-md text-[13px]">${escapeHtml(article.category)}</span>
    <span class="text-on-surface-variant text-[14px] font-body-md">${formatDateFr(article.date)}</span>`;

  document.querySelector("[data-article-title]").textContent = article.title;
  if (article.imageUrl) {
    const banner = document.querySelector("[data-article-banner]");
    const img = document.createElement("img");
    img.src = article.imageUrl;
    img.alt = article.title;
    img.className = "absolute inset-0 w-full h-full object-contain";
    banner.prepend(img);
  } else {
    document.querySelector("[data-article-gradient]").classList.add(from, to);
    document.querySelector("[data-article-icon]").textContent = article.icon || "auto_stories";
  }

  const body = document.querySelector("[data-article-body]");
  const paragraphs = (article.content || "").split(/\n\s*\n/).filter(Boolean);
  body.innerHTML = paragraphs.map((p) => `<p>${escapeHtml(p.trim()).replace(/\n/g, "<br />")}</p>`).join("");
  if (article.isFallback) {
    body.innerHTML += `<p class="font-body-md text-[15px] italic text-on-surface-variant/70">La suite de cet article arrive très bientôt.</p>`;
  }

  document.querySelector("[data-article-loading]").classList.add("hidden");
  document.querySelector("[data-article-content]").classList.remove("hidden");
}

function showNotFound() {
  document.querySelector("[data-article-loading]").classList.add("hidden");
  document.querySelector("[data-article-notfound]").classList.remove("hidden");
}

async function init() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (id && isSupabaseConfigured) {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data, error } = await supabase.from("blog_posts").select("*").eq("id", id).eq("published", true).maybeSingle();
    if (error || !data) {
      showNotFound();
      return;
    }
    render({
      title: data.title,
      category: data.category,
      icon: data.icon,
      imageUrl: data.image_url,
      date: data.published_date,
      content: data.content || data.excerpt,
      isFallback: !data.content,
    });
    return;
  }

  showNotFound();
}

init();
