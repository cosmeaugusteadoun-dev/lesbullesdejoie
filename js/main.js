/**
 * Les Bulles de Joie — site JS
 * Vanilla JS, no dependencies. Handles: mobile nav, scroll effects,
 * reveal-on-scroll, gallery lightbox, back-to-top and the inscription
 * pricing/step flow. Form submissions themselves (Netlify + Supabase) are
 * handled per-form in js/contact.js and js/inscription.js.
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
    initInscriptionPricing();
    initCounters();
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

  // Compte de 0 jusqu'au chiffre affiché, une seule fois, quand la carte
  // entre dans le viewport (ex. "8 ans de résultats prouvés" sur l'accueil).
  function initCounters() {
    const groups = document.querySelectorAll("[data-counter-group]");
    if (!groups.length) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function animateCounter(el) {
      const target = parseInt(el.getAttribute("data-counter"), 10);
      const suffix = el.getAttribute("data-counter-suffix") || "";
      if (prefersReducedMotion || Number.isNaN(target)) {
        el.textContent = target + suffix;
        return;
      }

      const duration = 1400;
      const start = performance.now();

      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        el.textContent = Math.round(target * eased) + suffix;
        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          el.textContent = target + suffix;
        }
      }
      requestAnimationFrame(tick);
    }

    if (!("IntersectionObserver" in window)) {
      groups.forEach((group) => group.querySelectorAll("[data-counter]").forEach(animateCounter));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll("[data-counter]").forEach(animateCounter);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    groups.forEach((group) => observer.observe(group));
  }

  // Lightbox for the gallery page. Supports photos and videos, and uses
  // event delegation (rather than binding each item once at load) so tiles
  // loaded later from Supabase are clickable without extra wiring.
  function initGalleryLightbox() {
    const lightbox = document.querySelector("[data-lightbox]");
    if (!lightbox) return;

    const img = lightbox.querySelector("[data-lightbox-img]");
    const video = lightbox.querySelector("[data-lightbox-video]");
    const caption = lightbox.querySelector("[data-lightbox-caption]");

    const open = (src, alt, type) => {
      if (type === "video") {
        img.classList.add("hidden");
        video.classList.remove("hidden");
        video.src = src;
        video.currentTime = 0;
        video.play().catch(() => {});
      } else {
        video.pause();
        video.removeAttribute("src");
        video.classList.add("hidden");
        img.classList.remove("hidden");
        img.setAttribute("src", src);
        img.setAttribute("alt", alt || "");
      }
      if (caption) caption.textContent = alt || "";
      lightbox.classList.add("is-open");
      document.body.style.overflow = "hidden";
    };

    const close = () => {
      lightbox.classList.remove("is-open");
      document.body.style.overflow = "";
      video.pause();
    };

    document.addEventListener("click", (e) => {
      const item = e.target.closest("[data-lightbox-src]");
      if (item) {
        open(item.getAttribute("data-lightbox-src"), item.getAttribute("data-lightbox-alt"), item.getAttribute("data-lightbox-type"));
      }
    });

    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox || e.target.closest("[data-lightbox-close]")) close();
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
            `<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-4 py-2 border-b border-primary/10 last:border-0"><span class="font-body-md text-body-md text-on-surface-variant">${label}</span><span class="font-label-md text-label-md text-on-surface sm:shrink-0 sm:text-right">${value}</span></div>`
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

    // Formulaire en 3 étapes : (1) classe, (2) informations, (3) frais +
    // validation. Le détail des frais n'apparaît qu'à l'étape 3, une fois
    // les étapes 1 et 2 validées — jamais avant, et jamais sur une simple
    // sélection de classe.
    const steps = {
      1: document.querySelector('[data-step="1"]'),
      2: document.querySelector('[data-step="2"]'),
      3: document.querySelector('[data-step="3"]'),
    };
    const step1NextBtn = document.querySelector("[data-step1-next]");
    const step2NextBtn = document.querySelector("[data-step2-next]");
    const step2BackBtn = document.querySelector("[data-step2-back]");
    const step3BackBtn = document.querySelector("[data-step3-back]");
    if (!steps[1] || !steps[2] || !steps[3] || !step1NextBtn || !step2NextBtn) return;

    function setStep(step) {
      Object.entries(steps).forEach(([key, el]) => el.classList.toggle("hidden", Number(key) !== step));
      document.querySelectorAll("[data-step-indicator-badge]").forEach((badge) => {
        const active = Number(badge.getAttribute("data-step-indicator-badge")) === step;
        badge.classList.toggle("bg-primary", active);
        badge.classList.toggle("text-on-primary", active);
        badge.classList.toggle("bg-surface-variant", !active);
        badge.classList.toggle("text-on-surface-variant", !active);
      });
      document.querySelectorAll("[data-step-indicator-label]").forEach((label) => {
        const active = Number(label.getAttribute("data-step-indicator-label")) === step;
        label.classList.toggle("text-primary", active);
        label.classList.toggle("text-on-surface-variant", !active);
      });
      steps[step].scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function validateStep(stepEl) {
      const fields = stepEl.querySelectorAll("input, select, textarea");
      for (const field of fields) {
        if (!field.checkValidity()) {
          field.reportValidity();
          return false;
        }
      }
      return true;
    }

    step1NextBtn.addEventListener("click", () => {
      if (!validateStep(steps[1])) return;
      setStep(2);
    });

    step2NextBtn.addEventListener("click", () => {
      if (!validateStep(steps[2])) return;
      const checked = document.querySelector("[data-pricing-trigger]:checked");
      panel.innerHTML = checked.value === "creche" ? renderCreche() : renderSchool(checked.value);
      setStep(3);
    });

    if (step2BackBtn) {
      step2BackBtn.addEventListener("click", () => setStep(1));
    }
    if (step3BackBtn) {
      step3BackBtn.addEventListener("click", () => setStep(2));
    }
  }

})();
