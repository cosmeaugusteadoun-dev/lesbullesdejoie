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

// ---- Helpers ----------------------------------------------------------------
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

function initials(name) {
  return (name || "?").trim().charAt(0).toUpperCase();
}

const WHATSAPP_ICON_SVG = `<svg class="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884M20.463 3.488A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413"></path></svg>`;

// Numéro Bénin -> format wa.me (mêmes règles que le lien WhatsApp du footer :
// on ne garde que les chiffres, et on préfixe par l'indicatif 229 s'il est absent).
function toWhatsAppNumber(phone) {
  const digits = (phone || "").replace(/\D/g, "");
  return digits.startsWith("229") ? digits : `229${digits}`;
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
  setBlogImagePreview("");
  blogForm.classList.remove("hidden");
  blogForm.scrollIntoView({ behavior: "smooth", block: "center" });
});

// ---- Blog : photo de couverture (envoyée directement depuis l'appareil,
// comme pour la Galerie — pas une sélection parmi des photos déjà en ligne) --
const blogImageUrlInput = document.getElementById("blog-image-url");
const blogImageFileInput = document.getElementById("blog-image-file");
const blogImagePreview = document.getElementById("blog-image-preview");
const blogImageRemoveBtn = document.querySelector("[data-remove-blog-image]");
const blogImageUploadStatus = document.getElementById("blog-image-upload-status");

function setBlogImagePreview(url) {
  blogImageUrlInput.value = url;
  blogImageFileInput.value = "";
  if (url) {
    blogImagePreview.src = url;
    blogImagePreview.classList.remove("hidden");
    blogImageRemoveBtn.classList.remove("hidden");
  } else {
    blogImagePreview.src = "";
    blogImagePreview.classList.add("hidden");
    blogImageRemoveBtn.classList.add("hidden");
  }
}

blogImageFileInput.addEventListener("change", () => {
  const file = blogImageFileInput.files[0];
  if (!file) return;
  blogImagePreview.src = URL.createObjectURL(file);
  blogImagePreview.classList.remove("hidden");
  blogImageRemoveBtn.classList.remove("hidden");
});

blogImageRemoveBtn.addEventListener("click", () => setBlogImagePreview(""));

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
      ${
        p.image_url
          ? `<img alt="" class="w-11 h-11 shrink-0 rounded-full object-cover" src="${escapeHtml(p.image_url)}" />`
          : `<div class="w-11 h-11 shrink-0 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center"><span class="material-symbols-outlined">${escapeHtml(p.icon || "auto_stories")}</span></div>`
      }
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
      setBlogImagePreview(p.image_url || "");
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

// Photos de couverture des articles : rangées à part ("blog/…") dans le même
// bucket "gallery" que la Galerie publique, pour ne jamais toucher aux
// fichiers de celle-ci lors du remplacement/suppression d'une couverture.
async function deleteBlogStorageFile(publicUrl) {
  const path = extractGalleryStoragePath(publicUrl);
  if (!path || !path.startsWith("blog/")) return;
  await supabase.storage.from("gallery").remove([path]);
}

blogForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("blog-id").value;
  const file = blogImageFileInput.files[0];
  const existingUrl = blogImageUrlInput.value;
  const submitBtn = blogForm.querySelector('button[type="submit"]');

  if (file && file.size > MAX_IMAGE_BYTES) {
    alert("Photo trop volumineuse (max 10 Mo).");
    return;
  }

  submitBtn.disabled = true;
  let imageUrl = existingUrl || null;

  if (file) {
    blogImageUploadStatus.classList.remove("hidden");
    blogImageUploadStatus.classList.add("flex");
    const storagePath = `blog/${Date.now()}-${sanitizeFileName(file.name)}`;
    const { error: uploadError } = await supabase.storage.from("gallery").upload(storagePath, file, { upsert: false });
    blogImageUploadStatus.classList.add("hidden");
    blogImageUploadStatus.classList.remove("flex");

    if (uploadError) {
      submitBtn.disabled = false;
      alert("Erreur d'envoi de la photo : " + uploadError.message);
      return;
    }
    const { data: publicUrlData } = supabase.storage.from("gallery").getPublicUrl(storagePath);
    imageUrl = publicUrlData.publicUrl;
  }

  const payload = {
    title: document.getElementById("blog-title").value.trim(),
    excerpt: document.getElementById("blog-excerpt").value.trim(),
    content: document.getElementById("blog-content").value.trim() || null,
    category: document.getElementById("blog-category").value,
    published_date: document.getElementById("blog-date").value || new Date().toISOString().slice(0, 10),
    icon: document.getElementById("blog-icon").value.trim() || "auto_stories",
    image_url: imageUrl,
    published: document.getElementById("blog-published").checked,
  };

  const query = id ? supabase.from("blog_posts").update(payload).eq("id", id) : supabase.from("blog_posts").insert(payload);
  const { error } = await query;
  submitBtn.disabled = false;

  if (error) {
    alert("Erreur : " + error.message);
    if (file) await deleteBlogStorageFile(imageUrl);
    return;
  }

  // A new photo replaced the previous one, or the photo was removed: clean up the orphaned upload.
  if (id && existingUrl && existingUrl !== imageUrl) {
    await deleteBlogStorageFile(existingUrl);
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

function inscriptionEmailLink(d, classLabel) {
  const subject = `Votre pré-inscription — ${d.child_first_name} ${d.child_last_name}`;
  const body = `Bonjour ${d.parent_first_name},\n\nNous avons bien reçu la demande de pré-inscription de ${d.child_first_name} ${d.child_last_name} en ${classLabel} aux Bulles de Joie.\n\nNous serions ravis de vous accueillir pour une visite et un entretien. Quelles seraient vos disponibilités ?\n\nÀ très bientôt,\nL'équipe des Bulles de Joie`;
  return `mailto:${encodeURIComponent(d.parent_email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function inscriptionWhatsAppLink(d, classLabel) {
  const text = `Bonjour ${d.parent_first_name} ! Ici Les Bulles de Joie 🎈 Nous avons bien reçu la demande de pré-inscription de ${d.child_first_name} en ${classLabel}. Quand seriez-vous disponible pour une visite de l'école ?`;
  return `https://wa.me/${toWhatsAppNumber(d.parent_phone)}?text=${encodeURIComponent(text)}`;
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

  inscriptionsList.innerHTML = data
    .map((d) => {
      const buttons = Object.entries(STATUS_LABELS)
        .map(
          ([value, label]) => `
          <button class="px-3 py-1.5 rounded-full font-label-md text-[12px] transition-colors duration-200 ${
            value === d.status ? "bg-primary text-on-primary" : "bg-surface text-on-surface-variant hover:bg-surface-container-high"
          }" data-set-status="${d.id}" data-status-value="${value}" type="button">${label}</button>`
        )
        .join("");

      const classLabel = CLASS_LABELS[d.cycle] || d.cycle;

      return `
    <div class="bg-surface-container-low rounded-2xl p-6 shadow-sm max-w-3xl">
      <div class="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2 mb-2">
            <span class="px-3 py-1 bg-primary-container text-on-primary-container rounded-full font-label-md text-[12px]">${escapeHtml(classLabel)}</span>
            <span class="font-body-md text-[13px] text-on-surface-variant">${formatDateTimeFr(d.created_at)}</span>
          </div>
          <p class="font-label-md text-label-md text-on-surface">Enfant : ${escapeHtml(d.child_first_name)} ${escapeHtml(d.child_last_name)}${d.child_birth_date ? ` — né(e) le ${escapeHtml(d.child_birth_date)}` : ""}</p>
          <p class="font-body-md text-[14px] text-on-surface-variant mt-1">Parent : ${escapeHtml(d.parent_first_name)} ${escapeHtml(d.parent_last_name)} · <a class="hover:text-primary" href="tel:${escapeHtml(d.parent_phone)}">${escapeHtml(d.parent_phone)}</a> · <a class="hover:text-primary" href="mailto:${escapeHtml(d.parent_email)}">${escapeHtml(d.parent_email)}</a></p>
          ${d.entry_term ? `<p class="font-body-md text-[14px] text-on-surface-variant mt-1">Rentrée souhaitée : ${escapeHtml(d.entry_term)}</p>` : ""}
          ${d.message ? `<p class="font-body-md text-[14px] text-on-surface-variant italic mt-2">"${escapeHtml(d.message)}"</p>` : ""}
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <a aria-label="Envoyer un email au parent" class="w-10 h-10 rounded-full border border-outline-variant/50 flex items-center justify-center text-on-surface-variant hover:bg-surface hover:text-primary" href="${inscriptionEmailLink(d, classLabel)}" title="Envoyer un email au parent">
            <span class="material-symbols-outlined text-[20px]">mail</span>
          </a>
          <a aria-label="Envoyer un message WhatsApp au parent" class="w-10 h-10 rounded-full border border-outline-variant/50 flex items-center justify-center text-on-surface-variant hover:bg-surface hover:text-secondary" href="${inscriptionWhatsAppLink(d, classLabel)}" rel="noopener" target="_blank" title="Envoyer un message WhatsApp au parent">
            ${WHATSAPP_ICON_SVG}
          </a>
          <button aria-label="Supprimer ce dossier" class="w-10 h-10 rounded-full border border-error/40 text-error flex items-center justify-center hover:bg-error-container" data-delete-inscription="${d.id}" title="Supprimer ce dossier" type="button">
            <span class="material-symbols-outlined text-[20px]">delete</span>
          </button>
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-2 pt-4 border-t border-outline-variant/30">
        <span class="font-label-md text-[12px] text-on-surface-variant mr-1">Statut :</span>
        ${buttons}
      </div>
    </div>`;
    })
    .join("");

  data.forEach((d) => {
    inscriptionsList.querySelectorAll(`[data-set-status="${d.id}"]`).forEach((btn) => {
      btn.addEventListener("click", async () => {
        const newStatus = btn.getAttribute("data-status-value");
        if (newStatus === d.status) return;
        await supabase.from("inscriptions").update({ status: newStatus }).eq("id", d.id);
        loadInscriptions();
      });
    });
    document.querySelector(`[data-delete-inscription="${d.id}"]`).addEventListener("click", async () => {
      if (!confirm("Supprimer définitivement ce dossier ?")) return;
      await supabase.from("inscriptions").delete().eq("id", d.id);
      loadInscriptions();
    });
  });
}

// ---- Messages de contact -----------------------------------------------------
const contactMessagesList = document.getElementById("contact-messages-list");

function contactMessageEmailLink(m) {
  const subject = "Votre message — Les Bulles de Joie";
  const body = `Bonjour ${m.first_name},\n\nMerci pour votre message ! Nous avons bien reçu votre demande et revenons vers vous rapidement.\n\nÀ très bientôt,\nL'équipe des Bulles de Joie`;
  return `mailto:${encodeURIComponent(m.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function contactMessageWhatsAppLink(m) {
  const text = `Bonjour ${m.first_name} ! Ici Les Bulles de Joie 🎈 Merci pour votre message, nous revenons vers vous très vite.`;
  return `https://wa.me/${toWhatsAppNumber(m.phone)}?text=${encodeURIComponent(text)}`;
}

function contactMessageVisitLink(m) {
  const text = `Bonjour ${m.first_name} ! Ici Les Bulles de Joie 🎈 Nous serions ravis de vous accueillir pour une visite de l'école. Quel jour et quelle heure vous conviendraient ?`;
  return `https://wa.me/${toWhatsAppNumber(m.phone)}?text=${encodeURIComponent(text)}`;
}

async function loadContactMessages() {
  contactMessagesList.innerHTML = `<p class="font-body-md text-body-md text-on-surface-variant">Chargement…</p>`;
  const { data, error } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });

  if (error) {
    contactMessagesList.innerHTML = `<p class="font-body-md text-body-md text-error">Erreur de chargement : ${escapeHtml(error.message)}</p>`;
    return;
  }
  if (!data.length) {
    contactMessagesList.innerHTML = `<p class="font-body-md text-body-md text-on-surface-variant">Aucun message pour le moment.</p>`;
    return;
  }

  contactMessagesList.innerHTML = data
    .map(
      (m) => `
    <div class="bg-surface-container-low rounded-2xl p-6 shadow-sm max-w-3xl">
      <div class="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2 mb-2">
            <span class="inline-block px-3 py-1 rounded-full text-[12px] font-label-md ${m.handled ? "bg-secondary-container text-on-secondary-container" : "bg-primary-container text-on-primary-container"}">${m.handled ? "Traité" : "Nouveau"}</span>
            <span class="font-body-md text-[13px] text-on-surface-variant">${formatDateTimeFr(m.created_at)}</span>
          </div>
          <p class="font-label-md text-label-md text-on-surface">${escapeHtml(m.first_name)} ${escapeHtml(m.last_name)}</p>
          <p class="font-body-md text-[14px] text-on-surface-variant mt-1"><a class="hover:text-primary" href="tel:${escapeHtml(m.phone)}">${escapeHtml(m.phone)}</a>${m.email ? ` · <a class="hover:text-primary" href="mailto:${escapeHtml(m.email)}">${escapeHtml(m.email)}</a>` : ""}</p>
          <p class="font-body-md text-[14px] text-on-surface-variant italic mt-2">"${escapeHtml(m.message)}"</p>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          ${
            m.email
              ? `<a aria-label="Répondre par email" class="w-10 h-10 rounded-full border border-outline-variant/50 flex items-center justify-center text-on-surface-variant hover:bg-surface hover:text-primary" href="${contactMessageEmailLink(m)}" title="Répondre par email">
            <span class="material-symbols-outlined text-[20px]">mail</span>
          </a>`
              : ""
          }
          <a aria-label="Répondre par WhatsApp" class="w-10 h-10 rounded-full border border-outline-variant/50 flex items-center justify-center text-on-surface-variant hover:bg-surface hover:text-secondary" href="${contactMessageWhatsAppLink(m)}" rel="noopener" target="_blank" title="Répondre par WhatsApp">
            ${WHATSAPP_ICON_SVG}
          </a>
          <button aria-label="Supprimer ce message" class="w-10 h-10 rounded-full border border-error/40 text-error flex items-center justify-center hover:bg-error-container" data-delete-contact-message="${m.id}" title="Supprimer ce message" type="button">
            <span class="material-symbols-outlined text-[20px]">delete</span>
          </button>
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-2 pt-4 border-t border-outline-variant/30">
        <a class="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-outline-variant/50 font-label-md text-[13px] hover:bg-surface" href="${contactMessageVisitLink(m)}" rel="noopener" target="_blank">
          <span class="material-symbols-outlined text-[16px]">event</span>Planifier une visite (WhatsApp)
        </a>
        <button class="px-4 py-2 rounded-full border border-outline-variant/50 font-label-md text-[13px] hover:bg-surface" data-toggle-contact-message="${m.id}" data-handled="${m.handled}" type="button">${m.handled ? "Marquer non traité" : "Marquer traité"}</button>
      </div>
    </div>`
    )
    .join("");

  data.forEach((m) => {
    document.querySelector(`[data-toggle-contact-message="${m.id}"]`).addEventListener("click", async (e) => {
      const nowHandled = e.currentTarget.getAttribute("data-handled") !== "true";
      await supabase.from("contact_messages").update({ handled: nowHandled }).eq("id", m.id);
      loadContactMessages();
    });

    document.querySelector(`[data-delete-contact-message="${m.id}"]`).addEventListener("click", async () => {
      if (!confirm("Supprimer définitivement ce message ?")) return;
      await supabase.from("contact_messages").delete().eq("id", m.id);
      loadContactMessages();
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
  document.getElementById("gallery-existing-path").value = "";
  document.getElementById("gallery-published").checked = true;
  galleryForm.classList.remove("hidden");
  galleryForm.scrollIntoView({ behavior: "smooth", block: "center" });
});

// Public URLs look like https://<project>.supabase.co/storage/v1/object/public/gallery/<path>
function extractGalleryStoragePath(publicUrl) {
  const marker = "/storage/v1/object/public/gallery/";
  const idx = publicUrl.indexOf(marker);
  return idx === -1 ? null : publicUrl.slice(idx + marker.length);
}

async function deleteGalleryStorageFile(publicUrl) {
  const path = extractGalleryStoragePath(publicUrl);
  if (!path) return;
  await supabase.storage.from("gallery").remove([path]);
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
            ? `<video class="w-full h-full object-cover" muted src="${escapeHtml(g.file_path)}"></video><span class="material-symbols-outlined absolute inset-0 m-auto text-white text-4xl drop-shadow">play_circle</span>`
            : `<img class="w-full h-full object-cover" src="${escapeHtml(g.file_path)}" alt="" onerror="this.style.opacity=0.2" />`
        }
      </div>
      <div class="p-4 flex flex-col flex-grow gap-2">
        <div class="flex flex-wrap items-center gap-2">
          <span class="px-3 py-1 bg-primary-container text-on-primary-container rounded-full font-label-md text-[12px]">${escapeHtml(GALLERY_CATEGORY_LABELS[g.category] || g.category)}</span>
          <span class="px-3 py-1 bg-surface text-on-surface-variant rounded-full font-label-md text-[12px]">${g.media_type === "video" ? "Vidéo" : "Photo"}</span>
          <span class="px-3 py-1 rounded-full text-[12px] font-label-md ${g.published ? "bg-secondary-container text-on-secondary-container" : "bg-surface-variant text-on-surface-variant"}">${g.published ? "Publié" : "Brouillon"}</span>
        </div>
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
      document.getElementById("gallery-existing-path").value = g.file_path;
      document.getElementById(g.media_type === "video" ? "gallery-type-video" : "gallery-type-image").checked = true;
      document.getElementById("gallery-category").value = g.category;
      document.getElementById("gallery-file").value = "";
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
      if (!confirm("Supprimer définitivement cet élément de la galerie et son fichier ?")) return;
      await supabase.from("gallery_items").delete().eq("id", g.id);
      await deleteGalleryStorageFile(g.file_path);
      loadGallery();
    });
  });
}

