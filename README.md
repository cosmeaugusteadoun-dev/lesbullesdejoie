# Les Bulles de Joie — Site vitrine

Site HTML / Tailwind CSS / SCSS / JS vanilla pour l'école Les Bulles de Joie (crèche, garderie, prématernelle, maternelle et primaire bilingue, depuis 2017), avec un espace d'administration Supabase pour gérer le blog et les témoignages sans toucher au code.

## Structure

```
├── index.html               Accueil (carrousel héros, cycles, témoignages défilants)
├── pedagogie.html            Mission, atouts, devise et détail des cycles
├── vie-scolaire.html         Journée type, activités extrascolaires, photos
├── activites-parascolaires.html  Détail de chaque activité parascolaire (texte + photos)
├── admissions.html           Étapes d'admission + pièces à fournir
├── contact.html               Formulaire de contact, adresse, téléphone, horaires
├── galerie.html                Galerie photo filtrable + lightbox
├── resultats.html               Résultats & Distinctions (palmarès, félicitations, projets de classe)
├── blog.html                   Actualités filtrables par catégorie
├── article.html                 Page d'un article complet ("Lire la suite")
├── inscription.html            Pré-inscription avec détail des frais par classe
├── merci.html                   Page de remerciement après envoi d'un formulaire
├── 404.html                      Page d'erreur personnalisée
├── admin/
│   ├── login.html                 Connexion (email/mot de passe Supabase, œil afficher/masquer)
│   ├── dashboard.html              Statistiques, dossiers, témoignages, blog, enseignants, galerie, résultats, compte
│   └── admin.js
├── assets/images/               Logo + photos du site (optimisées pour le web)
├── src/
│   ├── css/tailwind.css          Point d'entrée Tailwind
│   └── scss/main.scss            Styles custom (bulles, marquee, animations, formulaires…)
├── css/                          CSS compilé (généré, ne pas éditer à la main)
├── js/
│   ├── main.js                    Menu mobile, scroll reveal, lightbox (photo + vidéo), formulaires, tarifs d'inscription
│   ├── inscription.js              Envoi du formulaire de pré-inscription (Netlify + Supabase + contact enseignant)
│   ├── article.js                  Charge et affiche un article complet (Supabase ou contenu statique)
│   ├── gallery.js                  Charge la galerie (photos/vidéos) depuis Supabase, dont "Vidéos par cycle"
│   ├── results.js                  Charge la page Résultats & Distinctions depuis Supabase
│   ├── dynamic-content.js          Charge témoignages/blog depuis Supabase (avec repli statique)
│   ├── analytics.js                Enregistre une visite anonyme (page + date) pour les statistiques admin
│   ├── password-toggle.js          Icône "œil" afficher/masquer un mot de passe
│   └── supabase-config.js          Identifiants du projet Supabase (à compléter)
├── supabase/
│   ├── schema.sql                  Script complet (installation depuis zéro)
│   ├── migration_02_inscriptions_teachers.sql   Dossiers d'inscription + contacts enseignants
│   ├── migration_03_blog_content.sql            Texte complet des articles (colonne "content")
│   ├── migration_04_stats_gallery.sql           Statistiques de visites + galerie photos/vidéos
│   ├── migration_05_gallery_storage.sql          Stockage (bucket) pour l'envoi de photos/vidéos depuis l'admin
│   ├── migration_06_blog_image.sql               Photo de couverture des articles de blog
│   └── migration_07_results.sql                  Palmarès du personnel + félicitations/encouragements/projets de classe
├── tailwind.config.js
├── netlify.toml
└── package.json
```

## Développement local

```bash
npm install
npm run build     # build CSS une fois (Tailwind + SCSS)
npm run dev       # rebuild automatique à chaque modification (watch)
```

Puis ouvrez `index.html` avec un serveur statique, par exemple :

```bash
npx serve .
# ou
python -m http.server 8080
```

## Déploiement sur Netlify

