-- =========================================================================
-- Les Bulles de Joie — migration 02
-- À exécuter dans Supabase Dashboard > SQL Editor > New query
-- (votre projet a déjà les tables testimonials/blog_posts — ce script
-- ajoute seulement les tables "teachers" et "inscriptions", sans toucher
-- ni dupliquer les données existantes. Rejouable sans erreur grâce aux
-- "drop policy if exists" avant chaque création de policy.)
-- =========================================================================

create extension if not exists "pgcrypto";

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

drop policy if exists "Public can submit inscriptions" on public.inscriptions;
create policy "Public can submit inscriptions"
  on public.inscriptions for insert
  with check (true);

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
