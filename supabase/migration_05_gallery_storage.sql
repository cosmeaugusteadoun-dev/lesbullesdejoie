-- =========================================================================
-- Les Bulles de Joie — migration 05
-- À exécuter dans Supabase Dashboard > SQL Editor > New query (nouvel onglet
-- vide). Crée le bucket de stockage "gallery" (photos & vidéos envoyées
-- directement depuis l'espace admin) et ses règles d'accès.
-- Nécessite d'avoir déjà exécuté migration_04_stats_gallery.sql (table
-- gallery_items).
-- =========================================================================

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