1. Poussez ce dossier sur un dépôt Git (GitHub/GitLab/Bitbucket) ou déployez-le en glisser-déposer sur [app.netlify.com](https://app.netlify.com).
2. Réglages de build (déjà définis dans `netlify.toml`) :
   - **Build command** : `npm run build`
   - **Publish directory** : `.`
   - **Node version** : 20
3. Netlify installe les dépendances, régénère `css/style.css` et `css/custom.css`, puis publie le site.

### Formulaires (Netlify Forms)

`contact.html` et `inscription.html` sont configurés pour [Netlify Forms](https://docs.netlify.com/forms/setup/) : `data-netlify="true"`, champ caché `form-name`, honeypot anti-spam, redirection vers `merci.html`. Amélioration progressive en JS (envoi AJAX avec repli natif si JS indisponible). Les soumissions apparaissent automatiquement dans **Site settings → Forms** sous les noms `contact` et `inscription`.

Pour recevoir un **email à chaque nouvelle pré-inscription** (en plus du dossier visible dans l'espace admin, voir plus bas) : **Site settings → Forms → Form notifications → Add notification → Email notification**, choisissez le formulaire `inscription`, renseignez l'adresse email de l'école. C'est une case à cocher côté Netlify, rien à coder.

## Espace admin (Supabase)

Depuis `/admin/login.html`, sans toucher au code, l'école peut :
- consulter les **statistiques** de fréquentation (visites du jour, des 7 derniers jours, graphique en barres, répartition des dossiers par statut en donut) ;
- suivre et mettre à jour l'état des **dossiers de pré-inscription** (Nouveau → Contacté → Visite planifiée → Accepté/Refusé) ;
- gérer les **témoignages** et les **articles de blog** (extrait affiché sur la carte + texte complet affiché sur `article.html`, avec une **photo de couverture optionnelle envoyée directement depuis l'appareil** — sinon une icône par défaut est affichée) ;
- renseigner le **contact de l'enseignant de chaque classe** — automatiquement montré au parent juste après l'envoi de sa pré-inscription ;
- gérer la **galerie** (ajouter/dépublier/supprimer des photos et vidéos) ;
- gérer les **résultats** (palmarès du personnel, tableaux de félicitations/encouragements et projets de classe), affichés sur `resultats.html` ;
- **changer son mot de passe** à tout moment (onglet *Mon compte*).

### Mise en place (une seule fois, ~10 minutes)

1. **Créer le projet** : sur [supabase.com](https://supabase.com), créez un compte puis un nouveau projet (gratuit).
2. **Créer les tables** : dans le dashboard Supabase → *SQL Editor* → *New query* (un **onglet neuf et vide**, pour éviter d'accumuler d'anciens essais), collez tout le contenu de [`supabase/schema.sql`](supabase/schema.sql) et exécutez-le. Cela crée les 6 tables (`testimonials`, `blog_posts`, `teachers`, `inscriptions`, `page_views`, `gallery_items`), le bucket de stockage `gallery`, active la sécurité (RLS) et insère les contenus déjà présents sur le site en données de départ.
   - *Si vous avez déjà exécuté une version précédente de ce script* : exécutez plutôt, dans l'ordre et chacun dans un onglet neuf, [`migration_02_inscriptions_teachers.sql`](supabase/migration_02_inscriptions_teachers.sql), [`migration_03_blog_content.sql`](supabase/migration_03_blog_content.sql), [`migration_04_stats_gallery.sql`](supabase/migration_04_stats_gallery.sql), [`migration_05_gallery_storage.sql`](supabase/migration_05_gallery_storage.sql), [`migration_06_blog_image.sql`](supabase/migration_06_blog_image.sql) puis [`migration_07_results.sql`](supabase/migration_07_results.sql) — sans dupliquer vos données déjà en place.
3. **Créer votre compte admin** : *Authentication → Users → Add user*, renseignez l'email et le mot de passe qui serviront à vous connecter sur `/admin/login.html`. C'est la seule "porte" : sans compte créé ici, personne ne peut modifier le contenu, même en connaissant les clés du site. Vous pourrez changer ce mot de passe à tout moment depuis l'onglet *Mon compte* du tableau de bord.
4. **Récupérer les identifiants** : *Project Settings → API*, copiez **Project URL** et la clé **anon / public**.
5. **Configurer le site** : ouvrez [`js/supabase-config.js`](js/supabase-config.js) et remplacez les deux valeurs par celles de votre projet.
6. Redéployez (ou rechargez en local).
7. **Renseignez les enseignants** : dans l'onglet *Enseignants*, ajoutez un contact (nom, téléphone, email) pour chaque classe. Tant qu'une classe n'a pas de contact renseigné, le parent voit un message générique renvoyant vers le secrétariat (01 97 91 94 52) au lieu du nom de l'enseignant.

**Sécurité** : la clé "anon" est publique par conception (visible dans le code du navigateur) — ce n'est pas un secret. La vraie protection vient des règles *Row Level Security* définies dans `schema.sql` : le grand public peut *lire* le contenu publié, *déposer* une pré-inscription et *enregistrer sa propre visite* (statistiques), mais seule une personne connectée avec un compte que vous avez créé peut lire les dossiers des familles, consulter les statistiques ou gérer le blog/témoignages/enseignants/galerie.

**Repli automatique** : tant que `supabase-config.js` contient les valeurs par défaut, le site fonctionne comme avant (contenu statique, formulaire d'inscription qui n'enregistre que via Netlify) — aucune dépendance bloquante.

### Galerie : ajouter vos vraies photos et vidéos

Tout se passe depuis l'admin, aucun fichier à déposer manuellement dans le projet :

1. Dans `/admin/dashboard.html` → onglet **Galerie** → **Ajouter**.
2. Choisissez **Photo** ou **Vidéo**, la **catégorie** (Crèche / Maternelle / Primaire / Vie Scolaire — cette dernière pour les sorties pédagogiques, activités manuelles, anglais/art oratoire, projets de classe, jardinage, etc.).
3. Cliquez sur **Fichier** et sélectionnez directement la photo ou vidéo depuis l'appareil (téléphone, ordinateur…), ajoutez une légende si besoin, puis **Enregistrer**.
4. Le fichier est envoyé dans le stockage Supabase (bucket `gallery`) et l'élément apparaît aussitôt sur `galerie.html`, avec la même mise en page mosaïque et la lightbox (clic pour agrandir, vidéo lue avec le son).

**Limites** : 10 Mo max par photo, 50 Mo max par vidéo. **Format vidéo recommandé** : MP4 (H.264), pour une lecture fiable dans tous les navigateurs — compressez vos vidéos avant l'envoi si besoin.

Pour supprimer un média : bouton **Supprimer** dans l'admin — retire à la fois l'entrée du site et le fichier envoyé.

### Résultats & Distinctions

Depuis l'onglet **Résultats** de l'admin, gérez le palmarès du personnel (rang, nom, fonction, photo facultative) et les félicitations/encouragements/projets de classe (classe, catégorie, rang, nom complet de l'élève). Ces éléments s'affichent publiquement sur `resultats.html` avec le nom complet des élèves, tel que validé par l'école — pensez à vous assurer que les familles ont bien été informées avant publication.

## Informations à finaliser

Quelques éléments nécessitent une information de votre part avant la mise en ligne définitive :

- **Carte de localisation** : la carte insérée sur `contact.html` utilise une recherche Google Maps sur "Quartier Zongo 2, ANPE, Parakou, Bénin" — elle reste donc approximative (pas de coordonnées GPS exactes). Envoyez-moi un lien Google Maps ou des coordonnées GPS précises pour l'affiner.
- **Email de contact** : aucun email n'apparaît sur les documents fournis ; le site n'en affiche donc pas pour l'instant. À communiquer si vous en avez un.
- **Horaires maternelle/primaire** : seuls les horaires de la crèche (7h–19h, samedi 8h–17h) étaient fournis ; `vie-scolaire.html` utilise des horaires de journée type à titre indicatif — à confirmer.
- **Réseaux sociaux** : liens du footer actuellement en `#`, à connecter aux vrais comptes.
- **Mentions Légales / Plan du site** : liens présents dans le footer mais pages non créées (hors périmètre demandé).

## Notes techniques

- Les polices (Quicksand, Inter, Material Symbols) sont chargées depuis Google Fonts.
- Les images ont été recompressées et redimensionnées pour rester légères.
- L'effet d'apparition au scroll (`data-reveal`) est purement progressif : sans JavaScript, tout le contenu reste visible normalement.
- Les tarifs de scolarité ne figurent dans aucune page publique : ils sont injectés par `js/main.js` uniquement après qu'un parent sélectionne la classe de son enfant sur `inscription.html` (voir la fonction `initInscriptionPricing`).
