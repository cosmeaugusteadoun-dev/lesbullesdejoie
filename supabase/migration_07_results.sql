-- =========================================================================
-- Les Bulles de Joie — migration 07
-- À exécuter dans Supabase Dashboard > SQL Editor > New query (nouvel onglet
-- vide). Crée les tables de la page "Résultats & Distinctions" : palmarès du
-- personnel (staff_distinctions) et tableaux de félicitations/encouragements/
-- projets de classe par classe (class_recognitions).
-- =========================================================================

create table if not exists public.staff_distinctions (
  id uuid primary key default gen_random_uuid(),
  rank int not null,
  staff_name text not null,
  role_label text not null,
  photo_url text,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

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