const galleryFileInput = document.getElementById("gallery-file");
const galleryUploadStatus = document.getElementById("gallery-upload-status");
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

function sanitizeFileName(name) {
  // Pas besoin de translitérer les accents : juste produire un nom de
  // fichier de stockage sûr (l'admin ne voit/tape jamais ce nom).
  return name.replace(/[^a-zA-Z0-9.-]/g, "-");
}

galleryForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("gallery-id").value;
  const category = document.getElementById("gallery-category").value;
  const mediaType = document.getElementById("gallery-type-video").checked ? "video" : "image";
  const existingPath = document.getElementById("gallery-existing-path").value;
  const file = galleryFileInput.files[0];
  const submitBtn = galleryForm.querySelector('button[type="submit"]');

  if (!file && !id) {
    alert("Veuillez choisir un fichier à ajouter.");
    return;
  }

  if (file) {
    const maxBytes = mediaType === "video" ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
    if (file.size > maxBytes) {
      alert(`Fichier trop volumineux (max ${mediaType === "video" ? "50" : "10"} Mo).`);
      return;
    }
  }

  submitBtn.disabled = true;
  let filePath = existingPath;

  if (file) {
    galleryUploadStatus.classList.remove("hidden");
    galleryUploadStatus.classList.add("flex");
    const storagePath = `${category}/${Date.now()}-${sanitizeFileName(file.name)}`;
    const { error: uploadError } = await supabase.storage.from("gallery").upload(storagePath, file, { upsert: false });
    galleryUploadStatus.classList.add("hidden");
    galleryUploadStatus.classList.remove("flex");

    if (uploadError) {
      submitBtn.disabled = false;
      alert("Erreur d'envoi du fichier : " + uploadError.message);
      return;
    }
    const { data: publicUrlData } = supabase.storage.from("gallery").getPublicUrl(storagePath);
    filePath = publicUrlData.publicUrl;
  }

  const payload = {
    media_type: mediaType,
    category,
    file_path: filePath,
    caption: document.getElementById("gallery-caption").value.trim() || null,
    published: document.getElementById("gallery-published").checked,
  };

  const query = id ? supabase.from("gallery_items").update(payload).eq("id", id) : supabase.from("gallery_items").insert(payload);
  const { error } = await query;
  submitBtn.disabled = false;

  if (error) {
    alert("Erreur : " + error.message);
    if (file) await deleteGalleryStorageFile(filePath); // roll back the upload if the DB write failed
    return;
  }

  // A new file replaced an old one during an edit: clean up the orphaned object.
  if (file && id && existingPath && existingPath !== filePath) {
    await deleteGalleryStorageFile(existingPath);
  }

  galleryForm.classList.add("hidden");
  loadGallery();
});

