-- =========================================================================
-- Les Bulles de Joie — migration 12
-- À exécuter dans Supabase Dashboard > SQL Editor > New query (nouvel onglet
-- vide). Crée la table des demandes d'accès aux tarifs (tarifs.html : nom +
-- téléphone laissés avant d'accéder au détail des frais), pour qu'elles
-- apparaissent aussi dans l'espace admin en plus de l'envoi Netlify Forms.
-- =========================================================================

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
