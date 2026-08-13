/**
 * Les Bulles de Joie — site JS
 * Vanilla JS, no dependencies. Handles: mobile nav, scroll effects,
 * reveal-on-scroll, gallery lightbox, back-to-top and Netlify form
 * submissions (progressive enhancement — forms work fine without JS too).
 */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    initYear();
    initMobileNav();
    initNavScrollShadow();
    initReveal();
    initGalleryLightbox();
    initGalleryFilters();
    initBackToTop();
    initNetlifyForms();
    initInscriptionPricing();
  });

  // Footer copyright year
  function initYear() {
    document.querySelectorAll("[data-year]").forEach((el) => {
      el.textContent = new Date().getFullYear();
    });
  }

  // Mobile navigation panel toggle
  function initMobileNav() {
    const toggle = document.querySelector("[data-nav-toggle]");
    const panel = document.querySelector("[data-nav-panel]");
    if (!toggle || !panel) return;

    const closeNav = () => {
      panel.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.querySelector(".icon-menu")?.classList.remove("hidden");
      toggle.querySelector(".icon-close")?.classList.add("hidden");
    };

    const openNav = () => {
      panel.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      toggle.querySelector(".icon-menu")?.classList.add("hidden");
      toggle.querySelector(".icon-close")?.classList.remove("hidden");
    };

    toggle.addEventListener("click", () => {
      panel.classList.contains("is-open") ? closeNav() : openNav();
    });

    panel.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeNav));
  }

  // Add a soft shadow to the nav once the page is scrolled
  function initNavScrollShadow() {
    const nav = document.querySelector("[data-site-nav]");
    if (!nav) return;
    const onScroll = () => {
      nav.classList.toggle("is-scrolled", window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // Fade/slide elements into view as the user scrolls. Exposes
  // window.__observeReveal(el) so content injected later (e.g. blog cards
  // loaded from Supabase by dynamic-content.js) can join the same
  // scroll-triggered reveal instead of always being instantly visible.
  function initReveal() {
    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-revealed"));
      window.__observeReveal = (el) => el.classList.add("is-revealed");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    window.__observeReveal = (el) => observer.observe(el);
    document.querySelectorAll("[data-reveal]").forEach((el) => observer.observe(el));
  }

  // Simple lightbox for the gallery pages
  function initGalleryLightbox() {
    const items = document.querySelectorAll("[data-lightbox-src]");
    const lightbox = document.querySelector("[data-lightbox]");
    if (!items.length || !lightbox) return;

    const img = lightbox.querySelector("img");
    const caption = lightbox.querySelector("[data-lightbox-caption]");

    const open = (src, alt) => {
      img.setAttribute("src", src);
      img.setAttribute("alt", alt || "");
      if (caption) caption.textContent = alt || "";
      lightbox.classList.add("is-open");
      document.body.style.overflow = "hidden";
    };

    const close = () => {
      lightbox.classList.remove("is-open");
      document.body.style.overflow = "";
    };

    items.forEach((item) => {
      item.addEventListener("click", () => {
        open(item.getAttribute("data-lightbox-src"), item.getAttribute("data-lightbox-alt"));
      });
    });

    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox || e.target.hasAttribute("data-lightbox-close")) close();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });
  }

  // Category filters on the gallery/blog pages. Items are queried live on
  // each click (rather than cached once) so cards injected later — e.g. the
  // blog list loaded asynchronously from Supabase — are filterable too.
  function initGalleryFilters() {
    const buttons = document.querySelectorAll("[data-filter]");
    if (!buttons.length) return;

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const filter = btn.getAttribute("data-filter");

        buttons.forEach((b) => {
          const active = b === btn;
          b.classList.toggle("bg-primary", active);
          b.classList.toggle("text-on-primary", active);
          b.classList.toggle("bg-surface", !active);
          b.classList.toggle("text-on-surface-variant", !active);
        });

        document.querySelectorAll("[data-category]").forEach((item) => {
          const show = filter === "all" || item.getAttribute("data-category") === filter;
          item.classList.toggle("hidden", !show);
        });
      });
    });
  }

  // Back-to-top floating button
  function initBackToTop() {
    const btn = document.querySelector("[data-back-to-top]");
    if (!btn) return;

    window.addEventListener(
      "scroll",
      () => {
        btn.classList.toggle("is-visible", window.scrollY > 600);
      },
      { passive: true }
    );

    btn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Tarifs de scolarité 2024-2025. Volontairement gardés hors du HTML
  // statique : ils ne s'affichent qu'une fois la classe de l'enfant
  // choisie dans le formulaire de pré-inscription (pas de liste de prix
  // publique).
  function initInscriptionPricing() {
    const panel = document.querySelector("[data-pricing-panel]");
    const triggers = document.querySelectorAll("[data-pricing-trigger]");
    if (!panel || !triggers.length) return;

    const fcfa = (n) => `${n.toLocaleString("fr-FR")} FCFA`;

    const CRECHE = {
      label: "Crèche / Garderie",
      rows: [
        ["Inscription (par an)", fcfa(15000)],
        ["Assurance (par an)", fcfa(3000)],
        ["Frais mensuel crèche/garderie", `${fcfa(30000)} / mois`],
        ["Cantine, dès 8 mois (facultatif)", fcfa(13000)],
        ["Halte-garderie", "3 000 – 3 500 FCFA / jour"],
        ["Journée du samedi", fcfa(3500)],
        ["Nuitée", fcfa(3500)],
      ],
      note: "Frais payables au début de chaque mois, au plus tard le 5.",
    };

    const TIERS = {
      prematernelle: { label: "Prématernelle", activites: 4000, fraisGeneraux: 32500, scolarite: 95000, totalNew: 127500, totalOld: 125500 },
      maternelle: { label: "Maternelle 1 & 2", activites: 12000, fraisGeneraux: 40500, scolarite: 90000, totalNew: 130500, totalOld: 128500 },
      cicp: { label: "CI - CP", activites: 15000, fraisGeneraux: 43500, scolarite: 90000, totalNew: 133500, totalOld: 131500 },
      ce1ce2: { label: "CE1 - CE2", activites: 20000, fraisGeneraux: 48500, scolarite: 90000, totalNew: 138500, totalOld: 136500 },
      cm1: { label: "CM1", activites: 20000, fraisGeneraux: 48500, scolarite: 95000, totalNew: 143500, totalOld: 141500 },
    };

    const CLASS_TO_TIER = {
      prematernelle: "prematernelle",
      maternelle1: "maternelle",
      maternelle2: "maternelle",
      ci: "cicp",
      cp: "cicp",
      ce1: "ce1ce2",
      ce2: "ce1ce2",
      cm1: "cm1",
    };

    const CANTINE = [
      ["Déjeuner", fcfa(9000)],
      ["Petit déjeuner", fcfa(5000)],
      ["Garderie", fcfa(3000)],
      ["Goûté (Maternelle)", fcfa(3000)],
    ];

    function renderTable(title, rows) {
      const rowsHtml = rows
        .map(
          ([label, value]) =>
            `<div class="flex items-center justify-between gap-4 py-2 border-b border-primary/10 last:border-0"><span class="font-body-md text-body-md text-on-surface-variant">${label}</span><span class="font-label-md text-label-md text-on-surface shrink-0">${value}</span></div>`
        )
        .join("");
      return `<h4 class="font-label-md text-label-md text-primary mb-2">${title}</h4><div>${rowsHtml}</div>`;
    }

    function renderCreche() {
      return `
        <div class="flex items-center gap-2 mb-4">
          <span class="material-symbols-outlined text-primary icon-filled">payments</span>
          <h3 class="font-headline-sm text-headline-sm text-on-surface">Détail des frais — ${CRECHE.label}</h3>
        </div>
        ${renderTable("Tarifs", CRECHE.rows)}
        <p class="font-body-md text-[13px] text-on-surface-variant italic mt-4">${CRECHE.note}</p>
      `;
    }

    function renderSchool(classKey) {
      const tierKey = CLASS_TO_TIER[classKey];
      const t = TIERS[tierKey];
      if (!t) return "";

      const scolariteRows = [
        ["Frais d'inscription / réinscription", `${fcfa(12000)} / ${fcfa(10000)}`],
        ["Activités parascolaires", fcfa(t.activites)],
        ["Fêtes", fcfa(12000)],
        ["Assurance", fcfa(2000)],
        ["APE", fcfa(2500)],
        ["Frais généraux", fcfa(t.fraisGeneraux)],
        ["Scolarité annuelle", fcfa(t.scolarite)],
      ];

      return `
        <div class="flex items-center gap-2 mb-4">
          <span class="material-symbols-outlined text-primary icon-filled">payments</span>
          <h3 class="font-headline-sm text-headline-sm text-on-surface">Détail des frais — ${t.label}</h3>
        </div>
        ${renderTable("Scolarité", scolariteRows)}
        <div class="grid grid-cols-2 gap-4 mt-4">
          <div class="bg-surface rounded-xl p-4 text-center shadow-sm">
            <p class="font-body-md text-[13px] text-on-surface-variant mb-1">Total nouvel élève</p>
            <p class="font-headline-sm text-headline-sm text-primary">${fcfa(t.totalNew)}</p>
          </div>
          <div class="bg-surface rounded-xl p-4 text-center shadow-sm">
            <p class="font-body-md text-[13px] text-on-surface-variant mb-1">Total ancien élève</p>
            <p class="font-headline-sm text-headline-sm text-primary">${fcfa(t.totalOld)}</p>
          </div>
        </div>
        <div class="mt-5">${renderTable("Modalités de paiement", [
          ["À l'inscription", "Frais généraux"],
          ["1ère tranche (au plus tard le 19/10)", "35 000 – 40 000 FCFA"],
          ["2ème tranche (au plus tard le 07/12)", fcfa(30000)],
          ["3ème tranche (au plus tard le 05/02)", fcfa(25000)],
        ])}</div>
        <div class="mt-5">${renderTable("Cantine (facultatif, payable au plus tard le 05 du mois)", CANTINE)}</div>
      `;
    }

    triggers.forEach((input) => {
      input.addEventListener("change", () => {
        const value = input.value;
        panel.innerHTML = value === "creche" ? renderCreche() : renderSchool(value);
        panel.classList.remove("hidden");
        panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    });
  }

  // Progressive enhancement for Netlify Forms: submit via fetch so the
  // visitor gets inline feedback instead of a full page reload. If JS
  // fails to load, the native form submission (action="/merci.html")
  // still works exactly as Netlify expects.
  function initNetlifyForms() {
    document.querySelectorAll("form[data-netlify-ajax]").forEach((form) => {
      const status = form.parentElement.querySelector("[data-form-status]");

      form.addEventListener("submit", (e) => {
        const requiredInvalid = form.querySelector(":invalid");
        if (requiredInvalid) return; // let native validation UI show

        e.preventDefault();
        const data = new FormData(form);

        fetch("/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams(data).toString(),
        })
          .then(() => {
            form.reset();
            form.hidden = true;
            if (status) {
              status.classList.add("is-visible");
              status.setAttribute("data-form-status", "success");
            }
          })
          .catch(() => {
            if (status) {
              status.classList.add("is-visible");
              status.setAttribute("data-form-status", "error");
              status.textContent =
                "Une erreur est survenue. Merci de réessayer ou de nous écrire directement par email.";
            }
          });
      });
    });
  }
})();
