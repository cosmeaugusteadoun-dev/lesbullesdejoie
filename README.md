# Les Bulles de Joie — Site vitrine

Site HTML / Tailwind CSS / SCSS / JS vanilla pour l'école Les Bulles de Joie (crèche, garderie, prématernelle, maternelle et primaire bilingue, depuis 2017), avec un espace d'administration Supabase pour gérer le blog et les témoignages sans toucher au code.

## Structure

```
├── index.html               Accueil (carrousel héros, cycles, témoignages défilants)
├── pedagogie.html            Mission, atouts, devise et détail des cycles
├── vie-scolaire.html         Journée type, activités extrascolaires, photos
├── admissions.html           Étapes d'admission + pièces à fournir
├── contact.html               Formulaire de contact, adresse, téléphone, horaires
├── galerie.html                Galerie photo filtrable + lightbox
├── blog.html                   Actualités filtrables par catégorie
├── inscription.html            Pré-inscription avec détail des frais par classe
├── merci.html                   Page de remerciement après envoi d'un formulaire
├── 404.html                      Page d'erreur personnalisée
├── admin/
│   ├── login.html                 Connexion (email/mot de passe Supabase)
│   ├── dashboard.html              Dossiers d'inscription, témoignages, blog, enseignants
│   └── admin.js
├── assets/images/               Logo + photos (optimisées pour le web)
├── src/
│   ├── css/tailwind.css          Point d'entrée Tailwind
│   └── scss/main.scss            Styles custom (bulles, marquee, animations, formulaires…)
├── css/                          CSS compilé (généré, ne pas éditer à la main)
├── js/
│   ├── main.js                    Menu mobile, scroll reveal, lightbox, formulaires, tarifs d'inscription
│   ├── inscription.js              Envoi du formulaire de pré-inscription (Netlify + Supabase + contact enseignant)
│   ├── dynamic-content.js          Charge témoignages/blog depuis Supabase (avec repli statique)
│   └── supabase-config.js          Identifiants du projet Supabase (à compléter)
├── supabase/
│   ├── schema.sql                  Script complet (installation depuis zéro)
│   └── migration_02_inscriptions_teachers.sql   À exécuter si testimonials/blog_posts existent déjà
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
- suivre et mettre à jour l'état des **dossiers de pré-inscription** (Nouveau → Contacté → Visite planifiée → Accepté/Refusé) ;
- gérer les **témoignages** et les **articles de blog** affichés sur le site ;
- renseigner le **contact de l'enseignant de chaque classe** — automatiquement montré au parent juste après l'envoi de sa pré-inscription.

### Mise en place (une seule fois, ~10 minutes)

1. **Créer le projet** : sur [supabase.com](https://supabase.com), créez un compte puis un nouveau projet (gratuit).
2. **Créer les tables** : dans le dashboard Supabase → *SQL Editor* → *New query*, collez tout le contenu de [`supabase/schema.sql`](supabase/schema.sql) et exécutez-le. Cela crée les 4 tables (`testimonials`, `blog_posts`, `teachers`, `inscriptions`), active la sécurité (RLS) et insère les contenus déjà présents sur le site en données de départ.
   - *Si vous avez déjà exécuté une version précédente de ce script* (tables `testimonials`/`blog_posts` existantes) : exécutez seulement [`supabase/migration_02_inscriptions_teachers.sql`](supabase/migration_02_inscriptions_teachers.sql) à la place, pour ajouter les tables `teachers` et `inscriptions` sans dupliquer vos données déjà en place.
3. **Créer votre compte admin** : *Authentication → Users → Add user*, renseignez l'email et le mot de passe qui serviront à vous connecter sur `/admin/login.html`. C'est la seule "porte" : sans compte créé ici, personne ne peut modifier le contenu, même en connaissant les clés du site.
4. **Récupérer les identifiants** : *Project Settings → API*, copiez **Project URL** et la clé **anon / public**.
5. **Configurer le site** : ouvrez [`js/supabase-config.js`](js/supabase-config.js) et remplacez les deux valeurs par celles de votre projet.
6. Redéployez (ou rechargez en local).
7. **Renseignez les enseignants** : dans l'onglet *Enseignants* de `/admin/dashboard.html`, ajoutez un contact (nom, téléphone, email) pour chaque classe. Tant qu'une classe n'a pas de contact renseigné, le parent voit un message générique renvoyant vers le secrétariat (01 97 91 94 52) au lieu du nom de l'enseignant.

**Sécurité** : la clé "anon" est publique par conception (visible dans le code du navigateur) — ce n'est pas un secret. La vraie protection vient des règles *Row Level Security* définies dans `schema.sql` : le grand public peut *lire* le contenu publié et *déposer* une pré-inscription, mais seule une personne connectée avec un compte que vous avez créé peut lire les dossiers des familles, les modifier ou gérer le blog/témoignages/enseignants.

**Repli automatique** : tant que `supabase-config.js` contient les valeurs par défaut, le site fonctionne comme avant (contenu statique, formulaire d'inscription qui n'enregistre que via Netlify) — aucune dépendance bloquante.

## Informations à finaliser

Quelques éléments nécessitent une information de votre part avant la mise en ligne définitive :

- **Ville / pays de l'école** : `contact.html` affiche l'adresse telle que fournie (Quartier Zongo 2, près de l'ANPE, après Kobourou City Hôtel) mais sans ville — à ajouter pour la clarté, et pour permettre une carte Google Maps / OpenStreetMap précise (un lien Google Maps ou des coordonnées GPS suffisent).
- **Email de contact** : aucun email n'apparaît sur les documents fournis ; le site n'en affiche donc pas pour l'instant. À communiquer si vous en avez un.
- **Horaires maternelle/primaire** : seuls les horaires de la crèche (7h–19h, samedi 8h–17h) étaient fournis ; `vie-scolaire.html` utilise des horaires de journée type à titre indicatif — à confirmer.
- **Réseaux sociaux** : liens du footer actuellement en `#`, à connecter aux vrais comptes.
- **Mentions Légales / Plan du site** : liens présents dans le footer mais pages non créées (hors périmètre demandé).

## Notes techniques

- Les polices (Quicksand, Inter, Material Symbols) sont chargées depuis Google Fonts.
- Les images ont été recompressées et redimensionnées pour rester légères.
- L'effet d'apparition au scroll (`data-reveal`) est purement progressif : sans JavaScript, tout le contenu reste visible normalement.
- Les tarifs de scolarité ne figurent dans aucune page publique : ils sont injectés par `js/main.js` uniquement après qu'un parent sélectionne la classe de son enfant sur `inscription.html` (voir la fonction `initInscriptionPricing`).
