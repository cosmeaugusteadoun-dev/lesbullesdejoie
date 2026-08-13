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
  category text not null check (category in ('Pédagogie', 'Vie Scolaire', 'Nutrition', 'Événements')),
  icon text not null default 'auto_stories',  -- nom d'icône Material Symbols
  published_date date not null default current_date,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

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

insert into public.blog_posts (title, excerpt, category, icon, published_date)
select * from (values
  ('La méthode Montessori à la maison', 'Comment prolonger les apprentissages de l''école à la maison avec des activités simples et accessibles, adaptées à chaque âge.', 'Pédagogie', 'local_florist', date '2024-05-15'),
  ('Fête du Printemps : Retour en images', 'Une journée mémorable remplie de rires, de jeux coopératifs et d''ateliers créatifs en plein air.', 'Vie Scolaire', 'celebration', date '2024-05-02'),
  ('Nouveaux menus bio à la cantine', 'Notre engagement pour une alimentation saine, locale et respectueuse de l''environnement se renforce.', 'Nutrition', 'restaurant', date '2024-04-28'),
  ('Portes ouvertes : notez la date !', 'Venez visiter nos locaux, rencontrer l''équipe pédagogique et découvrir notre projet éducatif en famille.', 'Événements', 'event', date '2024-04-20'),
  ('Le bilinguisme précoce, pourquoi ça marche', 'Les bénéfices cognitifs et sociaux d''un apprentissage bilingue dès le plus jeune âge, expliqués simplement.', 'Pédagogie', 'psychology', date '2024-04-10'),
  ('Une nouvelle salle de motricité pour les tout-petits', 'Retour sur l''aménagement de notre nouvel espace dédié au développement moteur des enfants de crèche.', 'Vie Scolaire', 'groups', date '2024-04-02')
) as seed(title, excerpt, category, icon, published_date)
where not exists (select 1 from public.blog_posts);
