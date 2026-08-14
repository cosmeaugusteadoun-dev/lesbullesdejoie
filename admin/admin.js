import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from "../js/supabase-config.js";
import { initPasswordToggles } from "../js/password-toggle.js";

if (!isSupabaseConfigured) {
  document.body.innerHTML = `
    <div class="min-h-screen flex items-center justify-center px-6 text-center">
      <div class="max-w-md bg-surface-container-low rounded-2xl p-8 bubble-shadow">
        <p class="font-headline-sm text-headline-sm text-primary mb-3">Supabase non configuré</p>
        <p class="font-body-md text-body-md text-on-surface-variant">Renseignez js/supabase-config.js puis rechargez cette page. Voir README.md.</p>
        <a class="inline-block mt-6 font-label-md text-label-md text-primary" href="login.html">← Retour à la connexion</a>
      </div>
    </div>`;
  throw new Error("Supabase not configured");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ---- Auth guard -----------------------------------------------------------
const { data: sessionData } = await supabase.auth.getSession();
if (!sessionData.session) {
  window.location.href = "login.html";
}
const currentUserEmail = sessionData.session?.user?.email ?? "";
document.getElementById("user-email").textContent = currentUserEmail;
initPasswordToggles();

async function logout() {
  await supabase.auth.signOut();
  window.location.href = "login.html";
}
document.getElementById("logout-btn").addEventListener("click", logout);
document.getElementById("logout-btn-mobile").addEventListener("click", logout);

// ---- Mobile nav toggle --------------------------------------------------
(function initAdminMobileNav() {
  const toggle = document.querySelector("[data-admin-nav-toggle]");
  const panel = document.querySelector("[data-admin-nav-panel]");
  if (!toggle || !panel) return;

  toggle.addEventListener("click", () => {
    const open = panel.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.querySelector(".icon-menu").classList.toggle("hidden", open);
    toggle.querySelector(".icon-close").classList.toggle("hidden", !open);
  });
})();

// ---- Tabs -------------------------------------------------------------------
document.querySelectorAll(".admin-tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const tab = btn.getAttribute("data-tab");
    document.querySelectorAll(".admin-tab-btn").forEach((b) => {
      const active = b === btn;
      b.classList.toggle("bg-primary", active);
      b.classList.toggle("text-on-primary", active);
      b.classList.toggle("bg-surface", !active);
      b.classList.toggle("text-on-surface-variant", !active);
    });
    document.querySelectorAll("[data-tab-panel]").forEach((panel) => {
      panel.classList.toggle("hidden", panel.getAttribute("data-tab-panel") !== tab);
    });
  });
});

// ---- Classes (partagé avec inscription.html) -------------------------------
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

const STATUS_LABELS = {
  nouveau: "Nouveau",
  contacte: "Contacté",
  visite_planifiee: "Visite planifiée",
  accepte: "Accepté",
  refuse: "Refusé",
};

// Classes Tailwind écrites en toutes lettres pour rester détectables par le
// scanner JIT (voir note plus bas sur AVATAR_CLASSES).
const STATUS_BADGE_CLASSES = {
  nouveau: "bg-secondary-container text-on-secondary-container",
  contacte: "bg-primary-container text-on-primary-container",
  visite_planifiee: "bg-tertiary-container text-on-tertiary-container",
  accepte: "bg-secondary-container text-on-secondary-container",
  refuse: "bg-error-container text-on-error-container",
};

// ---- Helpers ----------------------------------------------------------------
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

function initials(name) {
  return (name || "?").trim().charAt(0).toUpperCase();
}

// Classes Tailwind écrites en toutes lettres (le scanner de Tailwind ne
// détecte pas les noms de classes construits par interpolation).
const AVATAR_CLASSES = {
  primary: "bg-primary-container text-on-primary-container",
  secondary: "bg-secondary-container text-on-secondary-container",
  tertiary: "bg-tertiary-container text-on-tertiary-container",
};

// ---- Témoignages --------------------------------------------------------
const testimonialForm = document.getElementById("testimonial-form");
const testimonialsList = document.getElementById("testimonials-list");