// ---- Résultats & Distinctions : félicitations, encouragements, projets ----
const CLASS_RECOGNITION_CATEGORY_LABELS = {
  felicitation: "Félicitation",
  encouragement: "Encouragement",
  projet_classe: "Projet de classe",
};

const classRecognitionForm = document.getElementById("class-recognition-form");
const classRecognitionsList = document.getElementById("class-recognitions-list");
const classRecognitionClassSelect = document.getElementById("class-recognition-class");
const recognitionPhotoUrlInput = document.getElementById("class-recognition-photo-url");
const recognitionPhotoFileInput = document.getElementById("class-recognition-photo-file");
const recognitionPhotoPreview = document.getElementById("class-recognition-photo-preview");
const recognitionPhotoRemoveBtn = document.querySelector("[data-remove-class-recognition-photo]");
const recognitionPhotoUploadStatus = document.getElementById("class-recognition-upload-status");

classRecognitionClassSelect.innerHTML = Object.entries(CLASS_LABELS)
  .map(([value, label]) => `<option value="${value}">${label}</option>`)
  .join("");

function setRecognitionPhotoPreview(url) {
  recognitionPhotoUrlInput.value = url;
  recognitionPhotoFileInput.value = "";
  if (url) {
    recognitionPhotoPreview.src = url;
    recognitionPhotoPreview.classList.remove("hidden");
    recognitionPhotoRemoveBtn.classList.remove("hidden");
  } else {
    recognitionPhotoPreview.src = "";
    recognitionPhotoPreview.classList.add("hidden");
    recognitionPhotoRemoveBtn.classList.add("hidden");
  }
}

