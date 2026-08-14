-- =========================================================================
-- Les Bulles de Joie — migration 04
-- À exécuter dans Supabase Dashboard > SQL Editor > New query (nouvel onglet
-- vide — voir README si vous avez déjà eu une erreur "policy already exists"
-- par le passé).
-- Ajoute : le suivi des visites (page_views) et la galerie photos/vidéos
-- pilotée depuis l'admin (gallery_items).
-- =========================================================================

create extension if not exists "pgcrypto";

-- ---- Visites du site --------------------------------------------------------
create table if not exists public.page_views (
  id uuid primary key default gen_random_uuid(),
  page text not null,
  viewed_at timestamptz not null default now()
);

alter table public.page_views enable row level security;

-- N'importe quel visiteur peut enregistrer sa propre visite (insert-only,
-- aucune lecture possible depuis le site public).
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
  file_path text not null,     -- ex: assets/gallery/creche/creche-01.jpg
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