document.querySelector("[data-add-testimonial]").addEventListener("click", () => {
  testimonialForm.reset();
  document.getElementById("testimonial-id").value = "";
  document.getElementById("testimonial-published").checked = true;
  testimonialForm.classList.remove("hidden");
  testimonialForm.scrollIntoView({ behavior: "smooth", block: "center" });
});

async function loadTestimonials() {
  testimonialsList.innerHTML = `<p class="font-body-md text-body-md text-on-surface-variant">Chargement…</p>`;
  const { data, error } = await supabase.from("testimonials").select("*").order("created_at", { ascending: false });

  if (error) {
    testimonialsList.innerHTML = `<p class="font-body-md text-body-md text-error">Erreur de chargement : ${escapeHtml(error.message)}</p>`;
    return;
  }
  if (!data.length) {
    testimonialsList.innerHTML = `<p class="font-body-md text-body-md text-on-surface-variant">Aucun témoignage pour le moment.</p>`;
    return;
  }

  testimonialsList.innerHTML = data
    .map(
      (t) => `
    <div class="bg-surface-container-low rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-start gap-4">
      <div class="w-11 h-11 shrink-0 rounded-full ${AVATAR_CLASSES[t.color] || AVATAR_CLASSES.primary} flex items-center justify-center font-bold">${escapeHtml(initials(t.author_name))}</div>
      <div class="flex-grow min-w-0">
        <p class="font-label-md text-label-md text-on-surface">${escapeHtml(t.author_name)} <span class="font-body-md text-[13px] text-on-surface-variant">— ${escapeHtml(t.author_role)}</span></p>
        <p class="font-body-md text-body-md text-on-surface-variant italic mt-1">"${escapeHtml(t.quote)}"</p>
        <span class="inline-block mt-2 px-3 py-1 rounded-full text-[12px] font-label-md ${t.published ? "bg-secondary-container text-on-secondary-container" : "bg-surface-variant text-on-surface-variant"}">${t.published ? "Publié" : "Brouillon"}</span>
      </div>
      <div class="flex md:flex-col gap-2 shrink-0">
        <button class="px-4 py-2 rounded-full border border-outline-variant/50 font-label-md text-[13px] hover:bg-surface" data-edit-testimonial="${t.id}" type="button">Modifier</button>
        <button class="px-4 py-2 rounded-full border border-outline-variant/50 font-label-md text-[13px] hover:bg-surface" data-toggle-testimonial="${t.id}" data-published="${t.published}" type="button">${t.published ? "Dépublier" : "Publier"}</button>
        <button class="px-4 py-2 rounded-full border border-error/40 text-error font-label-md text-[13px] hover:bg-error-container" data-delete-testimonial="${t.id}" type="button">Supprimer</button>
      </div>
    </div>`
    )
    .join("");

  data.forEach((t) => {
    document.querySelector(`[data-edit-testimonial="${t.id}"]`).addEventListener("click", () => {
      document.getElementById("testimonial-id").value = t.id;
      document.getElementById("testimonial-name").value = t.author_name;
      document.getElementById("testimonial-role").value = t.author_role;
      document.getElementById("testimonial-quote").value = t.quote;
      document.getElementById("testimonial-color").value = t.color;
      document.getElementById("testimonial-published").checked = t.published;
      testimonialForm.classList.remove("hidden");
      testimonialForm.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    document.querySelector(`[data-toggle-testimonial="${t.id}"]`).addEventListener("click", async (e) => {
      const nowPublished = e.currentTarget.getAttribute("data-published") !== "true";
      await supabase.from("testimonials").update({ published: nowPublished }).eq("id", t.id);
      loadTestimonials();
    });

    document.querySelector(`[data-delete-testimonial="${t.id}"]`).addEventListener("click", async () => {
      if (!confirm("Supprimer définitivement ce témoignage ?")) return;
      await supabase.from("testimonials").delete().eq("id", t.id);
      loadTestimonials();
    });
  });
}

testimonialForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("testimonial-id").value;
  const payload = {
    author_name: document.getElementById("testimonial-name").value.trim(),
    author_role: document.getElementById("testimonial-role").value.trim(),
    quote: document.getElementById("testimonial-quote").value.trim(),
    initial: initials(document.getElementById("testimonial-name").value),
    color: document.getElementById("testimonial-color").value,
    published: document.getElementById("testimonial-published").checked,
  };

  const query = id ? supabase.from("testimonials").update(payload).eq("id", id) : supabase.from("testimonials").insert(payload);
  const { error } = await query;
  if (error) {
    alert("Erreur : " + error.message);
    return;
  }
  testimonialForm.classList.add("hidden");
  loadTestimonials();
});