recognitionPhotoFileInput.addEventListener("change", () => {
  const file = recognitionPhotoFileInput.files[0];
  if (!file) return;
  recognitionPhotoPreview.src = URL.createObjectURL(file);
  recognitionPhotoPreview.classList.remove("hidden");
  recognitionPhotoRemoveBtn.classList.remove("hidden");
});

recognitionPhotoRemoveBtn.addEventListener("click", () => setRecognitionPhotoPreview(""));

async function deleteRecognitionStorageFile(publicUrl) {
  const path = extractGalleryStoragePath(publicUrl);
  if (!path || !path.startsWith("students/")) return;
  await supabase.storage.from("gallery").remove([path]);
}

document.querySelector("[data-add-class-recognition]").addEventListener("click", () => {
  classRecognitionForm.reset();
  document.getElementById("class-recognition-id").value = "";
  document.getElementById("class-recognition-published").checked = true;
  setRecognitionPhotoPreview("");
  classRecognitionForm.classList.remove("hidden");
  classRecognitionForm.scrollIntoView({ behavior: "smooth", block: "center" });
});

async function loadClassRecognitions() {
  classRecognitionsList.innerHTML = `<p class="font-body-md text-body-md text-on-surface-variant">Chargement…</p>`;
  const { data, error } = await supabase
    .from("class_recognitions")
    .select("*")
    .order("class_key", { ascending: true })
    .order("category", { ascending: true })
    .order("rank", { ascending: true });

  if (error) {
    classRecognitionsList.innerHTML = `<p class="font-body-md text-body-md text-error">Erreur de chargement : ${escapeHtml(error.message)}</p>`;
    return;
  }
  if (!data.length) {
    classRecognitionsList.innerHTML = `<p class="font-body-md text-body-md text-on-surface-variant">Aucune entrée pour le moment.</p>`;
    return;
  }

  classRecognitionsList.innerHTML = data
    .map(
      (r) => `
    <div class="bg-surface-container-low rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center gap-4">
      ${
        r.photo_url
          ? `<img alt="" class="w-12 h-12 shrink-0 rounded-full object-cover" src="${escapeHtml(r.photo_url)}" />`
          : `<div class="w-12 h-12 shrink-0 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center"><span class="material-symbols-outlined">person</span></div>`
      }
      <div class="flex-grow min-w-0">
        <div class="flex flex-wrap items-center gap-2">
          <span class="px-3 py-1 bg-primary-container text-on-primary-container rounded-full font-label-md text-[12px]">${escapeHtml(CLASS_LABELS[r.class_key] || r.class_key)}</span>
          <span class="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full font-label-md text-[12px]">${CLASS_RECOGNITION_CATEGORY_LABELS[r.category] || r.category}</span>
          <span class="font-body-md text-[13px] text-on-surface-variant">Rang ${r.rank}</span>
        </div>
        <p class="font-label-md text-label-md text-on-surface mt-2">${escapeHtml(r.student_name)}</p>
        <span class="inline-block mt-2 px-3 py-1 rounded-full text-[12px] font-label-md ${r.published ? "bg-secondary-container text-on-secondary-container" : "bg-surface-variant text-on-surface-variant"}">${r.published ? "Publié" : "Brouillon"}</span>
      </div>
      <div class="flex md:flex-col gap-2 shrink-0">
        <button class="px-4 py-2 rounded-full border border-outline-variant/50 font-label-md text-[13px] hover:bg-surface" data-edit-class-recognition="${r.id}" type="button">Modifier</button>
        <button class="px-4 py-2 rounded-full border border-error/40 text-error font-label-md text-[13px] hover:bg-error-container" data-delete-class-recognition="${r.id}" type="button">Supprimer</button>
      </div>
    </div>`
    )
    .join("");

  data.forEach((r) => {
    document.querySelector(`[data-edit-class-recognition="${r.id}"]`).addEventListener("click", () => {
      document.getElementById("class-recognition-id").value = r.id;
      document.getElementById("class-recognition-class").value = r.class_key;
      document.getElementById("class-recognition-category").value = r.category;
      document.getElementById("class-recognition-rank").value = r.rank;
      document.getElementById("class-recognition-name").value = r.student_name;
      document.getElementById("class-recognition-published").checked = r.published;
      setRecognitionPhotoPreview(r.photo_url || "");
      classRecognitionForm.classList.remove("hidden");
      classRecognitionForm.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    document.querySelector(`[data-delete-class-recognition="${r.id}"]`).addEventListener("click", async () => {
      if (!confirm("Supprimer définitivement cette entrée ?")) return;
      await supabase.from("class_recognitions").delete().eq("id", r.id);
      if (r.photo_url) await deleteRecognitionStorageFile(r.photo_url);
      loadClassRecognitions();
    });
  });
}

classRecognitionForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("class-recognition-id").value;
  const file = recognitionPhotoFileInput.files[0];
  const existingUrl = recognitionPhotoUrlInput.value;
  const submitBtn = classRecognitionForm.querySelector('button[type="submit"]');

  if (file && file.size > MAX_IMAGE_BYTES) {
    alert("Photo trop volumineuse (max 10 Mo).");
    return;
  }

  submitBtn.disabled = true;
  let photoUrl = existingUrl || null;

  if (file) {
    recognitionPhotoUploadStatus.classList.remove("hidden");
    recognitionPhotoUploadStatus.classList.add("flex");
    const storagePath = `students/${Date.now()}-${sanitizeFileName(file.name)}`;
    const { error: uploadError } = await supabase.storage.from("gallery").upload(storagePath, file, { upsert: false });
    recognitionPhotoUploadStatus.classList.add("hidden");
    recognitionPhotoUploadStatus.classList.remove("flex");

    if (uploadError) {
      submitBtn.disabled = false;
      alert("Erreur d'envoi de la photo : " + uploadError.message);
      return;
    }
    const { data: publicUrlData } = supabase.storage.from("gallery").getPublicUrl(storagePath);
    photoUrl = publicUrlData.publicUrl;
  }

  const payload = {
    class_key: document.getElementById("class-recognition-class").value,
    category: document.getElementById("class-recognition-category").value,
    rank: parseInt(document.getElementById("class-recognition-rank").value, 10),
    student_name: document.getElementById("class-recognition-name").value.trim(),
    photo_url: photoUrl,
    published: document.getElementById("class-recognition-published").checked,
  };

  const query = id ? supabase.from("class_recognitions").update(payload).eq("id", id) : supabase.from("class_recognitions").insert(payload);
  const { error } = await query;
  submitBtn.disabled = false;

  if (error) {
    alert("Erreur : " + error.message);
    if (file) await deleteRecognitionStorageFile(photoUrl);
    return;
  }

  if (id && existingUrl && existingUrl !== photoUrl) {
    await deleteRecognitionStorageFile(existingUrl);
  }

  classRecognitionForm.classList.add("hidden");
  loadClassRecognitions();
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
            backgroundColor: "#e6338d",
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
            backgroundColor: ["#ffd8ea", "#e6338d", "#f2762e", "#7cbc10", "#ba1a1a"],
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
loadContactMessages();
loadTestimonials();
loadBlogPosts();
loadTeachers();
loadGallery();
loadClassRecognitions();
