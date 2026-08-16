-- =========================================================================
-- Les Bulles de Joie — migration 06
-- À exécuter dans Supabase Dashboard > SQL Editor > New query (nouvel onglet
-- vide). Ajoute la colonne "image_url" à blog_posts, pour pouvoir envoyer
-- une photo de couverture (directement depuis l'appareil, dans l'admin)
-- pour chaque article de blog.
-- =========================================================================

alter table public.blog_posts add column if not exists image_url text;
