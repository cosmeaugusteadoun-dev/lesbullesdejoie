-- =========================================================================
-- Les Bulles de Joie — migration 11
-- À exécuter dans Supabase Dashboard > SQL Editor > New query (nouvel onglet
-- vide). Crée la table des messages envoyés depuis le formulaire de contact
-- (contact.html), pour qu'ils apparaissent aussi dans l'espace admin en plus
-- de l'envoi Netlify Forms existant.
-- =========================================================================

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