// ---- Blog -------------------------------------------------------------------
const blogForm = document.getElementById("blog-form");
const blogList = document.getElementById("blog-list");

document.querySelector("[data-add-blog]").addEventListener("click", () => {
  blogForm.reset();
  document.getElementById("blog-id").value = "";
  document.getElementById("blog-date").value = new Date().toISOString().slice(0, 10);
  document.getElementById("blog-published").checked = true;
  blogForm.classList.remove("hidden");
  blogForm.scrollIntoView({ behavior: "smooth", block: "center" });
});

async function loadBlogPosts() {
  blogList.innerHTML = `<p class="font-body-md text-body-md text-on-surface-variant">Chargement…</p>`;
  const { data, error } = await supabase.from("blog_posts").select("*").order("published_date", { ascending: false });

  if (error) {
    blogList.innerHTML = `<p class="font-body-md text-body-md text-error">Erreur de chargement : ${escapeHtml(error.message)}</p>`;
    return;
  }
  if (!data.length) {
    blogList.innerHTML = `<p class="font-body-md text-body-md text-on-surface-variant">Aucun article pour le moment.</p>`;
    return;
  }

  blogList.innerHTML = data
    .map(
      (p) => `
    <div class="bg-surface-container-low rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-start gap-4">
      <div class="w-11 h-11 shrink-0 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center"><span class="material-symbols-outlined">${escapeHtml(p.icon || "auto_stories")}</span></div>
      <div class="flex-grow min-w-0">
        <div class="flex flex-wrap items-center gap-2">
          <span class="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full font-label-md text-[12px]">${escapeHtml(p.category)}</span>
          <span class="font-body-md text-[13px] text-on-surface-variant">${escapeHtml(p.published_date)}</span>
        </div>
        <p class="font-label-md text-label-md text-on-surface mt-2">${escapeHtml(p.title)}</p>
        <p class="font-body-md text-[14px] text-on-surface-variant mt-1">${escapeHtml(p.excerpt)}</p>
        <span class="inline-block mt-2 px-3 py-1 rounded-full text-[12px] font-label-md ${p.published ? "bg-secondary-container text-on-secondary-container" : "bg-surface-variant text-on-surface-variant"}">${p.published ? "Publié" : "Brouillon"}</span>
      </div>
      <div class="flex md:flex-col gap-2 shrink-0">
        <button class="px-4 py-2 rounded-full border border-outline-variant/50 font-label-md text-[13px] hover:bg-surface" data-edit-blog="${p.id}" type="button">Modifier</button>
        <button class="px-4 py-2 rounded-full border border-outline-variant/50 font-label-md text-[13px] hover:bg-surface" data-toggle-blog="${p.id}" data-published="${p.published}" type="button">${p.published ? "Dépublier" : "Publier"}</button>
        <button class="px-4 py-2 rounded-full border border-error/40 text-error font-label-md text-[13px] hover:bg-error-container" data-delete-blog="${p.id}" type="button">Supprimer</button>
      </div>
    </div>`
    )
    .join("");

  data.forEach((p) => {
    document.querySelector(`[data-edit-blog="${p.id}"]`).addEventListener("click", () => {
      document.getElementById("blog-id").value = p.id;
      document.getElementById("blog-title").value = p.title;
      document.getElementById("blog-excerpt").value = p.excerpt;
      document.getElementById("blog-content").value = p.content || "";
      document.getElementById("blog-category").value = p.category;
      document.getElementById("blog-date").value = p.published_date;
      document.getElementById("blog-icon").value = p.icon || "";
      document.getElementById("blog-published").checked = p.published;
      blogForm.classList.remove("hidden");
      blogForm.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    document.querySelector(`[data-toggle-blog="${p.id}"]`).addEventListener("click", async (e) => {
      const nowPublished = e.currentTarget.getAttribute("data-published") !== "true";
      await supabase.from("blog_posts").update({ published: nowPublished }).eq("id", p.id);
      loadBlogPosts();
    });

    document.querySelector(`[data-delete-blog="${p.id}"]`).addEventListener("click", async () => {
      if (!confirm("Supprimer définitivement cet article ?")) return;
      await supabase.from("blog_posts").delete().eq("id", p.id);
      loadBlogPosts();
    });
  });
}

blogForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("blog-id").value;
  const payload = {
    title: document.getElementById("blog-title").value.trim(),
    excerpt: document.getElementById("blog-excerpt").value.trim(),
    content: document.getElementById("blog-content").value.trim() || null,
    category: document.getElementById("blog-category").value,
    published_date: document.getElementById("blog-date").value || new Date().toISOString().slice(0, 10),
    icon: document.getElementById("blog-icon").value.trim() || "auto_stories",
    published: document.getElementById("blog-published").checked,
  };

  const query = id ? supabase.from("blog_posts").update(payload).eq("id", id) : supabase.from("blog_posts").insert(payload);
  const { error } = await query;
  if (error) {
    alert("Erreur : " + error.message);
    return;
  }
  blogForm.classList.add("hidden");
  loadBlogPosts();
});

