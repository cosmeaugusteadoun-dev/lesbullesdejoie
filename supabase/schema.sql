-- =========================================================================
-- Les Bulles de Joie — schéma Supabase
-- À exécuter une fois dans : Supabase Dashboard > SQL Editor > New query
-- =========================================================================

create extension if not exists "pgcrypto";

-- ---- Témoignages --------------------------------------------------------
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  author_role text not null,          -- ex: "Maman de Chloé, Primaire"
  quote text not null,
  initial text not null,               -- lettre affichée dans l'avatar rond
  color text not null default 'primary' check (color in ('primary', 'secondary', 'tertiary')),
  published boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---- Articles de blog -----------------------------------------------------
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  excerpt text not null,
  content text,                                -- texte complet, affiché sur article.html
  category text not null check (category in ('Pédagogie', 'Vie Scolaire', 'Nutrition', 'Événements')),
  icon text not null default 'auto_stories',  -- nom d'icône Material Symbols
  image_url text,                              -- photo de couverture (URL publique, envoyée depuis l'admin)
  published_date date not null default current_date,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

-- Ajoute les colonnes si la table existait déjà avant cette version du script.
alter table public.blog_posts add column if not exists content text;
alter table public.blog_posts add column if not exists image_url text;

-- ---- Row Level Security ---------------------------------------------------
alter table public.testimonials enable row level security;
alter table public.blog_posts enable row level security;

-- Le grand public (clé "anon") ne peut lire que les entrées publiées.
drop policy if exists "Public reads published testimonials" on public.testimonials;
create policy "Public reads published testimonials"
  on public.testimonials for select
  using (published = true);

drop policy if exists "Public reads published blog_posts" on public.blog_posts;
create policy "Public reads published blog_posts"
  on public.blog_posts for select
  using (published = true);

-- Toute personne connectée (créée manuellement dans Authentication > Users,
-- c'est-à-dire l'administrateur de l'école) peut tout lire/créer/modifier/
-- supprimer. C'est la seule "porte" : sans compte créé par vous, personne
-- ne peut écrire, quelle que soit la clé utilisée côté site public.
drop policy if exists "Authenticated manage testimonials" on public.testimonials;
create policy "Authenticated manage testimonials"
  on public.testimonials for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated manage blog_posts" on public.blog_posts;
create policy "Authenticated manage blog_posts"
  on public.blog_posts for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ---- Enseignants (contact par classe) --------------------------------------
create table if not exists public.teachers (
  id uuid primary key default gen_random_uuid(),
  class_key text not null check (class_key in ('creche', 'prematernelle', 'maternelle1', 'maternelle2', 'ci', 'cp', 'ce1', 'ce2', 'cm1')),
  class_label text not null,          -- ex: "Maternelle 1"
  teacher_name text not null,
  phone text,
  email text,
  created_at timestamptz not null default now()
);

alter table public.teachers enable row level security;

-- Public en lecture : nécessaire pour afficher le contact de l'enseignant
-- au parent juste après sa pré-inscription, sans qu'il soit connecté.
drop policy if exists "Public reads teachers" on public.teachers;
create policy "Public reads teachers"
  on public.teachers for select
  using (true);

drop policy if exists "Authenticated manage teachers" on public.teachers;
create policy "Authenticated manage teachers"
  on public.teachers for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ---- Dossiers de pré-inscription --------------------------------------------
create table if not exists public.inscriptions (
  id uuid primary key default gen_random_uuid(),
  cycle text not null check (cycle in ('creche', 'prematernelle', 'maternelle1', 'maternelle2', 'ci', 'cp', 'ce1', 'ce2', 'cm1')),
  child_first_name text not null,
  child_last_name text not null,
  child_birth_date date,
  entry_term text,
  parent_first_name text not null,
  parent_last_name text not null,
  parent_email text not null,
  parent_phone text not null,
  message text,
  status text not null default 'nouveau' check (status in ('nouveau', 'contacte', 'visite_planifiee', 'accepte', 'refuse')),
  created_at timestamptz not null default now()
);

alter table public.inscriptions enable row level security;

-- N'importe quel visiteur (le parent, non connecté) peut déposer un dossier...
drop policy if exists "Public can submit inscriptions" on public.inscriptions;
create policy "Public can submit inscriptions"
  on public.inscriptions for insert
  with check (true);

-- ...mais seule une personne connectée (l'école) peut consulter, modifier le
-- statut ou supprimer les dossiers. Un parent ne peut donc jamais lire les
-- dossiers des autres familles.
drop policy if exists "Authenticated read inscriptions" on public.inscriptions;
create policy "Authenticated read inscriptions"
  on public.inscriptions for select
  using (auth.role() = 'authenticated');

drop policy if exists "Authenticated update inscriptions" on public.inscriptions;
create policy "Authenticated update inscriptions"
  on public.inscriptions for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated delete inscriptions" on public.inscriptions;
create policy "Authenticated delete inscriptions"
  on public.inscriptions for delete
  using (auth.role() = 'authenticated');

-- ---- Visites du site --------------------------------------------------------
create table if not exists public.page_views (
  id uuid primary key default gen_random_uuid(),
  page text not null,
  viewed_at timestamptz not null default now()
);

alter table public.page_views enable row level security;

drop policy if exists "Public can log a page view" on public.page_views;
create policy "Public can log a page view"
  on public.page_views for insert
  with check (true);

drop policy if exists "Authenticated read page_views" on public.page_views;
create policy "Authenticated read page_views"
  on public.page_views for select
  using (auth.role() = 'authenticated');

drop policy if exists "Authenticated delete page_views" on public.page_views;
create policy "Authenticated delete page_views"
  on public.page_views for delete
  using (auth.role() = 'authenticated');

-- ---- Galerie (photos & vidéos) ----------------------------------------------
create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  media_type text not null check (media_type in ('image', 'video')),
  category text not null check (category in ('creche', 'maternelle', 'primaire', 'vie-scolaire')),
  file_path text not null,
  caption text,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.gallery_items enable row level security;

drop policy if exists "Public reads published gallery_items" on public.gallery_items;
create policy "Public reads published gallery_items"
  on public.gallery_items for select
  using (published = true);

drop policy if exists "Authenticated manage gallery_items" on public.gallery_items;
create policy "Authenticated manage gallery_items"
  on public.gallery_items for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ---- Stockage des photos & vidéos (envoyées depuis l'espace admin) ---------
insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do nothing;

drop policy if exists "Public read gallery bucket" on storage.objects;
create policy "Public read gallery bucket"
  on storage.objects for select
  using (bucket_id = 'gallery');

drop policy if exists "Authenticated upload gallery bucket" on storage.objects;
create policy "Authenticated upload gallery bucket"
  on storage.objects for insert
  with check (bucket_id = 'gallery' and auth.role() = 'authenticated');

drop policy if exists "Authenticated delete gallery bucket" on storage.objects;
create policy "Authenticated delete gallery bucket"
  on storage.objects for delete
  using (bucket_id = 'gallery' and auth.role() = 'authenticated');

-- ---- Résultats & Distinctions ----------------------------------------------
-- Palmarès du personnel (page résultats.html, section "Distinctions du personnel").
create table if not exists public.staff_distinctions (
  id uuid primary key default gen_random_uuid(),
  rank int not null,
  staff_name text not null,
  role_label text not null,
  photo_url text,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

-- Tableaux de félicitations / encouragements / projets de classe, par classe.
create table if not exists public.class_recognitions (
  id uuid primary key default gen_random_uuid(),
  class_key text not null check (class_key in ('creche', 'prematernelle', 'maternelle1', 'maternelle2', 'ci', 'cp', 'ce1', 'ce2', 'cm1')),
  category text not null check (category in ('felicitation', 'encouragement', 'projet_classe')),
  rank int not null,
  student_name text not null,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.staff_distinctions enable row level security;
alter table public.class_recognitions enable row level security;

drop policy if exists "Public reads published staff_distinctions" on public.staff_distinctions;
create policy "Public reads published staff_distinctions"
  on public.staff_distinctions for select
  using (published = true);

drop policy if exists "Authenticated manage staff_distinctions" on public.staff_distinctions;
create policy "Authenticated manage staff_distinctions"
  on public.staff_distinctions for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "Public reads published class_recognitions" on public.class_recognitions;
create policy "Public reads published class_recognitions"
  on public.class_recognitions for select
  using (published = true);

drop policy if exists "Authenticated manage class_recognitions" on public.class_recognitions;
create policy "Authenticated manage class_recognitions"
  on public.class_recognitions for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ---- Données de démarrage (reprend le contenu déjà présent sur le site) ---
-- Le "where not exists" rend ce bloc rejouable sans risque : les exemples ne
-- sont insérés que si la table est encore vide (premher lancement). Si vous
-- avez déjà des témoignages/articles (via l'admin ou un run précédent), ce
-- script ne les duplique pas.
insert into public.testimonials (author_name, author_role, quote, initial, color)
select * from (values
  ('Sophie M.', 'Maman de Chloé, Primaire', 'Une école extraordinaire où notre fille a pris confiance en elle. L''approche individualisée et la bienveillance de l''équipe pédagogique font toute la différence. Nous sommes ravis.', 'S', 'primary'),
  ('Thomas L.', 'Papa de Lucas, Maternelle', 'La transition de la crèche à la maternelle s''est faite en douceur. Les espaces sont magnifiques et pensés pour les enfants. Mon fils adore aller à l''école tous les matins.', 'T', 'secondary'),
  ('Camille D.', 'Maman de Hugo, Crèche', 'Un environnement d''apprentissage exceptionnel. Les activités proposées sont riches et variées. L''école offre vraiment un cadre premium pour l''épanouissement des enfants.', 'C', 'tertiary')
) as seed(author_name, author_role, quote, initial, color)
where not exists (select 1 from public.testimonials);

insert into public.blog_posts (title, excerpt, content, category, icon, published_date)
select * from (values
  ('Cultiver l''autonomie de votre enfant à la maison', 'Comment prolonger les apprentissages de l''école à la maison avec des activités simples et accessibles, adaptées à chaque âge.', 'L''autonomie ne s''arrête pas aux portes de la classe. À la maison, quelques ajustements simples suffisent pour prolonger cet esprit d''indépendance et de curiosité que nous cultivons chaque jour aux Bulles de Joie.

La première étape consiste à adapter l''environnement à la taille de l''enfant : une étagère basse avec quelques jeux soigneusement choisis, un porte-manteau à sa hauteur, un marchepied devant le lavabo. Ces petits aménagements permettent à l''enfant de faire seul ce qu''il a envie de faire, sans dépendre systématiquement d''un adulte.

Ensuite, privilégiez la qualité à la quantité : mieux vaut cinq activités que l''enfant peut choisir et ranger lui-même que vingt jouets entassés dans un bac. Les activités de vie pratique — verser de l''eau, plier du linge, préparer une collation — sont d''excellents points de départ, accessibles et valorisantes.

Enfin, laissez du temps. L''enfant a besoin de répéter un geste plusieurs fois pour le maîtriser et en tirer une vraie satisfaction. Résister à l''envie de l''aider trop vite est souvent le plus grand défi... et le plus beau cadeau que l''on puisse lui faire.', 'Pédagogie', 'local_florist', date '2024-05-15'),

  ('Journée Récréative : Retour en images', 'Une journée mémorable remplie de rires, de jeux coopératifs et d''ateliers créatifs en plein air.', 'Le soleil était au rendez-vous pour notre journée récréative, et les enfants n''ont pas boudé leur plaisir ! Toute la matinée a été rythmée par des ateliers en plein air : peinture géante, chasse aux couleurs dans le jardin, et un grand jeu de piste coopératif imaginé par nos enseignants.

Les plus petits ont profité d''un coin sensoriel avec sable, eau et plantations, pendant que les classes de primaire s''affrontaient dans des jeux d''équipe autour de la motricité et de l''entraide plutôt que de la compétition.

Un grand merci aux parents qui ont participé à l''organisation et à la préparation du goûter partagé qui a clôturé cette belle journée. Ces moments de vie collective sont précieux : ils permettent aux enfants de toutes les classes de se retrouver, de coopérer et de partager la joie simple d''une journée ensoleillée entre amis.

Rendez-vous est déjà pris pour la prochaine édition !', 'Vie Scolaire', 'celebration', date '2024-05-02'),

  ('Notre alimentation, pensée pour les enfants', 'Notre engagement pour une alimentation saine et équilibrée se renforce.', 'À la cantine des Bulles de Joie, nous portons une attention particulière à ce qui se retrouve dans l''assiette de vos enfants. Cette année, nos menus ont été retravaillés pour offrir une alimentation saine et équilibrée, pensée pour accompagner leur croissance et leur concentration tout au long de la journée.

Chaque semaine, les menus alternent légumes de saison, céréales complètes et protéines variées, avec une attention particulière portée à la réduction du gaspillage alimentaire. Les portions sont adaptées à l''âge de chaque groupe, de la crèche au primaire.

Nous travaillons également à sensibiliser les enfants au goût et à la provenance des aliments à travers de petits ateliers de découverte : reconnaître un légume, comprendre d''où vient le pain, ou participer à la préparation d''une collation simple. Manger devient ainsi un moment d''apprentissage autant que de plaisir.

Le détail des menus de la semaine est disponible auprès du secrétariat pour toute question ou allergie alimentaire à signaler.', 'Nutrition', 'restaurant', date '2024-04-28'),

  ('Portes ouvertes : notez la date !', 'Venez visiter nos locaux, rencontrer l''équipe pédagogique et découvrir notre projet éducatif en famille.', 'Vous hésitez encore sur l''école qui accompagnera votre enfant à la rentrée prochaine ? Notre journée portes ouvertes est l''occasion idéale de venir découvrir Les Bulles de Joie dans une ambiance conviviale et sans engagement.

Au programme : visite libre de nos espaces (crèche, prématernelle, maternelle et primaire), rencontre avec les enseignants de chaque classe, présentation de notre projet pédagogique bilingue, et un temps d''échange convivial pour répondre à toutes vos questions sur les admissions et les tarifs.

Les enfants seront aussi les bienvenus : plusieurs ateliers leur seront proposés pendant que vous échangez avec notre équipe, pour qu''ils se fassent une première idée de l''ambiance de l''école.

Pour connaître la date exacte et vous inscrire, contactez notre secrétariat au 01 97 91 94 52 ou via notre page Contact. Nous avons hâte de vous accueillir !', 'Événements', 'event', date '2024-04-20'),

  ('Le bilinguisme précoce, pourquoi ça marche', 'Les bénéfices cognitifs et sociaux d''un apprentissage bilingue dès le plus jeune âge, expliqués simplement.', 'Aux Bulles de Joie, toutes nos classes sont bilingues, et la prématernelle est même enseignée exclusivement en anglais. Une question revient souvent chez les parents : n''est-ce pas trop tôt pour le développement du langage de l''enfant ? La recherche est pourtant claire sur ce point : plus l''exposition à une seconde langue commence tôt, plus elle s''intègre naturellement, sans effort de traduction mentale.

Les jeunes enfants disposent d''une plasticité cérébrale exceptionnelle qui leur permet d''absorber plusieurs systèmes linguistiques en parallèle, un peu comme ils apprennent à marcher ou à reconnaître les visages : par imprégnation et répétition, dans un cadre ludique et sécurisant.

Au-delà de la langue elle-même, le bilinguisme précoce stimule des compétences transversales précieuses : la flexibilité cognitive, la capacité à résoudre des problèmes sous plusieurs angles, et une ouverture naturelle à d''autres cultures.

Notre rôle est de créer un environnement où l''anglais et le français sont vécus comme des outils de communication vivants — à travers les chansons, les jeux, les histoires — plutôt que comme une matière scolaire abstraite. C''est ce qui fait, selon nous, toute la différence.', 'Pédagogie', 'psychology', date '2024-04-10'),

  ('Une nouvelle salle de motricité pour les tout-petits', 'Retour sur l''aménagement de notre nouvel espace dédié au développement moteur des enfants de crèche.', 'Cette année, notre crèche s''est dotée d''une toute nouvelle salle de motricité, pensée spécifiquement pour les besoins des tout-petits de 2 mois à 3 ans. Tapis moelleux, structures à escalader sécurisées, tunnels et parcours d''équilibre : chaque élément a été choisi pour accompagner les grandes étapes du développement moteur, du premier retournement aux premiers pas assurés.

Le mouvement libre est au cœur de notre approche : plutôt que d''installer un enfant dans une posture qu''il n''a pas encore acquise seul, nous préférons lui laisser le temps et l''espace nécessaires pour progresser à son propre rythme, en toute sécurité et sous le regard bienveillant de nos professionnels de la petite enfance.

Cet espace est utilisé quotidiennement, en petits groupes, pour des séances encadrées qui favorisent aussi bien la confiance en soi que la socialisation entre les enfants.

Nous sommes ravis de voir déjà les tout-petits s''y épanouir, rire et progresser un peu plus chaque jour !', 'Vie Scolaire', 'groups', date '2024-04-02')
) as seed(title, excerpt, content, category, icon, published_date)
where not exists (select 1 from public.blog_posts);
