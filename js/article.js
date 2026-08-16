/**
 * Page article (article.html?id=<uuid> pour un article Supabase, ou
 * article.html?slug=<slug> pour l'un des articles d'exemple statiques,
 * utilisés tant que Supabase n'est pas configuré).
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

// Articles d'exemple, utilisés hors-ligne (Supabase non configuré) ou pour
// les cartes statiques du blog dupliquées dans blog.html.
const STATIC_ARTICLES = {
  "montessori-maison": {
    title: "La méthode Montessori à la maison",
    category: "Pédagogie",
    icon: "local_florist",
    date: "2024-05-15",
    content: `La pédagogie Montessori ne s'arrête pas aux portes de la classe. À la maison, quelques ajustements simples suffisent pour prolonger cet esprit d'autonomie et de curiosité que nous cultivons chaque jour aux Bulles de Joie.

La première étape consiste à adapter l'environnement à la taille de l'enfant : une étagère basse avec quelques jeux soigneusement choisis, un porte-manteau à sa hauteur, un marchepied devant le lavabo. Ces petits aménagements permettent à l'enfant de faire seul ce qu'il a envie de faire, sans dépendre systématiquement d'un adulte.

Ensuite, privilégiez la qualité à la quantité : mieux vaut cinq activités que l'enfant peut choisir et ranger lui-même que vingt jouets entassés dans un bac. Les activités de vie pratique — verser de l'eau, plier du linge, préparer une collation — sont d'excellents points de départ, accessibles et valorisantes.

Enfin, laissez du temps. L'enfant a besoin de répéter un geste plusieurs fois pour le maîtriser et en tirer une vraie satisfaction. Résister à l'envie de l'aider trop vite est souvent le plus grand défi... et le plus beau cadeau que l'on puisse lui faire.`,
  },
  "fete-printemps": {
    title: "Fête du Printemps : Retour en images",
    category: "Vie Scolaire",
    icon: "celebration",
    date: "2024-05-02",
    content: `Le soleil était au rendez-vous pour notre traditionnelle Fête du Printemps, et les enfants n'ont pas boudé leur plaisir ! Toute la matinée a été rythmée par des ateliers en plein air : peinture géante, chasse aux couleurs dans le jardin, et un grand jeu de piste coopératif imaginé par nos enseignants.

Les plus petits ont profité d'un coin sensoriel avec sable, eau et plantations, pendant que les classes de primaire s'affrontaient dans des jeux d'équipe autour de la motricité et de l'entraide plutôt que de la compétition.

Un grand merci aux parents qui ont participé à l'organisation et à la préparation du goûter partagé qui a clôturé cette belle journée. Ces moments de vie collective sont précieux : ils permettent aux enfants de toutes les classes de se retrouver, de coopérer et de partager la joie simple d'une journée ensoleillée entre amis.

Rendez-vous est déjà pris pour l'année prochaine !`,
  },
  "menus-bio": {
    title: "Nouveaux menus bio à la cantine",
    category: "Nutrition",
    icon: "restaurant",
    date: "2024-04-28",
    content: `Depuis ce trimestre, notre cantine propose de nouveaux menus élaborés autour de produits bio et, autant que possible, locaux. Cette évolution s'inscrit dans notre volonté d'offrir aux enfants une alimentation saine, qui accompagne leur croissance et leur concentration tout au long de la journée.

Chaque semaine, les menus alternent légumes de saison, céréales complètes et protéines variées, avec une attention particulière portée à la réduction du gaspillage alimentaire. Les portions sont adaptées à l'âge de chaque groupe, de la crèche au primaire.

Nous travaillons également à sensibiliser les enfants au goût et à la provenance des aliments à travers de petits ateliers de découverte : reconnaître un légume, comprendre d'où vient le pain, ou participer à la préparation d'une collation simple. Manger devient ainsi un moment d'apprentissage autant que de plaisir.

Le détail des menus de la semaine est disponible auprès du secrétariat pour toute question ou allergie alimentaire à signaler.`,
  },
  "portes-ouvertes": {
    title: "Portes ouvertes : notez la date !",
    category: "Événements",
    icon: "event",
    date: "2024-04-20",
    content: `Vous hésitez encore sur l'école qui accompagnera votre enfant à la rentrée prochaine ? Notre journée portes ouvertes est l'occasion idéale de venir découvrir Les Bulles de Joie dans une ambiance conviviale et sans engagement.

Au programme : visite libre de nos espaces (crèche, prématernelle, maternelle et primaire), rencontre avec les enseignants de chaque classe, présentation de notre projet pédagogique bilingue, et un temps d'échange convivial pour répondre à toutes vos questions sur les admissions et les tarifs.

Les enfants seront aussi les bienvenus : plusieurs ateliers leur seront proposés pendant que vous échangez avec notre équipe, pour qu'ils se fassent une première idée de l'ambiance de l'école.

Pour connaître la date exacte et vous inscrire, contactez notre secrétariat au 01 97 91 94 52 ou via notre page Contact. Nous avons hâte de vous accueillir !`,
  },
  "bilinguisme-precoce": {
    title: "Le bilinguisme précoce, pourquoi ça marche",
    category: "Pédagogie",
    icon: "psychology",
    date: "2024-04-10",
    content: `Aux Bulles de Joie, toutes nos classes sont bilingues, et la prématernelle est même enseignée exclusivement en anglais. Une question revient souvent chez les parents : n'est-ce pas trop tôt pour le développement du langage de l'enfant ? La recherche est pourtant claire sur ce point : plus l'exposition à une seconde langue commence tôt, plus elle s'intègre naturellement, sans effort de traduction mentale.

Les jeunes enfants disposent d'une plasticité cérébrale exceptionnelle qui leur permet d'absorber plusieurs systèmes linguistiques en parallèle, un peu comme ils apprennent à marcher ou à reconnaître les visages : par imprégnation et répétition, dans un cadre ludique et sécurisant.

Au-delà de la langue elle-même, le bilinguisme précoce stimule des compétences transversales précieuses : la flexibilité cognitive, la capacité à résoudre des problèmes sous plusieurs angles, et une ouverture naturelle à d'autres cultures.

Notre rôle est de créer un environnement où l'anglais et le français sont vécus comme des outils de communication vivants — à travers les chansons, les jeux, les histoires — plutôt que comme une matière scolaire abstraite. C'est ce qui fait, selon nous, toute la différence.`,
  },
  "salle-motricite": {
    title: "Une nouvelle salle de motricité pour les tout-petits",
    category: "Vie Scolaire",
    icon: "groups",
    date: "2024-04-02",
    content: `Cette année, notre crèche s'est dotée d'une toute nouvelle salle de motricité, pensée spécifiquement pour les besoins des tout-petits de 2 mois à 3 ans. Tapis moelleux, structures à escalader sécurisées, tunnels et parcours d'équilibre : chaque élément a été choisi pour accompagner les grandes étapes du développement moteur, du premier retournement aux premiers pas assurés.

Le mouvement libre est au cœur de notre approche : plutôt que d'installer un enfant dans une posture qu'il n'a pas encore acquise seul, nous préférons lui laisser le temps et l'espace nécessaires pour progresser à son propre rythme, en toute sécurité et sous le regard bienveillant de nos professionnels de la petite enfance.

Cet espace est utilisé quotidiennement, en petits groupes, pour des séances encadrées qui favorisent aussi bien la confiance en soi que la socialisation entre les enfants.

Nous sommes ravis de voir déjà les tout-petits s'y épanouir, rire et progresser un peu plus chaque jour !`,
  },
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
    img.className = "absolute inset-0 w-full h-full object-cover";
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
  const slug = params.get("slug");

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

  if (slug && STATIC_ARTICLES[slug]) {
    render(STATIC_ARTICLES[slug]);
    return;
  }

  showNotFound();
}

init();