// ---- Dossiers d'inscription -------------------------------------------------
const inscriptionsList = document.getElementById("inscriptions-list");
let currentStatusFilter = "all";

document.querySelectorAll("[data-status-filter]").forEach((btn) => {
  btn.addEventListener("click", () => {
    currentStatusFilter = btn.getAttribute("data-status-filter");
    document.querySelectorAll("[data-status-filter]").forEach((b) => {
      const active = b === btn;
      b.classList.toggle("bg-primary", active);
      b.classList.toggle("text-on-primary", active);
      b.classList.toggle("bg-surface", !active);
      b.classList.toggle("text-on-surface-variant", !active);
    });
    loadInscriptions();
  });
});

function formatDateTimeFr(iso) {
  try {
    return new Date(iso).toLocaleString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

async function loadInscriptions() {
  inscriptionsList.innerHTML = `<p class="font-body-md text-body-md text-on-surface-variant">Chargement…</p>`;
  let query = supabase.from("inscriptions").select("*").order("created_at", { ascending: false });
  if (currentStatusFilter !== "all") query = query.eq("status", currentStatusFilter);
  const { data, error } = await query;

  if (error) {
    inscriptionsList.innerHTML = `<p class="font-body-md text-body-md text-error">Erreur de chargement : ${escapeHtml(error.message)}</p>`;
    return;
  }
  if (!data.length) {
    inscriptionsList.innerHTML = `<p class="font-body-md text-body-md text-on-surface-variant">Aucun dossier pour le moment.</p>`;
    return;
  }

  const statusOptions = (current) =>
    Object.entries(STATUS_LABELS)
      .map(([value, label]) => `<option value="${value}" ${value === current ? "selected" : ""}>${label}</option>`)
      .join("");

  inscriptionsList.innerHTML = data
    .map(
      (d) => `
    <div class="bg-surface-container-low rounded-2xl p-6 shadow-sm">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2 mb-2">
            <span class="px-3 py-1 bg-primary-container text-on-primary-container rounded-full font-label-md text-[12px]">${escapeHtml(CLASS_LABELS[d.cycle] || d.cycle)}</span>
            <span class="px-3 py-1 ${STATUS_BADGE_CLASSES[d.status] || STATUS_BADGE_CLASSES.nouveau} rounded-full font-label-md text-[12px]">${escapeHtml(STATUS_LABELS[d.status] || d.status)}</span>
            <span class="font-body-md text-[13px] text-on-surface-variant">${formatDateTimeFr(d.created_at)}</span>
          </div>
          <p class="font-label-md text-label-md text-on-surface">Enfant : ${escapeHtml(d.child_first_name)} ${escapeHtml(d.child_last_name)}${d.child_birth_date ? ` — né(e) le ${escapeHtml(d.child_birth_date)}` : ""}</p>
          <p class="font-body-md text-[14px] text-on-surface-variant mt-1">Parent : ${escapeHtml(d.parent_first_name)} ${escapeHtml(d.parent_last_name)} · <a class="hover:text-primary" href="tel:${escapeHtml(d.parent_phone)}">${escapeHtml(d.parent_phone)}</a> · <a class="hover:text-primary" href="mailto:${escapeHtml(d.parent_email)}">${escapeHtml(d.parent_email)}</a></p>
          ${d.entry_term ? `<p class="font-body-md text-[14px] text-on-surface-variant mt-1">Rentrée souhaitée : ${escapeHtml(d.entry_term)}</p>` : ""}
          ${d.message ? `<p class="font-body-md text-[14px] text-on-surface-variant italic mt-2">"${escapeHtml(d.message)}"</p>` : ""}
        </div>
        <div class="flex flex-col items-end gap-2 shrink-0">
          <select class="form-field font-body-md text-[13px] text-on-surface !py-2 !px-4 w-auto" data-status-select="${d.id}">
            ${statusOptions(d.status)}
          </select>
          <button class="px-4 py-2 rounded-full border border-error/40 text-error font-label-md text-[13px] hover:bg-error-container" data-delete-inscription="${d.id}" type="button">Supprimer</button>
        </div>
      </div>
    </div>`
    )
    .join("");

  data.forEach((d) => {
    document.querySelector(`[data-status-select="${d.id}"]`).addEventListener("change", async (e) => {
      await supabase.from("inscriptions").update({ status: e.target.value }).eq("id", d.id);
      loadInscriptions();
    });
    document.querySelector(`[data-delete-inscription="${d.id}"]`).addEventListener("click", async () => {
      if (!confirm("Supprimer définitivement ce dossier ?")) return;
      await supabase.from("inscriptions").delete().eq("id", d.id);
      loadInscriptions();
    });
  });
}

// ---- Enseignants --------------------------------------------------------
const teacherForm = document.getElementById("teacher-form");
const teachersList = document.getElementById("teachers-list");
const teacherClassSelect = document.getElementById("teacher-class");

teacherClassSelect.innerHTML = Object.entries(CLASS_LABELS)
  .map(([value, label]) => `<option value="${value}">${label}</option>`)
  .join("");

document.querySelector("[data-add-teacher]").addEventListener("click", () => {
  teacherForm.reset();
  document.getElementById("teacher-id").value = "";
  teacherForm.classList.remove("hidden");
  teacherForm.scrollIntoView({ behavior: "smooth", block: "center" });
});

async function loadTeachers() {
  teachersList.innerHTML = `<p class="font-body-md text-body-md text-on-surface-variant">Chargement…</p>`;
  const { data, error } = await supabase.from("teachers").select("*").order("class_key", { ascending: true });

  if (error) {
    teachersList.innerHTML = `<p class="font-body-md text-body-md text-error">Erreur de chargement : ${escapeHtml(error.message)}</p>`;
    return;
  }
  if (!data.length) {
    teachersList.innerHTML = `<p class="font-body-md text-body-md text-on-surface-variant">Aucun enseignant renseigné pour le moment.</p>`;
    return;
  }

  teachersList.innerHTML = data
    .map(
      (t) => `
    <div class="bg-surface-container-low rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center gap-4">
      <div class="flex-grow min-w-0">
        <span class="px-3 py-1 bg-primary-container text-on-primary-container rounded-full font-label-md text-[12px]">${escapeHtml(CLASS_LABELS[t.class_key] || t.class_key)}</span>
        <p class="font-label-md text-label-md text-on-surface mt-2">${escapeHtml(t.teacher_name)}</p>
        <p class="font-body-md text-[14px] text-on-surface-variant mt-1">${t.phone ? escapeHtml(t.phone) : ""}${t.phone && t.email ? " · " : ""}${t.email ? escapeHtml(t.email) : ""}${!t.phone && !t.email ? "Aucun contact renseigné" : ""}</p>
      </div>
      <div class="flex gap-2 shrink-0">
        <button class="px-4 py-2 rounded-full border border-outline-variant/50 font-label-md text-[13px] hover:bg-surface" data-edit-teacher="${t.id}" type="button">Modifier</button>
        <button class="px-4 py-2 rounded-full border border-error/40 text-error font-label-md text-[13px] hover:bg-error-container" data-delete-teacher="${t.id}" type="button">Supprimer</button>
      </div>
    </div>`
    )
    .join("");

  data.forEach((t) => {
    document.querySelector(`[data-edit-teacher="${t.id}"]`).addEventListener("click", () => {
      document.getElementById("teacher-id").value = t.id;
      document.getElementById("teacher-class").value = t.class_key;
      document.getElementById("teacher-name").value = t.teacher_name;
      document.getElementById("teacher-phone").value = t.phone || "";
      document.getElementById("teacher-email").value = t.email || "";
      teacherForm.classList.remove("hidden");
      teacherForm.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    document.querySelector(`[data-delete-teacher="${t.id}"]`).addEventListener("click", async () => {
      if (!confirm("Supprimer ce contact enseignant ?")) return;
      await supabase.from("teachers").delete().eq("id", t.id);
      loadTeachers();
    });
  });
}

teacherForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("teacher-id").value;
  const classKey = document.getElementById("teacher-class").value;
  const payload = {
    class_key: classKey,
    class_label: CLASS_LABELS[classKey],
    teacher_name: document.getElementById("teacher-name").value.trim(),
    phone: document.getElementById("teacher-phone").value.trim(),
    email: document.getElementById("teacher-email").value.trim(),
  };

  const query = id ? supabase.from("teachers").update(payload).eq("id", id) : supabase.from("teachers").insert(payload);
  const { error } = await query;
  if (error) {
    alert("Erreur : " + error.message);
    return;
  }
  teacherForm.classList.add("hidden");
  loadTeachers();
});

// ---- Galerie (photos & vidéos) ----------------------------------------
const GALLERY_CATEGORY_LABELS = {
  creche: "Crèche",
  maternelle: "Maternelle",
  primaire: "Primaire",
  "vie-scolaire": "Vie Scolaire",
};

const galleryForm = document.getElementById("gallery-form");
const galleryList = document.getElementById("gallery-list");

document.querySelector("[data-add-gallery]").addEventListener("click", () => {
  galleryForm.reset();
  document.getElementById("gallery-id").value = "";
  document.getElementById("gallery-published").checked = true;
  galleryForm.classList.remove("hidden");
  galleryForm.scrollIntoView({ behavior: "smooth", block: "center" });
});

function galleryFilePath(category, filename) {
  return `assets/gallery/${category}/${filename}`.replace(/\/{2,}/g, "/");
}

async function loadGallery() {
  galleryList.innerHTML = `<p class="font-body-md text-body-md text-on-surface-variant">Chargement…</p>`;
  const { data, error } = await supabase.from("gallery_items").select("*").order("created_at", { ascending: false });

  if (error) {
    galleryList.innerHTML = `<p class="font-body-md text-body-md text-error">Erreur de chargement : ${escapeHtml(error.message)}</p>`;
    return;
  }
  if (!data.length) {
    galleryList.innerHTML = `<p class="font-body-md text-body-md text-on-surface-variant">Aucun média pour le moment.</p>`;
    return;
  }

  galleryList.innerHTML = data
    .map(
      (g) => `
    <div class="bg-surface-container-low rounded-2xl overflow-hidden shadow-sm flex flex-col">
      <div class="aspect-video bg-surface-variant relative flex items-center justify-center overflow-hidden">
        ${
          g.media_type === "video"
            ? `<video class="w-full h-full object-cover" muted src="../${escapeHtml(g.file_path)}"></video><span class="material-symbols-outlined absolute inset-0 m-auto text-white text-4xl drop-shadow">play_circle</span>`
            : `<img class="w-full h-full object-cover" src="../${escapeHtml(g.file_path)}" alt="" onerror="this.style.opacity=0.2" />`
        }
      </div>
      <div class="p-4 flex flex-col flex-grow gap-2">
        <div class="flex flex-wrap items-center gap-2">
          <span class="px-3 py-1 bg-primary-container text-on-primary-container rounded-full font-label-md text-[12px]">${escapeHtml(GALLERY_CATEGORY_LABELS[g.category] || g.category)}</span>
          <span class="px-3 py-1 bg-surface text-on-surface-variant rounded-full font-label-md text-[12px]">${g.media_type === "video" ? "Vidéo" : "Photo"}</span>
          <span class="px-3 py-1 rounded-full text-[12px] font-label-md ${g.published ? "bg-secondary-container text-on-secondary-container" : "bg-surface-variant text-on-surface-variant"}">${g.published ? "Publié" : "Brouillon"}</span>
        </div>
        <p class="font-body-md text-[13px] text-on-surface-variant break-all">${escapeHtml(g.file_path)}</p>
        ${g.caption ? `<p class="font-body-md text-[14px] text-on-surface">${escapeHtml(g.caption)}</p>` : ""}
        <div class="flex gap-2 mt-auto pt-2">
          <button class="px-3 py-1.5 rounded-full border border-outline-variant/50 font-label-md text-[12px] hover:bg-surface" data-edit-gallery="${g.id}" type="button">Modifier</button>
          <button class="px-3 py-1.5 rounded-full border border-outline-variant/50 font-label-md text-[12px] hover:bg-surface" data-toggle-gallery="${g.id}" data-published="${g.published}" type="button">${g.published ? "Dépublier" : "Publier"}</button>
          <button class="px-3 py-1.5 rounded-full border border-error/40 text-error font-label-md text-[12px] hover:bg-error-container" data-delete-gallery="${g.id}" type="button">Supprimer</button>
        </div>
      </div>
    </div>`
    )
    .join("");

  data.forEach((g) => {
    document.querySelector(`[data-edit-gallery="${g.id}"]`).addEventListener("click", () => {
      document.getElementById("gallery-id").value = g.id;
      document.getElementById(g.media_type === "video" ? "gallery-type-video" : "gallery-type-image").checked = true;
      document.getElementById("gallery-category").value = g.category;
      document.getElementById("gallery-filename").value = g.file_path.split("/").pop();
      document.getElementById("gallery-caption").value = g.caption || "";
      document.getElementById("gallery-published").checked = g.published;
      galleryForm.classList.remove("hidden");
      galleryForm.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    document.querySelector(`[data-toggle-gallery="${g.id}"]`).addEventListener("click", async (e) => {
      const nowPublished = e.currentTarget.getAttribute("data-published") !== "true";
      await supabase.from("gallery_items").update({ published: nowPublished }).eq("id", g.id);
      loadGallery();
    });

    document.querySelector(`[data-delete-gallery="${g.id}"]`).addEventListener("click", async () => {
      if (!confirm("Supprimer cet élément de la galerie ? (le fichier lui-même n'est pas supprimé du serveur)")) return;
      await supabase.from("gallery_items").delete().eq("id", g.id);
      loadGallery();
    });
  });
}

galleryForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("gallery-id").value;
  const category = document.getElementById("gallery-category").value;
  const filename = document.getElementById("gallery-filename").value.trim().replace(/^\/+/, "");
  const payload = {
    media_type: document.getElementById("gallery-type-video").checked ? "video" : "image",
    category,
    file_path: galleryFilePath(category, filename),
    caption: document.getElementById("gallery-caption").value.trim() || null,
    published: document.getElementById("gallery-published").checked,
  };

  const query = id ? supabase.from("gallery_items").update(payload).eq("id", id) : supabase.from("gallery_items").insert(payload);
  const { error } = await query;
  if (error) {
    alert("Erreur : " + error.message);
    return;
  }
  galleryForm.classList.add("hidden");
  loadGallery();
});

// ---- Mon compte : changer le mot de passe --------------------------------
const passwordForm = document.getElementById("password-form");
const passwordStatus = document.getElementById("password-status");
const passwordSubmit = document.getElementById("password-submit");

function showPasswordStatus(message, isError) {
  passwordStatus.textContent = message;
  passwordStatus.classList.remove("hidden");
  passwordStatus.classList.add("flex");
  passwordStatus.classList.toggle("bg-error-container", isError);
  passwordStatus.classList.toggle("text-on-error-container", isError);
  passwordStatus.classList.toggle("bg-secondary-container", !isError);
  passwordStatus.classList.toggle("text-on-secondary-container", !isError);
}

passwordForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  passwordStatus.classList.add("hidden");

  const currentPassword = document.getElementById("current-password").value;
  const newPassword = document.getElementById("new-password").value;
  const confirmPassword = document.getElementById("confirm-password").value;

  if (newPassword.length < 6) {
    showPasswordStatus("Le nouveau mot de passe doit contenir au moins 6 caractères.", true);
    return;
  }
  if (newPassword !== confirmPassword) {
    showPasswordStatus("La confirmation ne correspond pas au nouveau mot de passe.", true);
    return;
  }

  passwordSubmit.disabled = true;

  // On vérifie le mot de passe actuel en tentant une reconnexion avec celui-ci.
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: currentUserEmail,
    password: currentPassword,
  });

  if (verifyError) {
    passwordSubmit.disabled = false;
    showPasswordStatus("Mot de passe actuel incorrect.", true);
    return;
  }

  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
  passwordSubmit.disabled = false;

  if (updateError) {
    showPasswordStatus("Erreur : " + updateError.message, true);
    return;
  }

  passwordForm.reset();
  showPasswordStatus("Mot de passe mis à jour avec succès.", false);
});

