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

-- ---- Messages de contact -----------------------------------------------------
-- Messages envoyés depuis le formulaire de contact.html, en plus de l'envoi
-- Netlify Forms (email de notification), pour qu'ils apparaissent aussi dans
-- l'espace admin.
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  phone text not null,
  email text,
  message text not null,
  handled boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

drop policy if exists "Public can submit contact_messages" on public.contact_messages;
create policy "Public can submit contact_messages"
  on public.contact_messages for insert
  with check (true);

drop policy if exists "Authenticated read contact_messages" on public.contact_messages;
create policy "Authenticated read contact_messages"
  on public.contact_messages for select
  using (auth.role() = 'authenticated');

drop policy if exists "Authenticated update contact_messages" on public.contact_messages;
create policy "Authenticated update contact_messages"
  on public.contact_messages for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated delete contact_messages" on public.contact_messages;
create policy "Authenticated delete contact_messages"
  on public.contact_messages for delete
  using (auth.role() = 'authenticated');

-- ---- Demandes d'accès aux tarifs ---------------------------------------------
-- Nom + téléphone laissés sur tarifs.html avant d'accéder au détail des frais,
-- en plus de l'envoi Netlify Forms, pour permettre à l'école de relancer ces
-- personnes depuis l'espace admin.
create table if not exists public.pricing_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  handled boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.pricing_requests enable row level security;

drop policy if exists "Public can submit pricing_requests" on public.pricing_requests;
create policy "Public can submit pricing_requests"
  on public.pricing_requests for insert
  with check (true);

drop policy if exists "Authenticated read pricing_requests" on public.pricing_requests;
create policy "Authenticated read pricing_requests"
  on public.pricing_requests for select
  using (auth.role() = 'authenticated');

drop policy if exists "Authenticated update pricing_requests" on public.pricing_requests;
create policy "Authenticated update pricing_requests"
  on public.pricing_requests for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated delete pricing_requests" on public.pricing_requests;
create policy "Authenticated delete pricing_requests"
  on public.pricing_requests for delete
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
-- Tableaux de félicitations / encouragements / projets de classe, par classe.
create table if not exists public.class_recognitions (
  id uuid primary key default gen_random_uuid(),
  class_key text not null check (class_key in ('creche', 'prematernelle', 'maternelle1', 'maternelle2', 'ci', 'cp', 'ce1', 'ce2', 'cm1')),
  category text not null check (category in ('felicitation', 'encouragement', 'projet_classe')),
  rank int not null,
  student_name text not null,
  photo_url text,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.class_recognitions enable row level security;

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

-- Aucun article de démonstration n'est inséré ici : les articles de blog
-- sont entièrement gérés depuis l'onglet Blog de l'espace admin.