// ---- Statistiques ---------------------------------------------------------
let visitsChart = null;
let statusChart = null;

async function loadStats() {
  const now = new Date();
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const statsError = document.getElementById("stats-error");
  const errors = [];

  const { data: views, error: viewsError } = await supabase.from("page_views").select("viewed_at").gte("viewed_at", sevenDaysAgo.toISOString());
  if (viewsError) errors.push(viewsError.message);

  const counts = Object.fromEntries(days.map((d) => [d, 0]));
  (views || []).forEach((v) => {
    const day = v.viewed_at.slice(0, 10);
    if (day in counts) counts[day]++;
  });

  const todayKey = now.toISOString().slice(0, 10);
  document.getElementById("stat-today").textContent = counts[todayKey] ?? 0;
  document.getElementById("stat-week").textContent = (views || []).length;

  const dayLabels = days.map((d) => new Date(d + "T00:00:00").toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit" }));

  if (typeof Chart !== "undefined") {
    const visitsCtx = document.getElementById("chart-visits");
    if (visitsChart) visitsChart.destroy();
    visitsChart = new Chart(visitsCtx, {
      type: "bar",
      data: {
        labels: dayLabels,
        datasets: [
          {
            label: "Visites",
            data: days.map((d) => counts[d]),
            backgroundColor: "#4f378a",
            borderRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
      },
    });
  }

  const { data: inscriptions, error: inscriptionsError } = await supabase.from("inscriptions").select("status");
  if (inscriptionsError) errors.push(inscriptionsError.message);
  document.getElementById("stat-inscriptions-total").textContent = (inscriptions || []).length;

  const statusCounts = { nouveau: 0, contacte: 0, visite_planifiee: 0, accepte: 0, refuse: 0 };
  (inscriptions || []).forEach((row) => {
    if (row.status in statusCounts) statusCounts[row.status]++;
  });

  const statusTotal = Object.values(statusCounts).reduce((a, b) => a + b, 0);
  const statusChartEl = document.getElementById("chart-status");
  const statusEmptyMsg = document.getElementById("chart-status-empty");

  if (typeof Chart !== "undefined" && statusTotal > 0) {
    statusChartEl.classList.remove("hidden");
    if (statusEmptyMsg) statusEmptyMsg.classList.add("hidden");
    if (statusChart) statusChart.destroy();
    statusChart = new Chart(statusChartEl, {
      type: "doughnut",
      data: {
        labels: Object.values(STATUS_LABELS),
        datasets: [
          {
            data: Object.keys(statusCounts).map((k) => statusCounts[k]),
            backgroundColor: ["#e1d4fd", "#6750a4", "#c9a74d", "#84BD00", "#ba1a1a"],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "bottom", labels: { boxWidth: 12, font: { size: 11 } } } },
      },
    });
  } else {
    statusChartEl.classList.add("hidden");
    if (statusEmptyMsg) statusEmptyMsg.classList.remove("hidden");
  }

  if (statsError) {
    if (errors.length) {
      statsError.textContent = "Certaines statistiques n'ont pas pu être chargées : " + errors.join(" · ");
      statsError.classList.remove("hidden");
    } else {
      statsError.classList.add("hidden");
    }
  }
}

// ---- Cancel buttons -----------------------------------------------------
document.querySelectorAll("[data-cancel-form]").forEach((btn) => {
  btn.addEventListener("click", () => {
    btn.closest("form").classList.add("hidden");
  });
});

loadStats();
loadInscriptions();
loadTestimonials();
loadBlogPosts();
loadTeachers();
loadGallery();
